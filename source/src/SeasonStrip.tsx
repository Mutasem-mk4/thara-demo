// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import type { SeasonWeek } from './cropWater';
import type { Language } from './evidence';
import { Ltr, type Translate } from './fields';
import { number, planDate } from './plannerFormat';

export function SeasonStrip({ weeks, language, t }: { weeks: SeasonWeek[]; language: Language; t: Translate }) {
  const [selection, setSelection] = useState<number | null>(null);
  const peakIndex = weeks.reduce((best, week, index) => (week.need?.median ?? -1) > (weeks[best]?.need?.median ?? -1) ? index : best, 0);
  const index = selection !== null && selection < weeks.length ? selection : peakIndex;
  const selected = weeks[index];
  const maximum = Math.max(1, ...weeks.map(week => Math.max(week.need?.median ?? 0, week.supply ?? 0))) * 1.12;
  return <section className="season-strip" aria-label={t('الاستهلاك المقدر أسبوع بأسبوع', 'Estimated crop use week by week')}>
    <div className="chart-heading"><h3>{t('موسمك، أسبوع بأسبوع', 'Your season, week by week')}</h3><span>{t('مم لكل أسبوع', 'mm per week')}</span></div>
    <div className="chart-legend"><span><i className="legend-demand" />{t('استهلاك مقدّر', 'Estimated crop use')}</span><span><i className="legend-supply" />{t('ميّ الأدوار', 'Scheduled supply')}</span></div>
    <div className="season-bars" dir="ltr" role="group" aria-label={t('اختار أسبوع عشان تشوف أرقامه', 'Choose a week to see its readings')}>
      {weeks.map((week, position) => <button key={week.start} className={`week-bar${week.ratio !== null && week.ratio < 1 ? ' below' : ''}`} type="button"
        aria-pressed={position === index} onClick={() => setSelection(position)}
        aria-label={t(`الأسبوع ${position + 1}، ${planDate(week.start, language)}. الاستهلاك ${week.need ? number(week.need.median) : 'غير متاح'} مم.`, `Week ${position + 1}, ${planDate(week.start, language)}. Estimated use ${week.need ? number(week.need.median) : 'unavailable'} mm.`)}>
        <span className="bar-plot" aria-hidden="true">
          {week.need && <span className="demand-bar" style={{ height: `${week.need.median / maximum * 100}%` }} />}
          {week.supply !== null && <span className="supply-line" style={{ bottom: `${week.supply / maximum * 100}%` }} />}
        </span><span aria-hidden="true" className="week-number">{position + 1}</span>
      </button>)}
    </div>
    <div className="chart-dates" dir="ltr"><span>{planDate(weeks[0].start, language)}</span><span>{planDate(weeks[weeks.length - 1].end, language)}</span></div>
    {selected && <div className="week-reading" aria-live="polite" aria-atomic="true">
      <div className="week-selector"><label>{t('تفاصيل الأسبوع', 'Week details')} <select value={index} onChange={event => setSelection(Number(event.currentTarget.value))}>{weeks.map((week, position) => <option key={week.start} value={position}>{t('الأسبوع', 'Week')} {position + 1}</option>)}</select></label>
        <p>{planDate(selected.start, language)} — {planDate(selected.end, language)} · <Ltr>{selected.days}</Ltr> {t('أيام', 'days')}</p></div>
      <dl><div><dt>{t('الاستهلاك المقدّر', 'Estimated crop use')}</dt><dd>{selected.need ? <Ltr>{number(selected.need.median)} mm</Ltr> : t('غير متاح', 'Unavailable')}</dd></div>
        <div><dt>{t('ميّ الأدوار خلال الأسبوع', 'Water arriving that week')}</dt><dd>{selected.supply !== null ? <Ltr>{number(selected.supply)} mm</Ltr> : t('غير معروفة', 'Unknown')}</dd></div></dl>
      {selected.ratio !== null && <p className={selected.ratio < 1 ? 'comparison-below' : 'comparison-above'}>{selected.ratio < 1
        ? t('ميّ الأدوار أقل من الاستهلاك المقدّر بهذا الأسبوع.', 'Scheduled water is below estimated crop use this week.')
        : t('ميّ الأدوار تعادل الاستهلاك المقدّر أو تتجاوزه بهذا الأسبوع.', 'Scheduled water equals or exceeds estimated crop use this week.')}</p>}
      <p className="muted">{t('كل عمود أسبوع من خطة الزراعة. جمع ماء الأسبوع وحده ما يوضح توزيع الميّ بين الأيام.', 'Each bar is a week of the planting plan. A weekly total alone does not show how water is distributed between days.')}</p>
    </div>}
  </section>;
}
