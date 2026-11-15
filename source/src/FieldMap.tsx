// SPDX-License-Identifier: Apache-2.0
// Codex assistance is acknowledged in docs/AI_DISCLOSURE.md.
import { useEffect, useRef, useState } from 'react';
import { circleMarker, map, tileLayer, type CircleMarker, type Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { REFERENCE_POINT, type Point } from './climate';
import type { Translate } from './fields';

export function FieldMap({ point, select, t }: { point: Point | null; select: (point: Point) => void; t: Translate }) {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<LeafletMap | null>(null);
  const pin = useRef<CircleMarker | null>(null);
  const initialPoint = useRef(point);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    const center = initialPoint.current ?? REFERENCE_POINT;
    const chart = map(container.current, { scrollWheelZoom: false, attributionControl: true })
      .setView([center.latitude, center.longitude], initialPoint.current ? 12 : 10);
    const tiles = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      referrerPolicy: 'strict-origin-when-cross-origin',
    });
    tiles.on('tileerror', () => setTileError(true));
    tiles.on('tileload', () => setTileError(false));
    tiles.addTo(chart);
    chart.on('click', event => {
      const { lat, lng } = event.latlng.wrap();
      select({ latitude: lat, longitude: lng });
    });
    instance.current = chart;
    return () => { chart.remove(); instance.current = null; pin.current = null; };
  }, [select]);

  useEffect(() => {
    const chart = instance.current;
    if (!chart) return;
    if (!point) {
      pin.current?.remove();
      pin.current = null;
      return;
    }
    const position: [number, number] = [point.latitude, point.longitude];
    pin.current ??= circleMarker(position, { radius: 9, weight: 3, color: '#fffdf8', fillColor: '#08665f', fillOpacity: 1, interactive: false }).addTo(chart);
    pin.current.setLatLng(position);
    if (!chart.getBounds().contains(position)) chart.setView(position, Math.max(chart.getZoom(), 12));
  }, [point, select]);

  return <>
    <div ref={container} className="field-map" role="region" aria-label={t('خريطة اختيار الأرض', 'Field location map')} dir="ltr" />
    {tileError && <p className="quiet" role="status">{t('بعض أجزاء الخريطة ما ظهرت. بتقدر تستخدم موقعك أو تدخل الإحداثيات.', 'Some map tiles are unavailable. You can use your location or enter coordinates.')}</p>}
  </>;
}
