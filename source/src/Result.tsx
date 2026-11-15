// SPDX-License-Identifier: Apache-2.0
import { useRef, useState } from 'react';
import type { ClimateBundle } from './climate';
import { addDays, type SeasonAnalysis, type SeasonOption, type WaterInput } from './cropWater';
import type { ReferenceDay } from './eto';
import type { Language } from './evidence';
import { Ltr, type Translate } from './fields';
import { MethodDetails, downloadPlan } from './MethodDetails';
import { OptionCard } from './OptionCard';
import { WaterEditor, type FieldInput } from './PlannerInput';
import { number, planDate } from './plannerFormat';
import { volumePerTurn } from './waterPlan';
import { cropProfile } from './cropProfiles';

export function Result({ results, bundle, weather, water, updateWater, field, updateOptions, edit, example, t, language }: {
  results: SeasonAnalysis[]; bundle: ClimateBundle; weather: Map<string, ReferenceDay>; water: WaterInput;
  updateWater: (water: WaterInput) => void; field: FieldInput; updateOptions: (options: SeasonOption[]) => void;
  edit: () => void; example: boolean; t: Translate; language: Language;
}) {
  const [selectedId, setSelected] = useState(results[0].option.id);
  const original = useRef({ water, options: results.map(result => result.option) });
  const selected = results.find(result => result.option.id === selectedId) ?? results[0];
  const source = bundle.evidence[0];
  const volume = volumePerTurn(water.supply);
  const previous = cropProfile(field.previous);
  const weekdays = language === 'ar' ? ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const simulation = (
    <div className="simulation no-print">
      <div className="simulation-title"><div><p>{t('جرّب تعديل خطتك', 'Try changes to your plan')}</p><h2>{t('شو بيتغيّر إذا عدّلت الدور؟', 'What changes when you adjust a turn?')}</h2></div>
        <span className="simulation-live">{t('الحساب يتحدّث مع كل تعديل', 'Updates with each change')}</span></div>
      <details className="disclosure"><summary>{t('غيّر الأيام أو الكمية', 'Change turn days or volume')}</summary>
        <WaterEditor water={water} update={updateWater} t={t} language={language} compact />
        <label className="field"><span>{t('مساحة القطعة بالدونم', 'Field area in dunums')}</span><input type="number" min="0.01" step="any" dir="ltr" value={water.area} onChange={event => updateWater({ ...water, area: event.currentTarget.value })} /></label>
      </details>
      <div className="inline-actions">{[0, 2, 4].filter(day => !water.weekdays.includes(day)).slice(0, 1).map(day => <button key={day} type="button" onClick={() => updateWater({ ...water, weekdays: [...water.weekdays, day].sort() })}>
        {t('جرّب إضافة', 'Try adding')} {language === 'ar' ? ['الأحد', '', 'الثلاثاء', '', 'الخميس'][day] : ['Sunday', '', 'Tuesday', '', 'Thursday'][day]}
      </button>)}<button type="button" onClick={() => updateOptions(results.map(result => result.option.id === selected.option.id
        ? { ...result.option, planting: addDays(result.option.planting, 14) } : result.option))}>{t('جرّب تأخير هذا الخيار أسبوعين', 'Try this option two weeks later')}</button></div>
      <button type="button" className="text-button" onClick={() => { updateWater(original.current.water); updateOptions(original.current.options); }}>{t('ارجع لمدخلات البداية', 'Restore starting inputs')}</button>
      <p className="model-limit">{t('إضافة يوم تفترض توفر دور إضافي بنفس الكمية، وليست إعادة توزيع لحصة أسبوعية ثابتة. تحقق من توفر الماء وموعد الزراعة قبل التطبيق بالحقل.', 'Adding a day assumes an extra turn of the same volume; it does not redistribute a fixed weekly allocation. Check water availability and planting dates before field use.')}</p>
    </div>
  );
  return <section className="results">
    <header className="step-title result-header">
      <p>{example ? t('دير علا · حالة عرض افتراضية', 'Deir Alla · Fictional demonstration') : t('خطة من المدخلات اللي سجّلتها', 'A plan from your inputs')}</p>
      <h1 id="page-title" tabIndex={-1}>{t('هيك بتتوزع حاجة محصولك للميّ', 'See how crop water use changes through the season')}</h1>
      <p>{t('تقدير من طقس 2015–2024، مع معاملات FAO عامة. كل خيار يُحسب حسب محصوله وموعده.', 'An estimate from 2015–2024 weather and generic FAO coefficients. Each option uses its own crop and start date.')}</p>
    </header>
    <div className="data-status" role="status"><strong>{bundle.mode === 'saved' ? t('بيانات NASA حقيقية محفوظة', 'Real saved NASA data') : t('بيانات جُلبت من NASA الآن', 'Data just retrieved from NASA')}</strong>
      <span>{t('تاريخ الجلب', 'Retrieved')} <Ltr>{source.retrieved_at.slice(0, 10)}</Ltr></span>
      {bundle.fallback && <p>{t('تعذّر الجلب المباشر. هذه النسخة تغطي نفس النقطة والفترة.', 'Live retrieval failed. This copy covers the same point and historical period.')}</p>}
    </div>
    <dl className="plan-inputs">
      <div><dt>{t('مساحة القطعة', 'Field area')}</dt><dd>{water.area.trim() && Number(water.area) > 0 ? <><Ltr>{number(Number(water.area))}</Ltr> {t('دونم', 'metric dunums')}</> : t('غير معروفة', 'Unknown')}</dd></div>
      <div><dt>{t('أيام وصول الميّ', 'Water turn days')}</dt><dd>{water.weekdays.length ? water.weekdays.map(day => weekdays[day]).join(language === 'ar' ? '، ' : ', ') : t('غير معروفة', 'Unknown')}</dd></div>
      <div><dt>{t('كمية الدور للقطعة كلها', 'Turn volume for the whole field')}</dt><dd>{volume === null ? t('غير معروفة', 'Unknown') : <Ltr>{number(volume)} m³</Ltr>}</dd></div>
      <div><dt>{t('المحصول السابق', 'Previous crop')}</dt><dd>{previous?.name[language] ?? t('غير معروف', 'Unknown')}</dd></div>
    </dl>
    <div className="comparison-scroll"><table className="options-comparison"><caption>{t('قارن خياراتك كما أدخلتها', 'Compare your options as entered')}</caption>
      <thead><tr><th>{t('الخيار', 'Option')}</th><th>{t('الزراعة المخطّطة', 'Planned planting')}</th><th>{t('أعلى استهلاك بين دورين', 'Peak use between turns')}</th><th>{t('نسبة الدور للتقدير', 'Turn / estimate')}</th></tr></thead>
      <tbody>{results.map(result => <tr key={result.option.id} className={selected.option.id === result.option.id ? 'chosen' : ''}>
        <th><button type="button" className="text-button" aria-pressed={selected.option.id === result.option.id} onClick={() => setSelected(result.option.id)}>{result.profile.name[language]}</button></th>
        <td>{planDate(result.option.planting, language)}</td>
        <td>{result.peak?.need ? <Ltr>{number(result.peak.need.median)} mm / {result.peak.days} {t('أيام', 'days')}</Ltr> : t('غير محسوب', 'Not calculated')}</td>
        <td>{result.peak?.ratio === null || result.peak?.ratio === undefined ? t('غير محسوبة', 'Not calculated') : <Ltr>{number(result.peak.ratio * 100, 0)}%</Ltr>}</td>
      </tr>)}</tbody></table></div>
    <p className="model-limit">{t('تختلف مدة كل محصول. النسب تقارن الدور باستهلاكه المقدر، وتحتاج بقية معلومات الحقل لتقييم الكفاية.', 'Crops have different season lengths. The ratios compare each turn with estimated crop use and need field information to assess adequacy.')}</p>
    {results.map(result => <article key={result.option.id} className={`option-report${selected.option.id === result.option.id ? ' is-selected' : ''}`}>
      <p className="sample-count">{result.profile.model ? t('مواسم مرجعية مكتملة مشتركة', 'Complete shared reference seasons') : t('مواسم مرجعية مكتملة للطقس', 'Complete reference weather seasons')} <Ltr>{result.includedYears.length}/10</Ltr>
        {result.includedYears.length < 10 && <> · {t('المواسم الناقصة أو الخارجة عن التغطية مستبعدة.', 'Missing or uncovered seasons are excluded.')}</>}</p>
      <OptionCard result={result} previous={field.previous} t={t} language={language} controls={selected.option.id === result.option.id ? simulation : undefined} />
      <MethodDetails result={result} bundle={bundle} weather={weather} language={language} t={t} />
    </article>)}
    <div className="result-actions no-print"><button className="primary" type="button" onClick={() => window.print()}>{t('احفظ خطتي PDF', 'Save my plan as PDF')}</button>
      <button type="button" onClick={edit}>{t('عدّل المدخلات', 'Edit inputs')}</button>
      <button type="button" className="text-button" onClick={() => downloadPlan(bundle, results, water, field.previous)}>{t('نزّل ملف التتبع', 'Download audit file')}</button></div>
    <p className="print-footnote">{t('الخطة والمواعيد افتراضية للبحث قبل الموسم. الطقس تاريخي شبكي، والمراحل والكفاءة افتراضات معلنة. يتطلب الاعتماد الزراعي تحققًا محليًا. بُني النموذج الأولي بمساعدة Claude وCodex؛ بيانات المصدر من NASA.', 'This is a pre-season planning scenario. Weather is historical and gridded. Stages and efficiency are disclosed assumptions. Agronomic use needs local validation. Claude and Codex assisted this prototype; source records come from NASA.')}</p>
  </section>;
}
