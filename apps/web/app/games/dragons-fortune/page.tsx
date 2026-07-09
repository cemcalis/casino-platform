'use client';
import SlotForge from '../_forge/SlotForge';
import { dragonsFortune } from '@casino/forge';

export default function DragonsFortunePage() {
  return <SlotForge manifest={dragonsFortune()} />;
}
