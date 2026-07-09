'use client';
import SlotForge from '../_forge/SlotForge';
import { crystalCaverns } from '@casino/forge';

export default function CrystalCavernsPage() {
  return <SlotForge manifest={crystalCaverns()} />;
}
