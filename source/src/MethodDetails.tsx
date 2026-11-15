// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { summarizeWindow, type ClimateBundle } from './climate';
import type { SeasonAnalysis, WaterInput } from './cropWater';
import { coefficientForDay, FAO_COEFFICIENTS, FAO_HARGREAVES } from './cropProfiles';
import type { ReferenceDay } from './eto';
import type { Language } from './evidence';
import { Ltr, type Translate } from './fields';
import { number, planDate } from './plannerFormat';

export function downloadPlan(bundle: ClimateBundle, results: SeasonAnalysis[], water: WaterInput, previous: string) {
  const document = {
    project: 'THARA', created_at: new Date().toISOString(),
    disclosure: 'Codex and Claude assisted software and model implementation. NASA source values were retrieved. Derived FAO estimates are exploratory and require local validation.',
    water, previousCrop: previous, results, nasa: bundle.evidence,
    methodology: { radiation: 'FAO-56 Eq 21–25, MJ/m²/day', eto: 'Eq 52 Hargreaves, Tmean = (T2M_MAX + T2M_MIN)/2 per Eq 9, radiation × 0.408',
      cropUse: 'ETc = Kc × ETo, FAO-56 Tables 11/12, no local adjustment',
      intervals: 'From turn day inclusive to next turn day exclusive. Initial/final incomplete turn intervals excluded.',
      uncertainty: 'Historical median and full range across complete shared reference years. ±10% Kc is a sensitivity scenario, not a confidence interval.',
    },
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' }));
  const anchor = globalThis.document.createElement('a');
  anchor.href = url; anchor.download = 'thara-water-plan-audit.json'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function MethodDetails({ result, bundle, weather, language, t }: {
  result: SeasonAnalysis; bundle: ClimateBundle; weather: Map<string, ReferenceDay>; language: Language; t: Translate;
}) {
  const [requestedYear, setYear] = useState(2015);
  const firstYear = result.includedYears[0];
  const year = result.includedYears.includes(requestedYear) ? requestedYear : firstYear;
  const series = result.years.find(candidate => candidate.year === year);
  const peak = result.peak;
  const offset = peak ? Math.round((Date.parse(peak.from) - Date.parse(result.option.planting)) / 86_400_000) : 0;
  const count = peak?.days ?? 7;
  const rows = series?.dates.slice(offset, offset + count) ?? [];
  const historical = series?.dates.length ? summarizeWindow(bundle.records, { start: series.dates[0], end: series.dates[series.dates.length - 1] }) : null;
  return <details className="disclosure method-details">
    <summary>{t('كيف حسبناها؟ افتح المعادلة والبيانات', 'How was this calculated? Open the formula and data')}</summary>
    <div className="method-body">
      <p>{t('نطابق بداية الموسم بالشهر واليوم في كل سنة تاريخية، ثم نتقدم يومًا لكل يوم من عمر المحصول. المقارنة تستخدم السنوات المكتملة المشتركة بين خيارات المحاصيل.', 'The planting month and day are matched in each historical year, then advanced by crop age. Crop options use the same complete reference years.')}</p>
      <ol>
        <li>{t('من خط العرض ويوم السنة نحسب الإشعاع خارج الغلاف الجوي.', 'Latitude and day of year give extraterrestrial radiation.')} <a href={FAO_HARGREAVES} target="_blank" rel="noreferrer">FAO-56 §3, Eq. 21–25, 52</a></li>
        <li><span className="formula" dir="ltr">Tmean = (T2M_MAX + T2M_MIN) / 2 (FAO-56 Eq. 9)<br />ETo = 0.0023 × (Tmean + 17.8) × √(T2M_MAX − T2M_MIN) × 0.408 × Ra</span></li>
        <li><span className="formula" dir="ltr">ETc = Kc × ETo</span> {t('نجمع ETc من يوم الدور حتى اليوم السابق للدور التالي.', 'ETc is summed from the turn day to the day before the next turn.')}</li>
        <li>{t('متر مكعب واحد على دونم مساحته 1000 م² يعطي عمق 1 مم. نسبة المقارنة = ماء الدور بالمم ÷ الاستهلاك المقدر للفترة.', 'One cubic metre over a 1,000 m² dunum is 1 mm. The comparison ratio is turn water in mm divided by estimated use for the interval.')}</li>
      </ol>
      {result.profile.model && <div className="coefficient-record">
        <h4>{t('المعاملات المفترضة لهذا الخيار', 'Assumed coefficients for this option')}</h4>
        <p><Ltr>Kc {result.profile.model.kc.join(' → ')} · {result.profile.model.stages.join(' / ')} days</Ltr></p>
        <p>{result.profile.model.region[language]}</p><p className="source-row" lang="en">{result.profile.model.row}</p>
        <p>{t('أطوال المراحل ثابتة للتجربة حتى لو غيّرت موعد الزراعة. المعاملات العامة لم تُعدّل محليًا للرياح والرطوبة أو تكرار البلل.', 'Stage lengths stay fixed in this scenario when planting dates change. Generic coefficients have no local wind, humidity or wetting-frequency adjustment.')}</p>
        <a href={FAO_COEFFICIENTS} target="_blank" rel="noreferrer">FAO-56 · Tables 11, 12 & Eq. 66</a>
      </div>}
      {peak?.need && <p>{t('حساسية المعامل', 'Coefficient sensitivity')} <Ltr>±10%</Ltr> · {t('استهلاك الفترة بين', 'Interval crop use between')} <Ltr>{number(peak.need.median * 0.9)}–{number(peak.need.median * 1.1)} mm</Ltr>. {t('هذا سيناريو حساسية فقط.', 'This is a sensitivity scenario.')}</p>}
      <div className="table-scroll"><table><caption>{t('اكتمال أيام الحرارة لكل موسم مرجعي', 'Temperature coverage for each reference season')}</caption>
        <thead><tr><th>{t('السنة', 'Year')}</th><th>{t('الأيام الصالحة', 'Valid days')}</th><th>{t('دخلت الحساب', 'Included')}</th></tr></thead>
        <tbody>{result.years.map(candidate => <tr key={candidate.year}><th><Ltr>{candidate.year}</Ltr></th><td><Ltr>{candidate.valid}/{candidate.expected}</Ltr></td><td>{result.includedYears.includes(candidate.year) ? t('نعم', 'Yes') : t('مستبعدة لنقص أو حدود التغطية', 'Excluded for missing or uncovered dates')}</td></tr>)}</tbody>
      </table></div>
      {historical && <details className="disclosure historical-context no-print"><summary>{t('ملخص الطقس الأصلي لموسم مرجعي واحد', 'Original weather summary for one reference season')} · <Ltr>{year}</Ltr></summary>
        <p><Ltr>{historical.window.start} — {historical.window.end}</Ltr> · {t('أيام تاريخية بتوقيت LST، وهو وقت شمسي يختلف عن توقيت عمّان.', 'Historical LST days; local solar time differs from Amman civil time.')}</p>
        <div className="table-scroll"><table><thead><tr><th>{t('المتغير والحساب', 'Variable and statistic')}</th><th>{t('النتيجة', 'Result')}</th><th>{t('أيام صالحة / متوقعة', 'Valid / expected days')}</th></tr></thead><tbody>
          {(['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR'] as const).map(parameter => {
            const statistic = historical.statistics[parameter];
            const label = parameter === 'T2M' ? t('متوسط الحرارة اليومية', 'Mean daily temperature') : parameter === 'T2M_MAX' ? t('أكبر قيمة للقصوى اليومية', 'Highest daily maximum') : parameter === 'T2M_MIN' ? t('أصغر قيمة للدنيا اليومية', 'Lowest daily minimum') : t('مجموع الهطول', 'Sum of precipitation');
            return <tr key={parameter}><th>{label} <Ltr>{parameter}</Ltr></th><td>{statistic.value === null ? t('غير متاح', 'Unavailable') : <Ltr>{number(statistic.value, 2)} {parameter === 'PRECTOTCORR' ? 'mm' : '°C'}</Ltr>}{statistic.status === 'partial' && <> · {t('جزئي', 'Partial')}</>}</td><td><Ltr>{statistic.valid}/{statistic.expected} · {number(statistic.coverage * 100, 0)}%</Ltr></td></tr>;
          })}
        </tbody></table></div>
      </details>}
      {series && <details className="disclosure daily-trace no-print"><summary>{t('تتبّع فترة واحدة إلى أيام NASA', 'Trace one interval to NASA days')}</summary>
        <label>{t('سنة التتبع', 'Trace year')} <select value={year} onChange={event => setYear(Number(event.currentTarget.value))}>{result.includedYears.map(value => <option key={value}>{value}</option>)}</select></label>
        {peak && <p>{t('الفترة المخطّطة', 'Planned interval')} · {planDate(peak.from, language)} — {planDate(peak.to, language)}</p>}
        <div className="table-scroll"><table dir="ltr"><thead><tr>{['NASA date (LST)', 'Tmean Eq.9 °C', 'Tmax °C', 'Tmin °C', 'Ra MJ/m²/day', 'ETo mm/day', 'Kc', 'ETc mm/day'].map(label => <th key={label}>{label}</th>)}</tr></thead>
          <tbody>{rows.map((date, index) => {
            const row = weather.get(date)!;
            const kc = coefficientForDay(result.profile, offset + index);
            return <tr key={date}><th>{date}</th><td>{number((row.values.T2M_MAX! + row.values.T2M_MIN!) / 2, 2)}</td><td>{number(row.values.T2M_MAX!, 2)}</td><td>{number(row.values.T2M_MIN!, 2)}</td><td>{number(row.radiation, 3)}</td><td>{number(row.eto!, 3)}</td><td>{kc === null ? '—' : number(kc, 3)}</td><td>{series.etc[offset + index] === null ? '—' : number(series.etc[offset + index]!, 3)}</td></tr>;
          })}</tbody></table></div>
      </details>}
      {bundle.evidence.map(source => <div className="source-record" key={source.request_url}>
        <p><strong>NASA POWER Daily</strong> · <Ltr>{source.raw.header.api.version} · {source.raw.header.sources.join(', ')} · {source.raw.header.time_standard}</Ltr></p>
        <p>{t('نقطة الطلب', 'Request point')} <Ltr>{source.raw.geometry.coordinates[1]}, {source.raw.geometry.coordinates[0]}</Ltr> · {t('جُلبت في', 'Retrieved')} <Ltr>{source.retrieved_at}</Ltr></p>
        <p>{t('الطقس من شبكة إقليمية، وليس حساسًا داخل الحقل. تعني الإحداثيات نقطة طلب البيانات.', 'Weather comes from a regional grid, not a sensor in this field. Coordinates identify the request point.')}</p>
        <p><a href={source.request_url} target="_blank" rel="noreferrer">{t('افتح طلب NASA الأصلي', 'Open original NASA request')}</a></p>
        {source.file && <p><a href={import.meta.env.BASE_URL + source.file} download>{t('نزّل الاستجابة الخام', 'Download raw response')}</a> · <a href={import.meta.env.BASE_URL + 'data/power-2015-2024-provenance.json'}>{t('توثيق النسخة المحفوظة', 'Saved-copy provenance')}</a></p>}
        {source.sha256 && <p className="hash" dir="ltr">SHA-256 {source.sha256}</p>}
      </div>)}
    </div>
  </details>;
}
