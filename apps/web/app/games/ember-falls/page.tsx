'use client';
import SlotForge from '../_forge/SlotForge';
import { emberFalls } from '@casino/forge';

export default function EmberFallsPage() {
  return <SlotForge manifest={emberFalls()} />;
}
