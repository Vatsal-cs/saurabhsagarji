'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** True only after client hydration — for portal/SSR-mismatch guards. */
export function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
