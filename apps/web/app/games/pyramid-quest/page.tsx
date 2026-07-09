'use client';
import SlotForge from '../_forge/SlotForge';
import { pyramidQuest } from '@casino/forge';

export default function PyramidQuestPage() {
  return <SlotForge manifest={pyramidQuest()} />;
}
