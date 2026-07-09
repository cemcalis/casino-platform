'use client';
import SlotForge from '../_forge/SlotForge';
import { olympusStrikes } from '@casino/forge';

export default function OlympusStrikesPage() {
  return <SlotForge manifest={olympusStrikes()} />;
}
