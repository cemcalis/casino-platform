'use client';
import SlotForge from '../_forge/SlotForge';
import { pharaohsTreasure } from '@casino/forge';

export default function PharaohsTreasurePage() {
  return <SlotForge manifest={pharaohsTreasure()} />;
}
