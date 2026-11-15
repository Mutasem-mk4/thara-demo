// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Point } from './climate';

export type LocationStatus = 'finding' | 'denied' | 'blocked' | 'unavailable' | 'timeout' | null;

function locationBlockedByPage() {
  const page = document as Document & { featurePolicy?: { allowsFeature: (name: string) => boolean } };
  return !window.isSecureContext || page.featurePolicy?.allowsFeature('geolocation') === false;
}

export function useDeviceLocation(onPosition: (point: Point) => void) {
  const [status, setStatus] = useState<LocationStatus>(null);
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => stop.current?.(), []);

  const cancel = useCallback(() => {
    stop.current?.();
    setStatus(null);
  }, []);

  function locate() {
    cancel();
    const device = navigator.geolocation;
    if (locationBlockedByPage() || !device) {
      setStatus('blocked');
      return;
    }

    let watchId: number | undefined;
    let active = true;
    let providerError = false;
    const finish = (next: LocationStatus) => {
      if (!active) return;
      cleanup();
      setStatus(next);
    };
    const timer = window.setTimeout(() => finish(providerError ? 'unavailable' : 'timeout'), 12000);
    function cleanup() {
      active = false;
      window.clearTimeout(timer);
      if (watchId !== undefined) device.clearWatch(watchId);
      stop.current = null;
    }
    stop.current = cleanup;
    setStatus('finding');

    try {
      watchId = device.watchPosition(
        ({ coords }) => {
          if (!active) return;
          finish(null);
          onPosition({ latitude: coords.latitude, longitude: coords.longitude });
        },
        error => {
          if (!active) return;
          if (error.code === 1) finish(locationBlockedByPage() ? 'blocked' : 'denied');
          if (error.code === 2) providerError = true;
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
      );
      if (!active) device.clearWatch(watchId);
    } catch {
      finish('unavailable');
    }
  }

  return { status, locate, cancel };
}
