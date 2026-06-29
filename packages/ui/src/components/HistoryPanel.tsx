import React from 'react';
import { neonPalaceColors, spacing, typography } from '@casino/theme';

export interface HistoryEntry {
  roundId: string;
  bet: string;
  outcome: 'WIN' | 'LOSS';
  payout: string;
  timestamp: Date;
}

export interface HistoryPanelProps {
  entries: HistoryEntry[];
  loading?: boolean;
  maxRows?: number;
}

const cellStyle: React.CSSProperties = {
  padding: `${spacing['2']} ${spacing['3']}`,
  fontSize: typography.fontSize.xs,
  textAlign: 'left' as const,
  borderBottom: `1px solid ${neonPalaceColors.border.subtle}`,
  whiteSpace: 'nowrap' as const,
};

const headStyle: React.CSSProperties = {
  ...cellStyle,
  color: neonPalaceColors.text.secondary,
  fontWeight: typography.fontWeight.semibold,
  letterSpacing: typography.letterSpacing.wider,
  textTransform: 'uppercase' as const,
  borderBottom: `1px solid ${neonPalaceColors.border.default}`,
};

export function HistoryPanel({ entries, loading = false, maxRows = 10 }: HistoryPanelProps) {
  const rows = entries.slice(0, maxRows);

  return (
    <section
      aria-label="Round history"
      style={{
        backgroundColor: neonPalaceColors.bg.surface,
        border: `1px solid ${neonPalaceColors.border.subtle}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: `${spacing['3']} ${spacing['4']}`, borderBottom: `1px solid ${neonPalaceColors.border.subtle}` }}>
        <h3 style={{ margin: 0, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: neonPalaceColors.text.primary }}>
          Round History
        </h3>
      </div>

      {loading ? (
        <div aria-busy="true" style={{ padding: spacing['6'], textAlign: 'center', color: neonPalaceColors.text.muted, fontSize: typography.fontSize.sm }}>
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div style={{ padding: spacing['6'], textAlign: 'center', color: neonPalaceColors.text.muted, fontSize: typography.fontSize.sm }}>
          No rounds played yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Round', 'Bet', 'Result', 'Payout', 'Time'].map((h) => (
                  <th key={h} scope="col" style={headStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.roundId}>
                  <td style={{ ...cellStyle, color: neonPalaceColors.text.muted }}>{entry.roundId.slice(-6)}</td>
                  <td style={cellStyle}>{entry.bet}</td>
                  <td style={{ ...cellStyle, color: entry.outcome === 'WIN' ? neonPalaceColors.win.small : neonPalaceColors.text.secondary }}>
                    {entry.outcome}
                  </td>
                  <td style={{ ...cellStyle, color: entry.outcome === 'WIN' ? neonPalaceColors.gold['500'] : neonPalaceColors.text.secondary }}>
                    {entry.payout}
                  </td>
                  <td style={{ ...cellStyle, color: neonPalaceColors.text.muted }}>
                    {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
