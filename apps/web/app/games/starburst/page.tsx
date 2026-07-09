'use client';
import SlotForge from '../_forge/SlotForge';
import { starPrism } from '@casino/forge';

export default function StarPrismPage() {
  return <SlotForge manifest={starPrism()} />;
}
