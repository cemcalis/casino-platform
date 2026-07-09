'use client';
import SlotForge from '../_forge/SlotForge';
import { luckySevens } from '@casino/forge';

export default function LuckySevensPage() {
  return <SlotForge manifest={luckySevens()} />;
}
