'use client';

import { useEffect, useState } from 'react';
import { getCustomizationLabels } from '@/lib/omni-sync';

/**
 * Resolve customization field key → display-name maps for a set of products,
 * merged into a single lookup. Results are cached (see getCustomizationLabels),
 * so re-renders and repeated product IDs don't trigger extra requests.
 */
export function useCustomizationLabels(productIds: string[]): Record<string, string> {
  // Stable primitive dependency — distinct, sorted IDs joined into one key
  const key = Array.from(new Set(productIds)).sort().join(',');
  const [labels, setLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    const ids = key ? key.split(',') : [];
    if (ids.length === 0) return;
    let cancelled = false;
    Promise.all(ids.map(getCustomizationLabels))
      .then((maps) => {
        if (!cancelled) setLabels(Object.assign({}, ...maps));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [key]);

  return labels;
}
