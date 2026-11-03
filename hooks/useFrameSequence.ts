'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { emptySnapshot, getFrameResources } from '@/lib/fed3/resources';

export function useFrameSequence(mode: 'pending' | 'animated' | 'simple', mobile: boolean) {
  const resources = getFrameResources();
  const snapshot = useSyncExternalStore(resources.subscribe, resources.getSnapshot, () => emptySnapshot);
  useEffect(() => {
    if (mode === 'pending') return;
    return resources.acquire(mode === 'animated', mobile);
  }, [mode, mobile, resources]);
  return { resources, snapshot };
}
