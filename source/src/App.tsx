// SPDX-License-Identifier: Apache-2.0
// Implements the approved Claude plan. Claude and Codex assistance is disclosed in docs/AI_DISCLOSURE.md.
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { REFERENCE_POINT } from './climate';
import { analyzeOptions, type SeasonOption, type WaterInput } from './cropWater';
import type { Language } from './evidence';
import { translation } from './fields';
import { referenceWeather } from './eto';
import { useHistory } from './history';
import { FieldSetup, OptionsEditor, WaterEditor, type FieldInput } from './PlannerInput';
import { Result } from './Result';

type Step = 'welcome' | 'field' | 'water' | 'options' | 'result';
const steps: Step[] = ['field', 'water', 'options', 'result'];
const emptyWater: WaterInput = { area: '', weekdays: [], supply: { mode: 'unknown' }, efficiencyMode: 'gross', efficiencyPercent: '' };

function Brand({ home }: { home: () => void }) {
  return <button type="button" className="brand" onClick={home} aria-label="THARA">
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#e9b949" />
      <path d="M20 7c5 7 9 11.5 9 17a9 9 0 0 1-18 0c0-5.5 4-10 9-17z" fill="#0f3d2e" />
      <path d="M20 31v-9m0 3.5c-2.6 0-4.3-1.6-4.6-4.2 2.6.1 4.3 1.7 4.6 4.2zm0-2.6c.4-2.6 2-4.1 4.6-4.2-.3 2.6-2 4.2-4.6 4.2z" stroke="#e9b949" strokeWidth="1.6" fill="#e9b949" strokeLinecap="round" />
    </svg><span><strong lang="ar">ثرى</strong><small>THARA</small></span>
  </button>;
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ar');
  const [step, setStep] = useState<Step>('welcome');
  const [field, setField] = useState<FieldInput>({ point: null, previous: '' });
  const [water, setWater] = useState<WaterInput>(emptyWater);
  const [options, setOptions] = useState<SeasonOption[]>([{ id: 'first', crop: '', planting: '' }]);
  const [isExample, setExample] = useState(false);
  const [revision, setRevision] = useState(0);
  const t = translation(language);
  const readyForWeather = step === 'water' || step === 'options' || step === 'result';
  const climate = useHistory(readyForWeather ? field.point : null, isExample, revision);
  const weather = useMemo(() => climate.bundle && field.point ? referenceWeather(climate.bundle.records, field.point.latitude) : null, [climate.bundle, field.point]);
  const results = useMemo(() => step === 'result' && weather ? analyzeOptions(options, weather, water) : null, [step, options, weather, water]);
  const labels = { field: t('قطعتك', 'Your field'), water: t('الدور', 'Water turns'), options: t('خياراتك', 'Your options'), result: t('النتيجة', 'Results') };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    const url = new URL(location.href); url.searchParams.set('lang', language);
    history.replaceState(null, '', url);
  }, [language]);
  useLayoutEffect(() => {
    document.getElementById('page-title')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [step]);
  useEffect(() => {
    let opened: HTMLDetailsElement[] = [];
    const before = () => {
      opened.push(...document.querySelectorAll<HTMLDetailsElement>('.method-details:not([open]), .print-expand:not([open])'));
      opened.forEach(details => { details.open = true; });
    };
    const after = () => { opened.forEach(details => { details.open = false; }); opened = []; };
    window.addEventListener('beforeprint', before); window.addEventListener('afterprint', after);
    return () => { window.removeEventListener('beforeprint', before); window.removeEventListener('afterprint', after); };
  }, []);

  function startExample() {
    setField({ point: { ...REFERENCE_POINT, area: 'deir-alla' }, previous: 'tomato' });
    setWater({ area: '4', weekdays: [0, 4], supply: { mode: 'volume', cubicMetres: '30' }, efficiencyMode: 'gross', efficiencyPercent: '' });
    setOptions([{ id: 'first', crop: 'zucchini', planting: '2027-03-01' }, { id: 'second', crop: 'tomato', planting: '2027-03-01' }]);
    setExample(true); setStep('result');
  }

  function startOwnField() {
    if (isExample) {
      setField({ point: null, previous: '' }); setWater(emptyWater);
      setOptions([{ id: 'first', crop: '', planting: '' }]);
    }
    setExample(false); setStep('field');
  }

  return <div className="app">
    <a className="skip-link" href="#page-title">{t('انتقل للمحتوى', 'Skip to content')}</a>
    <header className="topbar"><Brand home={() => setStep('welcome')} />
      <button type="button" className="language-button" lang={language === 'ar' ? 'en' : 'ar'} onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>{language === 'ar' ? 'English' : 'العربية'}</button>
    </header>
    <main>
      {step !== 'welcome' && <ol className="journey-steps" aria-label={t('خطوات خطتك', 'Your plan steps')}>
        {steps.map((candidate, index) => <li key={candidate} aria-current={step === candidate ? 'step' : undefined}><span aria-hidden="true">{index + 1}</span>{labels[candidate as keyof typeof labels]}</li>)}
      </ol>}
      {step === 'welcome' && <section className="welcome">
        <p className="intro-kicker">{t('منطقة أرضك. محصولك. دور الميّ.', 'Your field. Your crop. Your water turns.')}</p>
        <h1 id="page-title" tabIndex={-1}>{t('هل يكفي دور الميّ لمحصولك القادم؟', 'Will your water turn cover your next crop?')}</h1>
        <p className="welcome-lead">{t('قارن محصولين أو أكثر قبل الزراعة. ثرى تربط حرارة منطقتك في عشر سنوات من NASA POWER بتقدير استهلاك المحصول بين أدوار الميّ.', 'Compare crop and planting options before the season. THARA connects ten years of NASA POWER temperature with an estimate of crop water use between your turns.')}</p>
        <div className="welcome-actions"><button className="primary" type="button" onClick={startOwnField}>{t('ابدأ بقطعتي', 'Start with my field')}</button>
          <button type="button" onClick={startExample}>{t('شوف مثال دير علا', 'See the Deir Alla example')}</button></div>
        <p className="welcome-note">{t('مثال جاهز ببيانات محفوظة. تقدير استرشادي من طقس سابق، مع مدخلات وافتراضات واضحة.', 'A saved-data example is ready. Estimates use past weather with disclosed inputs and assumptions.')}</p>
        <div className="welcome-flow"><p>{t('حدّد الأرض', 'Choose a field')}</p><span aria-hidden="true">←</span><p>{t('سجّل الدور', 'Enter water turns')}</p><span aria-hidden="true">←</span><p>{t('قارن خياراتك', 'Compare options')}</p></div>
      </section>}
      {step === 'field' && <FieldSetup field={field} update={setField} area={water.area} updateArea={area => setWater(current => ({ ...current, area }))}
        next={() => { setExample(false); setStep('water'); }} t={t} language={language} />}
      {step === 'water' && <section className="input-step"><header className="step-title"><p>{t('دور الميّ', 'Water turns')}</p><h1 id="page-title" tabIndex={-1}>{t('متى بتوصل، وقديش بتعطيك؟', 'When does water arrive, and how much?')}</h1></header>
        <form onSubmit={event => { event.preventDefault(); setStep('options'); }}><WaterEditor water={water} update={setWater} t={t} language={language} />
          <div className="step-actions"><button className="primary">{t('التالي، خيارات الزراعة', 'Next, planting options')}</button><button type="button" className="text-button" onClick={() => setStep('field')}>{t('رجوع', 'Back')}</button></div>
        </form></section>}
      {step === 'options' && <section className="input-step"><header className="step-title"><p>{t('خيارات الزراعة', 'Planting options')}</p><h1 id="page-title" tabIndex={-1}>{t('شو ناوي تزرع، ومتى؟', 'What might you plant, and when?')}</h1><p>{t('ابدأ بخيار، وأضف لحد ثلاثة للمقارنة.', 'Start with one option and add up to three to compare.')}</p></header>
        <form onSubmit={event => { event.preventDefault(); setStep('result'); }}><OptionsEditor options={options} update={setOptions} t={t} language={language} />
          <div className="step-actions"><button className="primary">{t('احسب وقارن', 'Calculate and compare')}</button><button type="button" className="text-button" onClick={() => setStep('water')}>{t('رجوع', 'Back')}</button></div>
        </form></section>}
      {step === 'result' && climate.loading && <section className="loading-state" role="status"><h1 id="page-title" tabIndex={-1}>{t('بنحضّر المقارنة', 'Preparing your comparison')}</h1><p>{isExample ? t('بنقرأ سجل دير علا المحفوظ…', 'Reading the saved Deir Alla record…') : t('بنجيب طقس عشر سنوات لمنطقتك من NASA POWER…', 'Retrieving ten years of NASA POWER weather for your location…')}</p><progress aria-label={t('تحميل البيانات', 'Loading data')} /></section>}
      {step === 'result' && climate.error && <section className="error-state" role="alert"><h1 id="page-title" tabIndex={-1}>{t('بيانات هالموقع مش متاحة الآن', 'Weather for this location is unavailable')}</h1><p>{t('جرّب الجلب مرة ثانية، أو افتح مثال دير علا المحفوظ.', 'Try retrieving the data again, or open the saved Deir Alla example.')}</p><div className="inline-actions"><button className="primary" onClick={() => setRevision(value => value + 1)}>{t('حاول مرة ثانية', 'Try again')}</button><button onClick={startExample}>{t('شوف مثال دير علا', 'See the Deir Alla example')}</button><button onClick={() => setStep('field')}>{t('غيّر الموقع', 'Change location')}</button></div></section>}
      {step === 'result' && results && climate.bundle && weather && <Result results={results} bundle={climate.bundle} weather={weather} water={water} updateWater={setWater}
        field={field} updateOptions={setOptions} edit={() => setStep('field')} example={isExample} t={t} language={language} />}
    </main>
    <footer className="app-footer"><span>THARA · Team Thara<br /><small>{t('واجهة وعلامة ثرى بمساعدة AI', 'AI-assisted interface and THARA mark')}</small></span><details className="disclosure"><summary>{t('المنهج والمصادر وإفصاح AI', 'Methods, sources and AI disclosure')}</summary>
      <p>{t('الحاجة للأداة واستخدامها الميداني لم يُختبرا مع مزارع. بيانات NASA حقيقية، وFAO تقدّم معاملات عامة تحتاج معايرة محلية. ساعد Claude وCodex في التخطيط والكود والحسابات والنصوص والاختبارات.', 'Farmer demand and field use remain untested. NASA records are authentic. FAO provides generic parameters needing local calibration. Claude and Codex assisted planning, code, calculations, copy and tests.')}</p>
      <p><a href="https://www.fao.org/4/x0490e/x0490e07.htm">FAO-56 · Hargreaves</a> · <a href="https://www.fao.org/4/x0490e/x0490e0b.htm">FAO-56 · Kc</a> · <a href="https://power.larc.nasa.gov/docs/services/api/temporal/daily/">NASA POWER</a></p>
      <p>{t('حالة LENSES للأعلاف في دير علا مرجع بحثي سابق. النسخة الحالية تركّز على الخضار.', 'The LENSES forage case at Deir Alla is prior research context. This version focuses on vegetables.')}</p>
      <p><a href={import.meta.env.BASE_URL + 'ai-usage.json'}>{t('إفصاح AI', 'AI disclosure')}</a> · <a href={import.meta.env.BASE_URL + 'project-materials.json'}>{t('كل المواد والأدوات', 'Materials and tools')}</a> · <a href={import.meta.env.BASE_URL + 'third-party-notices.txt'}>{t('التراخيص', 'Licenses')}</a></p>
    </details></footer>
  </div>;
}
