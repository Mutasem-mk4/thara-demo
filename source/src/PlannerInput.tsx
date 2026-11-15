// SPDX-License-Identifier: Apache-2.0
import { lazy, Suspense, useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { areas, type LocationChoice } from './fieldLocation';
import { cropProfiles } from './cropProfiles';
import { Field, Ltr, type Translate } from './fields';
import type { Language } from './evidence';
import type { SeasonOption, WaterInput } from './cropWater';
import { useDeviceLocation } from './useDeviceLocation';
import type { Point } from './climate';

const FieldMap = lazy(() => import('./FieldMap').then(module => ({ default: module.FieldMap })));
export const weekdays = [
  { ar: 'الأحد', en: 'Sunday' }, { ar: 'الاثنين', en: 'Monday' }, { ar: 'الثلاثاء', en: 'Tuesday' },
  { ar: 'الأربعاء', en: 'Wednesday' }, { ar: 'الخميس', en: 'Thursday' }, { ar: 'الجمعة', en: 'Friday' }, { ar: 'السبت', en: 'Saturday' },
] as const;
export type FieldInput = { point: LocationChoice | null; previous: string };

export function DayChoices({ selected, update, language, t }: { selected: number[]; update: (days: number[], state?: WaterInput['daysState']) => void; language: Language; t: Translate }) {
  return <fieldset className="day-choices"><legend>{t('بأي أيام بتتوفر الميّ؟', 'Which days is water available?')}</legend>
    <div className="day-buttons">{weekdays.map((day, index) => <label key={day.en}>
      <input type="checkbox" checked={selected.includes(index)} onChange={event => update(event.currentTarget.checked
        ? [...selected, index].sort() : selected.filter(chosen => chosen !== index))} />{day[language]}
    </label>)}</div>
    <button type="button" className="text-button" onClick={() => update([], 'unknown')}>{t('ما بعرف الأيام', 'I don’t know the days')}</button>
  </fieldset>;
}

export function FieldSetup({ field, area, areaState, update, updateArea, next, t, language }: {
  field: FieldInput; area: string; areaState?: WaterInput['areaState']; update: Dispatch<SetStateAction<FieldInput>>; updateArea: (area: string, state?: WaterInput['areaState']) => void;
  next: () => void; t: Translate; language: Language;
}) {
  const [mapOpen, setMapOpen] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [invalidPoint, setInvalidPoint] = useState(false);
  const choosePoint = useCallback((point: Point) => {
    update(current => ({ ...current, point: { latitude: Number(point.latitude.toFixed(3)), longitude: Number(point.longitude.toFixed(3)) } }));
    setInvalidPoint(false);
  }, [update]);
  const geo = useDeviceLocation(choosePoint);
  const locationMessage = geo.status === 'finding'
    ? t('بنبحث عن موقع الجهاز… بتقدر توقف البحث وتختار من الخريطة.', 'Finding your device… You can stop and choose on the map.')
    : geo.status ? t('تحديد الجهاز ما زبط. اختار المنطقة أو حدّد من الخريطة.', 'Device location is unavailable. Choose an area or use the map.') : '';
  return <section className="input-step">
    <header className="step-title"><p>{t('قطعتك', 'Your field')}</p><h1 id="page-title" tabIndex={-1}>{t('وين بدك تزرع؟', 'Where will you plant?')}</h1><p>{t('التقدير للخضار المكشوفة بمعاملات عامة. زراعة الدفيئات تحتاج نموذجًا مختلفًا.', 'The estimate uses generic profiles for open-field vegetables. Greenhouse production needs a different model.')}</p></header>
    <Field label={t('المنطقة', 'Area')}><select value={field.point?.area ?? (field.point ? 'custom' : '')} onChange={event => {
      const region = areas.find(entry => entry.id === event.currentTarget.value);
      if (region) { geo.cancel(); update({ ...field, point: { ...region.point, area: region.id } }); }
    }}><option value="" disabled>{t('اختار منطقة', 'Choose an area')}</option>
      {areas.map(region => <option key={region.id} value={region.id}>{region[language]}</option>)}
      {field.point && !field.point.area && <option value="custom">{t('نقطة حددتها', 'Your selected point')}</option>}
    </select></Field>
    <div className="inline-actions">
      <button type="button" aria-expanded={mapOpen} onClick={() => setMapOpen(!mapOpen)}>{t('حدّد من الخريطة', 'Choose on the map')}</button>
      <button type="button" onClick={geo.status === 'finding' ? geo.cancel : geo.locate}>{geo.status === 'finding' ? t('أوقف البحث', 'Stop locating') : t('استخدم موقعي', 'Use my location')}</button>
    </div>
    <p className="field-status" role="status">{locationMessage || (field.point?.area
      ? t('النقطة مرجع للمنطقة. بتقدر تعدّلها لمكان أرضك على الخريطة.', 'This is an area reference point. Adjust it on the map for your field.')
      : field.point ? <>{t('النقطة المختارة', 'Selected point')} <Ltr>{field.point.latitude}, {field.point.longitude}</Ltr></> : '')}</p>
    {mapOpen && <Suspense fallback={<p role="status">{t('بنحمّل الخريطة…', 'Loading the map…')}</p>}>
      <p className="muted">{t('كبّر الخريطة واضغط على أرضك.', 'Zoom in and select your field.')}</p>
      <FieldMap point={field.point} select={choosePoint} t={t} />
    </Suspense>}
    <details className="disclosure coordinates"><summary>{t('أدخل الإحداثيات يدويًا', 'Enter coordinates manually')}</summary>
      <div className="input-pair"><Field label={t('خط العرض', 'Latitude')}><input type="number" min="-90" max="90" step="any" dir="ltr" value={latitude} onChange={event => setLatitude(event.currentTarget.value)} /></Field>
        <Field label={t('خط الطول', 'Longitude')}><input type="number" min="-180" max="180" step="any" dir="ltr" value={longitude} onChange={event => setLongitude(event.currentTarget.value)} /></Field></div>
      <button type="button" onClick={() => {
        const lat = Number(latitude), lon = Number(longitude);
        if (!latitude.trim() || !longitude.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) { setInvalidPoint(true); return; }
        geo.cancel(); choosePoint({ latitude: lat, longitude: lon });
      }}>{t('اعتمد الإحداثيات', 'Use these coordinates')}</button>
      {invalidPoint && <p className="error" role="alert">{t('راجع رقمي خط العرض وخط الطول.', 'Check latitude and longitude.')}</p>}
    </details>
    <form onSubmit={event => { event.preventDefault(); if (field.point) { geo.cancel(); next(); } }}>
      <div className="input-pair">
        <Field label={t('مساحة القطعة بالدونم، إذا بتعرفها', 'Field area in dunums, if known')} hint={t('الدونم المستخدم هون 1000 متر مربع.', 'Here one dunum is 1,000 m².')}>
          <input type="number" min="0.01" step="any" inputMode="decimal" dir="ltr" value={area} onChange={event => updateArea(event.currentTarget.value)} placeholder={t('لم أُدخل', 'Not entered')} />
        </Field>
        <Field label={t('شو زرعت آخر مرة؟', 'What did you grow last?')}><select value={field.previous} onChange={event => update({ ...field, previous: event.currentTarget.value })}>
          <option value="">{t('لم أُدخل', 'Not entered')}</option>
          <option value="unknown">{t('لا أعرف', 'I do not know')}</option>
          {cropProfiles.filter(profile => profile.id !== 'other').map(profile => <option key={profile.id} value={profile.id}>{profile.name[language]}</option>)}
        </select></Field>
      </div>
      <button type="button" className="text-button" onClick={() => updateArea('', 'unknown')}>{t('ما بعرف المساحة', 'I do not know the area')}</button>
      {areaState === 'unknown' && <p className="model-limit" role="status">{t('سجّلت أن المساحة غير معروفة؛ لن نحسب ماء الدور بالمليمتر.', 'Area is recorded as unknown; turn depth in millimetres will not be calculated.')}</p>}
      <button className="primary next-step" disabled={!field.point}>{t('التالي، دور الميّ', 'Next, your water turns')} <span aria-hidden="true">←</span></button>
    </form>
  </section>;
}

export function WaterEditor({ water, update, t, language, compact = false }: {
  water: WaterInput; update: (water: WaterInput) => void; t: Translate; language: Language; compact?: boolean;
}) {
  return <div className="water-editor">
    <DayChoices selected={water.weekdays} update={(weekdays, daysState) => update({ ...water, weekdays, daysState: daysState ?? (weekdays.length ? 'reported' : 'not_entered') })} t={t} language={language} />
    {!water.weekdays.length && <p className="model-limit">{water.daysState === 'unknown' ? t('أيام الماء غير معروفة حسب اختيارك.', 'Water days are explicitly unknown.') : t('لم تحدد أيام الماء بعد.', 'Water days have not been entered.')}</p>}
    <Field label={t('قديش ميّ بتيجيك بكل دور؟', 'How much water arrives per turn?')}><select value={water.supply.mode} onChange={event => {
      const mode = event.currentTarget.value;
      const supply = mode === 'volume' ? { mode: 'volume' as const, cubicMetres: '' } : mode === 'flow'
        ? { mode: 'flow' as const, litresPerSecond: '', hours: '' } : mode === 'not_entered' ? { mode: 'not_entered' as const } : { mode: 'unknown' as const };
      update({ ...water, supply });
    }}><option value="not_entered">{t('لم أُدخل الكمية', 'Volume not entered')}</option><option value="unknown">{t('ما بعرف الكمية', 'I don’t know the volume')}</option><option value="volume">{t('بعرفها بالمتر المكعب', 'I know the cubic metres')}</option><option value="flow">{t('بعرف التصريف ومدة الدور', 'I know flow and turn duration')}</option></select></Field>
    {water.supply.mode === 'volume' && <Field label={t('متر مكعب لكل دور، للقطعة كلها', 'Cubic metres per turn, for the whole field')}>
      <input type="number" min="0" step="any" inputMode="decimal" dir="ltr" value={water.supply.cubicMetres} onChange={event => update({ ...water, supply: { mode: 'volume', cubicMetres: event.currentTarget.value } })} />
    </Field>}
    {water.supply.mode === 'flow' && <div className="input-pair">
      <Field label={t('التصريف، لتر بالثانية', 'Flow, litres per second')}><input type="number" min="0" step="any" dir="ltr" value={water.supply.litresPerSecond} onChange={event => update({ ...water, supply: { ...water.supply as Extract<WaterInput['supply'], { mode: 'flow' }>, litresPerSecond: event.currentTarget.value } })} /></Field>
      <Field label={t('ساعات كل دور', 'Hours per turn')}><input type="number" min="0" max="24" step="any" dir="ltr" value={water.supply.hours} onChange={event => update({ ...water, supply: { ...water.supply as Extract<WaterInput['supply'], { mode: 'flow' }>, hours: event.currentTarget.value } })} /></Field>
    </div>}
    {!compact && <p className="muted">{t('إذا الكمية أو المساحة مجهولة، بنعرض الاستهلاك المقدر لحاله.', 'If volume or area is unknown, the estimated crop use is shown on its own.')}</p>}
    <details className="disclosure"><summary>{t('نسبة وصول الميّ للجذور، اختياري', 'Water reaching the roots, optional')}</summary>
      <Field label={t('طريقة المقارنة', 'Comparison basis')}><select value={water.efficiencyMode} onChange={event => update({ ...water, efficiencyMode: event.currentTarget.value as WaterInput['efficiencyMode'] })}>
        <option value="gross">{t('إجمالي الدور قبل فاقد الري', 'Gross turn volume before irrigation losses')}</option>
        <option value="adjusted">{t('أدخل نسبة للتجربة', 'Enter an efficiency scenario')}</option>
      </select></Field>
      {water.efficiencyMode === 'adjusted' && <Field label={t('النسبة بالمئة', 'Percentage')} hint={t('افتراض للتجربة حتى تتحقق منه بقياس.', 'A scenario until confirmed by measurement.')}>
        <input type="number" min="1" max="100" step="any" dir="ltr" value={water.efficiencyPercent} onChange={event => update({ ...water, efficiencyPercent: event.currentTarget.value })} />
      </Field>}
      {water.efficiencyMode === 'adjusted' && <>
        <div className="inline-actions efficiency-presets"><button type="button" onClick={() => update({ ...water, efficiencyPercent: '90' })}>{t('تنقيط، افتراض 90%', 'Drip, 90% scenario')}</button>
          <button type="button" onClick={() => update({ ...water, efficiencyPercent: '60' })}>{t('سطحي، افتراض 60%', 'Surface, 60% scenario')}</button></div>
        <p className="model-limit">{t('قيم إرشادية للتجربة من FAO، وتحتاج تحققًا في أرضك.', 'Indicative FAO values for a scenario that needs field verification.')} <a href="https://www.fao.org/4/t7202e/t7202e08.htm" target="_blank" rel="noreferrer">FAO · Table 8</a></p>
      </>}
    </details>
  </div>;
}

export function OptionsEditor({ options, update, language, t }: { options: SeasonOption[]; update: (options: SeasonOption[]) => void; language: Language; t: Translate }) {
  const updateOption = (id: string, change: Partial<SeasonOption>) => update(options.map(option => option.id === id ? { ...option, ...change } : option));
  return <div className="options-editor">
    {options.map((option, index) => <fieldset className="crop-option" key={option.id}>
      <legend>{t('الخيار', 'Option')} {index + 1}</legend>
      <div className="input-pair"><Field label={t('المحصول', 'Crop')}><select value={option.crop} required onChange={event => updateOption(option.id, { crop: event.currentTarget.value })}>
        <option value="" disabled>{t('اختار محصول', 'Choose a crop')}</option>{cropProfiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name[language]}</option>)}
      </select></Field><Field label={t('موعد الزراعة المخطّط', 'Planned planting date')}><input type="date" dir="ltr" required min="2000-01-01" max="2100-01-01" value={option.planting} onChange={event => updateOption(option.id, { planting: event.currentTarget.value })} /></Field></div>
      <p className="muted">{t('هذا موعد خطتك. الطقس المستخدم من نفس بداية الموسم في 2015–2024.', 'This is your plan date. Weather comes from matching season starts in 2015–2024.')}</p>
      {options.length > 1 && <button type="button" className="text-button" onClick={() => update(options.filter(candidate => candidate.id !== option.id))}>{t('احذف الخيار', 'Remove option')} {index + 1}</button>}
    </fieldset>)}
    {options.length < 3 && <button type="button" onClick={() => update([...options, { id: crypto.randomUUID(), crop: '', planting: options[0].planting }])}>{t('أضف خيار للمقارنة', 'Add an option to compare')}</button>}
  </div>;
}

