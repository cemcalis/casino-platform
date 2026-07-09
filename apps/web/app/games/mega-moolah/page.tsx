'use client';
import SlotForge from '../_forge/SlotForge';
import { megaSavanna } from '@casino/forge';

export default function MegaSavannaPage() {
  return <SlotForge manifest={megaSavanna()} />;
}
