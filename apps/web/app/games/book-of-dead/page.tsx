'use client';
import SlotForge from '../_forge/SlotForge';
import { tomeOfAnubis } from '@casino/forge';

export default function TomeOfAnubisPage() {
  return <SlotForge manifest={tomeOfAnubis()} />;
}
