'use client';
import SlotForge from '../_forge/SlotForge';
import { fruitFrenzy } from '@casino/forge';

export default function FruitFrenzyPage() {
  return <SlotForge manifest={fruitFrenzy()} />;
}
