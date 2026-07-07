'use client';
import SlotForge from '../_forge/SlotForge';
import { sugarRealm } from '@casino/forge';

export default function SugarRealmPage() {
  return <SlotForge manifest={sugarRealm()} />;
}
