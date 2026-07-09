'use client';
import SlotForge from '../_forge/SlotForge';
import { dragonFortune } from '@casino/forge';

export default function DragonFortunePage() {
  return <SlotForge manifest={dragonFortune()} />;
}
