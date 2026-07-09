'use client';
import SlotForge from '../_forge/SlotForge';
import { solarWilds } from '@casino/forge';

export default function SolarWildsPage() {
  return <SlotForge manifest={solarWilds()} />;
}
