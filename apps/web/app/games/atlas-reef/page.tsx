'use client';
import SlotForge from '../_forge/SlotForge';
import { atlasReef } from '@casino/forge';

export default function AtlasReefPage() {
  return <SlotForge manifest={atlasReef()} />;
}
