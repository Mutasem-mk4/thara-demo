// SPDX-License-Identifier: Apache-2.0
import type { SeasonAnalysis } from './cropWater';
import { cropProfile, ROTATION_SOURCE } from './cropProfiles';
import type { Language } from './evidence';
import { Ltr, type Translate } from './fields';
import { number, planDate } from './plannerFormat';
import { SeasonStrip } from './SeasonStrip';
import type { ReactNode } from 'react';

export function OptionCard({ result, previous, language, t, controls }: { result: SeasonAnalysis; previous: string; language: Language; t: Translate; controls?: ReactNode }) {
  const peak = result.peak;
  const previousCrop = cropProfile(previous);
  const sameFamily = Boolean(previousCrop?.family && previousCrop.family === result.profile.family);
  const unadjusted = result.efficiency === null;
  return <div className="option-detail">
    <header className="option-title"><p>{planDate(result.option.planting, language)} — {planDate(result.end, language)} · <Ltr>{result.weeks.reduce((sum, week) => sum + week.days, 0)}</Ltr> {t('يومًا افتراضيًا', 'scenario days')}</p>
      <h2>{result.profile.name[language]}</h2>
    </header>
    {!result.profile.model ? <div className="result-answer"><h3>{t('لهذا المحصول بنعرض الطقس فقط.', 'Weather context is available for this crop.')}</h3>
      <p>{t('ما عنا معاملات مكتملة من المصدر المختار لهذا المحصول. نافذة العرض 90 يومًا من تاريخك، وكمية استهلاكه غير محسوبة.', 'The chosen source does not provide a complete profile for this crop. The weather window is 90 days from your date, and crop use remains uncalculated.')}</p>
    </div> : !result.total ? <div className="result-answer"><h3>{t('بيانات الموسم غير مكتملة للمقارنة.', 'The season data are incomplete for this comparison.')}</h3>
      <p>{t('ما في سنوات مكتملة مشتركة لكل الخيارات. غيّر الموعد أو راجع البيانات بالتفاصيل.', 'There are no complete shared years for all options. Change a date or inspect the data details.')}</p>
    </div> : <>
      <div className="result-answer" aria-live="polite">
        <p className="answer-eyebrow">{t('الفترة الأعلى استهلاكًا بين دورين', 'The interval with the highest estimated use')}</p>
        <h3>{peak?.need ? <>{t('حوالي', 'About')} <Ltr>{number(peak.need.median)} mm</Ltr> {t('بين دورين', 'between turns')}</>
          : <>{t('استهلاك الموسم المقدّر', 'Estimated season use')} <Ltr>{number(result.total.median)} mm</Ltr></>}</h3>
        {peak?.need && <p>{t('من دور', 'From the turn on')} <strong>{planDate(peak.from, language, true)}</strong> {t('لليوم اللي قبل دور', 'through the day before the turn on')} <strong>{planDate(peak.to, language, true)}</strong>{t('،', ',')} <Ltr>{peak.days}</Ltr> {t('أيام.', 'days.')}</p>}
        {peak?.need && <p>{t('حسب السنوات، تراوحت بين', 'Across reference years, the range was')} <Ltr>{number(peak.need.minimum)}–{number(peak.need.maximum)} mm</Ltr>. {t('القيمة المعروضة هي الوسيط.', 'The displayed estimate is the median.')}</p>}
      </div>
      <div className="turn-comparison">
        <dl><div><dt>{unadjusted ? t('إجمالي الدور قبل الفاقد', 'Gross turn before losses') : t('الدور بعد نسبة الكفاءة المدخلة', 'Turn after your efficiency scenario')}</dt>
          <dd>{result.comparedPerTurn === null ? t('غير معروف', 'Unknown') : <Ltr>{number(result.comparedPerTurn)} mm</Ltr>}</dd></div>
          <div><dt>{t('نسبته إلى استهلاك الفترة', 'Ratio to estimated interval use')}</dt><dd>{peak?.ratio === null || peak?.ratio === undefined
            ? t('غير محسوبة', 'Not calculated') : <Ltr>{number(peak.ratio * 100, 0)}%</Ltr>}</dd></div></dl>
        {result.efficiency !== null && result.grossPerTurn !== null && <p className="model-limit">{t('كفاءة التجربة', 'Scenario efficiency')} <Ltr>{number(result.efficiency * 100, 0)}%</Ltr> · {t('إجمالي الدور', 'Gross turn')} <Ltr>{number(result.grossPerTurn)} mm</Ltr>.</p>}
        {peak?.ratio !== null && peak?.ratio !== undefined && <p className={peak.ratio < 1 ? 'comparison-below' : 'comparison-above'}>{peak.ratio < 1
          ? t('الدور أقل من الاستهلاك المقدّر بهذه الفترة.', 'The turn is below estimated crop use for this interval.')
          : t('الدور يعادل الاستهلاك المقدّر أو يتجاوزه بهذه الفترة.', 'The turn equals or exceeds estimated crop use for this interval.')}</p>}
        {result.comparedPerTurn === null && <p>{t('أضف كمية الدور ومساحة القطعة عشان تشوف المقارنة. الاستهلاك المقدر متاح أعلاه.', 'Add turn volume and field area to compare them. Estimated crop use is available above.')}</p>}
        <p className="model-limit">{t('هذا تقدير أولي. كفاية الري الفعلية تعتمد كمان على فاقد الري والمطر الفعّال ومخزون التربة، وهي غير محسوبة هون.', 'This is a screening estimate. Actual irrigation adequacy also depends on losses, effective rainfall and stored soil water, which are outside this calculation.')}</p>
      </div>
      {controls}
      <SeasonStrip weeks={result.weeks} language={language} t={t} />
      <p className="model-limit">{t('مجموع استهلاك الموسم المقدر', 'Estimated season crop use')} <Ltr>{number(result.total.median)} mm</Ltr> · {t('المدى التاريخي', 'Historical range')} <Ltr>{number(result.total.minimum)}–{number(result.total.maximum)} mm</Ltr>.</p>
    </>}
    {!result.profile.model && controls}
    <details className="field-checks disclosure print-expand">
      <summary>{t('فحص العائلة والحرارة والمطر', 'Check crop family, heat and rain')}</summary>
      <p>{previousCrop && result.profile.family ? sameFamily
        ? t(`${result.profile.name.ar} من نفس عائلة ${previousCrop.name.ar}. راجع سجل أمراض القطعة قبل تكرار العائلة.`, `${result.profile.name.en} shares a plant family with ${previousCrop.name.en}. Review the field disease history before repeating the family.`)
        : t(`${result.profile.name.ar} من عائلة مختلفة عن ${previousCrop.name.ar}. هذا فحص عائلة أولي، والقرار يحتاج سجل القطعة.`, `${result.profile.name.en} is in a different family from ${previousCrop.name.en}. This is a family check that still needs field-history review.`)
        : t('المحصول السابق أو عائلته مش محددين، ففحص التعاقب غير مكتمل.', 'The previous crop or its family is unknown, so the rotation check is incomplete.')}
        {' '}<a href={ROTATION_SOURCE} target="_blank" rel="noreferrer">{t('مصدر فحص العائلة', 'Family-check source')}</a></p>
      {result.heatDays && <p>{t('تجاوزت القصوى اليومية', 'Daily maximum temperature exceeded')} <Ltr>35°C</Ltr> {t('خلال النافذة في', 'during the window in')} <Ltr>{result.heatYears}/{result.heatDays.count}</Ltr> {t('سنوات. الوسيط', 'reference years. The median was')} <Ltr>{number(result.heatDays.median, 0)}</Ltr> {t('يومًا. الوصف يغطي النافذة كاملة، ولا يحدد ضررًا أو مرحلة إزهار.', 'days. This describes the full window and does not identify crop damage or flowering.')}</p>}
      {result.rain && <p>{t('وسيط المطر خلال النافذة', 'Median rain during the window')} <Ltr>{number(result.rain.median)} mm</Ltr> · <Ltr>{result.rain.count}</Ltr> {t('سنوات مكتملة للهطول. يظهر المطر منفصلًا عن ماء الري.', 'years with complete rain data. Rain is displayed separately from irrigation supply.')}</p>}
      {result.profile.model && <p className="model-limit">{t('تقدير الاستهلاك يستثني طرح المطر ومخزون رطوبة التربة. فترات المقارنة الكاملة تستثني', 'The estimate makes no deduction for rain or stored soil water. Complete turn comparisons exclude')} <Ltr>{result.initialDaysOutsideTurns}</Ltr> {t('أيام قبل أول دور، و', 'days before the first turn and')} <Ltr>{result.finalDaysOutsideTurns}</Ltr> {t('أيام من آخر دور لنهاية النافذة.', 'days from the last turn to the window end.')}</p>}
    </details>
  </div>;
}
