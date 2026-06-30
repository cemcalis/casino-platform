import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database';
import { Prisma } from '@prisma/client';

// VIP tier thresholds (totalBet in VCOIN)
const TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const;
const TIER_MIN = [0, 1000, 10000, 50000];
type Tier = (typeof TIERS)[number];

function resolveTier(totalBet: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (totalBet >= TIER_MIN[i]!) return TIERS[i]!;
  }
  return 'BRONZE';
}

// Hardcoded defaults used when DB has no BonusConfig rows (dev / fresh DB)
const DEFAULTS = {
  WELCOME:  { baseAmount: new Prisma.Decimal(5000), expiresInDays: 30, cashbackPct: new Prisma.Decimal(0), tierMultipliers: { SILVER: 1, GOLD: 1, PLATINUM: 1 } },
  DAILY:    { baseAmount: new Prisma.Decimal(500),  expiresInDays: 1,  cashbackPct: new Prisma.Decimal(0), tierMultipliers: { SILVER: 2, GOLD: 4, PLATINUM: 10 } },
  CASHBACK: { baseAmount: new Prisma.Decimal(0),    expiresInDays: 7,  cashbackPct: new Prisma.Decimal(5), tierMultipliers: { SILVER: 1, GOLD: 1, PLATINUM: 1 } },
};

const CASHBACK_RATES: Record<Tier, number> = { BRONZE: 5, SILVER: 10, GOLD: 15, PLATINUM: 20 };

@Injectable()
export class BonusService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Internal helpers ────────────────────────────────────────────────────────

  private async getConfig(type: 'WELCOME' | 'DAILY' | 'CASHBACK') {
    const cfg = await this.prisma.bonusConfig.findUnique({ where: { type } });
    return cfg ?? { ...DEFAULTS[type], type, enabled: true, id: '' };
  }

  private async getUserTier(userId: string): Promise<Tier> {
    const agg = await this.prisma.gameSession.aggregate({
      where: { userId },
      _sum: { betAmount: true },
    });
    return resolveTier(Number(agg._sum.betAmount ?? 0));
  }

  private async creditWallet(
    tx: Prisma.TransactionClient,
    userId: string,
    amount: Prisma.Decimal,
    ref: string,
  ) {
    const wallet = await tx.wallet.findUnique({ where: { userId }, select: { id: true, balance: true, version: true } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    const newBalance = wallet.balance.add(amount);
    const updated = await tx.wallet.updateMany({
      where: { userId, version: wallet.version },
      data: { balance: newBalance, version: wallet.version + 1 },
    });
    if (updated.count === 0) throw new BadRequestException('Concurrent update — retry');
    await tx.ledgerEntry.create({
      data: { userId, type: 'CREDIT', amount, balanceBefore: wallet.balance, balanceAfter: newBalance, referenceId: ref },
    });
    return newBalance;
  }

  // ─── Welcome Bonus ───────────────────────────────────────────────────────────

  async claimWelcome(userId: string) {
    const cfg = await this.getConfig('WELCOME');
    if (!cfg.enabled) throw new BadRequestException('Welcome bonus is currently disabled');

    const existing = await this.prisma.userBonus.findFirst({ where: { userId, type: 'WELCOME' } });
    if (existing) throw new BadRequestException('Welcome bonus already claimed');

    const expiresAt = new Date(Date.now() + cfg.expiresInDays * 86400_000);

    const newBalance = await this.prisma.$transaction(async (tx) => {
      await tx.userBonus.create({ data: { userId, type: 'WELCOME', amount: cfg.baseAmount, claimedAt: new Date(), expiresAt } });
      return this.creditWallet(tx, userId, cfg.baseAmount, 'welcome-bonus');
    });

    return { balance: newBalance.toFixed(2), bonusAmount: cfg.baseAmount.toFixed(2), expiresAt };
  }

  // ─── Daily Bonus ─────────────────────────────────────────────────────────────

  async claimDailyBonus(userId: string) {
    const [cfg, tier] = await Promise.all([this.getConfig('DAILY'), this.getUserTier(userId)]);
    if (!cfg.enabled) throw new BadRequestException('Daily bonus is currently disabled');

    const mults = cfg.tierMultipliers as Record<string, number>;
    const mult = tier === 'BRONZE' ? 1 : (mults[tier] ?? 1);
    const amount = cfg.baseAmount.mul(mult);

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const newBalance = await this.prisma.$transaction(async (tx) => {
      const userUpdate = await tx.user.updateMany({
        where: { id: userId, OR: [{ lastBonusClaim: null }, { lastBonusClaim: { lt: todayUTC } }] },
        data: { lastBonusClaim: now },
      });
      if (userUpdate.count === 0) {
        const u = await tx.user.findUnique({ where: { id: userId }, select: { lastBonusClaim: true } });
        if (!u) throw new NotFoundException('User not found');
        const nextClaimAt = new Date(Date.UTC(u.lastBonusClaim!.getUTCFullYear(), u.lastBonusClaim!.getUTCMonth(), u.lastBonusClaim!.getUTCDate() + 1));
        throw new BadRequestException({ message: 'Daily bonus already claimed', nextClaimAt: nextClaimAt.toISOString() });
      }
      const expiresAt = new Date(Date.now() + cfg.expiresInDays * 86400_000);
      await tx.userBonus.create({ data: { userId, type: 'DAILY', amount, claimedAt: now, expiresAt } });
      return this.creditWallet(tx, userId, amount, 'daily-bonus');
    });

    const nextClaimAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    return { balance: newBalance.toFixed(2), bonusAmount: amount.toFixed(2), tier, nextClaimAt };
  }

  // ─── Cashback Bonus ──────────────────────────────────────────────────────────

  async claimCashback(userId: string) {
    const [cfg, tier] = await Promise.all([this.getConfig('CASHBACK'), this.getUserTier(userId)]);
    if (!cfg.enabled) throw new BadRequestException('Cashback bonus is currently disabled');

    const weekAgo = new Date(Date.now() - 7 * 86400_000);

    // Check if already claimed this week
    const recentClaim = await this.prisma.userBonus.findFirst({
      where: { userId, type: 'CASHBACK', claimedAt: { gte: weekAgo } },
    });
    if (recentClaim) throw new BadRequestException('Cashback already claimed this week');

    // Calculate net loss over the last 7 days
    const agg = await this.prisma.gameSession.aggregate({
      where: { userId, createdAt: { gte: weekAgo } },
      _sum: { betAmount: true, winAmount: true },
    });
    const totalBet = Number(agg._sum.betAmount ?? 0);
    const totalWon = Number(agg._sum.winAmount ?? 0);
    const netLoss = Math.max(0, totalBet - totalWon);
    if (netLoss <= 0) throw new BadRequestException('No eligible losses for cashback this week');

    const rate = Number(cfg.cashbackPct) > 0 ? Number(cfg.cashbackPct) : CASHBACK_RATES[tier];
    const cashbackAmount = new Prisma.Decimal((netLoss * rate) / 100).toDecimalPlaces(2);
    if (cashbackAmount.lte(0)) throw new BadRequestException('Cashback amount is zero');

    const expiresAt = new Date(Date.now() + cfg.expiresInDays * 86400_000);

    const newBalance = await this.prisma.$transaction(async (tx) => {
      await tx.userBonus.create({ data: { userId, type: 'CASHBACK', amount: cashbackAmount, claimedAt: new Date(), expiresAt } });
      return this.creditWallet(tx, userId, cashbackAmount, 'cashback-bonus');
    });

    return { balance: newBalance.toFixed(2), bonusAmount: cashbackAmount.toFixed(2), tier, rate, expiresAt };
  }

  // ─── Bonus Status ────────────────────────────────────────────────────────────

  async getBonusStatus(userId: string) {
    const [tier, welcomeCfg, dailyCfg, cashbackCfg] = await Promise.all([
      this.getUserTier(userId),
      this.getConfig('WELCOME'),
      this.getConfig('DAILY'),
      this.getConfig('CASHBACK'),
    ]);

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const weekAgo = new Date(Date.now() - 7 * 86400_000);

    const [welcomeBonus, user, cashbackClaim, weekAgg] = await Promise.all([
      this.prisma.userBonus.findFirst({ where: { userId, type: 'WELCOME' } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { lastBonusClaim: true } }),
      this.prisma.userBonus.findFirst({ where: { userId, type: 'CASHBACK', claimedAt: { gte: weekAgo } } }),
      this.prisma.gameSession.aggregate({ where: { userId, createdAt: { gte: weekAgo } }, _sum: { betAmount: true, winAmount: true } }),
    ]);

    const mults = dailyCfg.tierMultipliers as Record<string, number>;
    const dailyMult = tier === 'BRONZE' ? 1 : (mults[tier] ?? 1);
    const dailyAmount = dailyCfg.baseAmount.mul(dailyMult);
    const dailyClaimedToday = !!(user?.lastBonusClaim && user.lastBonusClaim >= todayUTC);
    const nextDailyAt = dailyClaimedToday && user?.lastBonusClaim
      ? new Date(Date.UTC(user.lastBonusClaim.getUTCFullYear(), user.lastBonusClaim.getUTCMonth(), user.lastBonusClaim.getUTCDate() + 1))
      : null;

    const netLoss = Math.max(0, Number(weekAgg._sum.betAmount ?? 0) - Number(weekAgg._sum.winAmount ?? 0));
    const cashbackRate = CASHBACK_RATES[tier];
    const cashbackEstimate = new Prisma.Decimal((netLoss * cashbackRate) / 100).toDecimalPlaces(2);

    return {
      tier,
      welcome: {
        enabled: welcomeCfg.enabled,
        claimed: !!welcomeBonus,
        amount: welcomeCfg.baseAmount.toFixed(2),
      },
      daily: {
        enabled: dailyCfg.enabled,
        claimedToday: dailyClaimedToday,
        amount: dailyAmount.toFixed(2),
        nextClaimAt: nextDailyAt?.toISOString() ?? null,
      },
      cashback: {
        enabled: cashbackCfg.enabled,
        claimedThisWeek: !!cashbackClaim,
        rate: cashbackRate,
        estimatedAmount: cashbackEstimate.toFixed(2),
        netLoss: netLoss.toFixed(2),
      },
    };
  }

  // ─── Admin config ────────────────────────────────────────────────────────────

  async getAdminConfig() {
    const [welcome, daily, cashback] = await Promise.all([
      this.getConfig('WELCOME'),
      this.getConfig('DAILY'),
      this.getConfig('CASHBACK'),
    ]);
    return { welcome, daily, cashback };
  }

  async updateAdminConfig(type: 'WELCOME' | 'DAILY' | 'CASHBACK', data: { enabled?: boolean; baseAmount?: number; cashbackPct?: number; expiresInDays?: number }) {
    const existing = await this.prisma.bonusConfig.findUnique({ where: { type } });
    const updateData: Record<string, unknown> = {};
    if (data.enabled !== undefined) updateData['enabled'] = data.enabled;
    if (data.baseAmount !== undefined) updateData['baseAmount'] = new Prisma.Decimal(data.baseAmount);
    if (data.cashbackPct !== undefined) updateData['cashbackPct'] = new Prisma.Decimal(data.cashbackPct);
    if (data.expiresInDays !== undefined) updateData['expiresInDays'] = data.expiresInDays;

    if (existing) {
      return this.prisma.bonusConfig.update({ where: { type }, data: updateData });
    }
    // Insert with defaults if row was never seeded
    const def = DEFAULTS[type];
    return this.prisma.bonusConfig.create({
      data: {
        type,
        enabled: updateData['enabled'] as boolean ?? true,
        baseAmount: updateData['baseAmount'] as Prisma.Decimal ?? def.baseAmount,
        cashbackPct: updateData['cashbackPct'] as Prisma.Decimal ?? def.cashbackPct,
        expiresInDays: updateData['expiresInDays'] as number ?? def.expiresInDays,
        tierMultipliers: def.tierMultipliers,
      },
    });
  }

  // ─── Recent bonuses (admin view) ─────────────────────────────────────────────

  async getRecentBonuses(page: number, pageSize: number) {
    const [total, items] = await Promise.all([
      this.prisma.userBonus.count(),
      this.prisma.userBonus.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { username: true, email: true } } },
      }),
    ]);
    return { items: items.map(b => ({ ...b, amount: b.amount.toFixed(2) })), total, page, pageSize };
  }
}
