'use client';
import SlotForge from '../_forge/SlotForge';
import { goldenVault } from '@casino/forge';

export default function GoldenVaultPage() {
  return <SlotForge manifest={goldenVault()} />;
}
