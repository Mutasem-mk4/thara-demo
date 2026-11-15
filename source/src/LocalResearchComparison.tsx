// SPDX-License-Identifier: Apache-2.0
import { sequences, sources, type Language, type Priority } from './evidence';
import type { Translate } from './fields';

const sare = 'https://www.sare.org/publications/managing-cover-crops-profitably/building-soil-fertility/';
const sesbania = 'https://www.fao.org/4/x5491e/x5491e0a.htm';
const labels = {
  water: { ar: 'الماء', en: 'Water' }, soil: { ar: 'التربة', en: 'Soil' },
  feed: { ar: 'استمرارية العلف', en: 'Feed continuity' }, risk: { ar: 'تقليل المخاطر', en: 'Reduce risk' },
};

export function LocalResearchComparison({ language, t, priority, setPriority }: { language: Language; t: Translate; priority: Priority; setPriority: (priority: Priority) => void }) {
  const order = [priority, ...(['water', 'soil', 'feed', 'risk'] as const).filter(candidate => candidate !== priority)];
  const localSource = sources.find(source => source.id === 'LENSES')!;
  return <details className="disclosure research-case">
    <summary>{t('دليل محلي: ثلاث استراتيجيات لحالة أعلاف بحثية', 'Local evidence: three strategies for a forage research case')}</summary>
    <div className="research-body">
      <h2>{t('دير علا · حالة أعلاف توضيحية مستقلة', 'Deir Alla · Separate illustrative forage case')}</h2>
      <p className="model-limit">{t('إذا تركت هذا القسم مفتوحًا عند الطباعة، يُضاف إلى الملخص كحالة مستقلة.', 'Leave this section open when printing to include it as a separate case.')}</p>
      <p>{t('هذه مقارنة بحثية، وليست توصية بتحويل أرض خضار إلى الأعلاف. مدخلات قطعة الخضار وحساباتها أعلاه لا تُستخدم لحساب ماء هذه التتابعات.', 'This is a research comparison, not a recommendation to convert a vegetable field to forage. The vegetable field inputs and estimates above are not used to calculate these sequences’ water demand.')}</p>
      <p>{t('LENSES يوثّق التتابعين الصيفي/الشتوي أدناه. البحث الأصلي قارن أيضًا البرسيم الحجازي؛ لا نعتبره تلقائيًا ممارسة المزرعة الحالية.', 'LENSES documents the two summer/winter sequences below. The original comparison also included alfalfa; it is not assumed to be the farm’s current practice.')} <a href={localSource.url} target="_blank" rel="noreferrer">LENSES D2.2 · §3.1.1</a></p>
      <label className="field no-print"><span>{t('أولوية مراجعة حالة الأعلاف', 'Forage case review priority')}</span><select aria-label={t('أولوية مراجعة حالة الأعلاف', 'Forage case review priority')} value={priority} onChange={event => setPriority(event.currentTarget.value as Priority)}>
        {(['water', 'soil', 'feed', 'risk'] as const).map(candidate => <option key={candidate} value={candidate}>{labels[candidate][language]}</option>)}
      </select></label>
      <p className="model-limit">{t('تتقدم معلومات الأولوية داخل كل استراتيجية، وتبقى الاستراتيجيات بنفس الترتيب دون فائز أو أوزان علمية مختلقة.', 'Priority moves its information first within each strategy. Strategies retain their order, with no winner or invented scientific weights.')}</p>
      <div className="research-strategies">
        {[null, ...sequences].map(sequence => {
          const baseline = sequence === null;
          const soil = baseline ? t('غير معروف؛ لا يوجد سجل تربة أو غطاء لهذه الحالة.', 'Unknown; no soil or cover record is available for this case.')
            : sequence.id === 'sorghum_vetch'
              ? t('للغطاء والبقوليات آليات محتملة لدعم التربة والنيتروجين. الأثر يتوقف على العقد الجذرية وإدارة البقايا؛ لم يُقَس هنا.', 'Cover and legumes have potential soil and nitrogen mechanisms. Effects depend on nodulation and residue management; they were not measured here.')
              : t('للسيسبانيا قابلية تثبيت نيتروجين مذكورة على مستوى الجنس النباتي. يلزم تحديد النوع وإدارة الكتلة؛ لا ننقل مقدارًا إلى دير علا.', 'Nitrogen-fixing potential is described for the Sesbania genus. Species and biomass management need verification; no quantity is transferred to Deir Alla.');
          const statements = {
            water: baseline ? t('طلب الماء غير متوفر. يلزم سجل المحاصيل وكميات الري ومواعيدها.', 'Water demand unavailable. Crop history, irrigation quantities and dates are needed.') : t('طلب ماء الدورة غير متوفر. لا توجد هنا معاملات مكتملة موثقة للتتابع. المطر التاريخي ليس ماء ري ولا توقعًا.', 'Whole-sequence water demand unavailable. Complete verified parameters are not adopted here. Historical rain is neither irrigation supply nor a forecast.'),
            soil,
            feed: baseline ? t('غرض الإنتاج والسوق ومواعيد الحاجة غير معروفة.', 'Production purpose, market and demand dates are unknown.') : sequence.context[language] + ' ' + t('يلزم تحديد غرض العلف والمشتري ومواعيد الحش والحصاد؛ لا نفترض استمرارية الإنتاج.', 'Confirm feed purpose, buyer and cutting/harvest dates; continuity is not assumed.'),
            risk: baseline ? t('يلزم توثيق الممارسة الفعلية أولًا قبل مقارنتها ببديل.', 'Document actual practice before comparing it with an alternative.') : t('معلومات ناقصة: البذار والعمالة والمعدات والتمويل وتوقيت الانتقال ونوعية الماء والتربة. لم نقدر غلة دورة كاملة أو ربحًا.', 'Missing information: seed, labour, equipment, finance, transition timing and water/soil quality. No whole-cycle yield or profit is estimated.'),
          };
          return <article className="strategy-card" key={sequence?.id ?? 'baseline_unknown'} data-strategy={sequence?.id ?? 'baseline_unknown'}>
            <p className="strategy-status">{baseline ? t('خط الأساس · غير معروف', 'Baseline · Unknown') : t('خيار منشور محليًا', 'Locally published option')}</p>
            <h3>{sequence?.name[language] ?? t('التتابع الحالي للمزرعة', 'Current farm sequence')}</h3>
            <p>{baseline ? t('المحاصيل وترتيبها وموسمها غير معروفة لهذه الحالة الافتراضية.', 'Crops, order and seasons are unknown for this fictional case.') : t(`صيف: ${sequence.summer.ar}، ثم شتاء: ${sequence.winter.ar}. مواعيد الزراعة والحصاد الدقيقة غير متحققة؛ لم نفترض تواريخ.`, `Summer: ${sequence.summer.en}, then winter: ${sequence.winter.en}. Exact planting and harvest dates are unverified; no dates are assumed.`)}</p>
            {order.map(topic => <section className="strategy-topic" key={topic} data-topic={topic}><h4>{labels[topic][language]}</h4><p>{statements[topic]}</p>
              {topic === 'soil' && !baseline && <a href={sequence.id === 'sorghum_vetch' ? sare : sesbania} target="_blank" rel="noreferrer">{t('مصدر الآلية العامة، وليس أثرًا محليًا مثبتًا', 'General mechanism source, not a proven local effect')}</a>}
            </section>)}
            {!baseline && <a href={localSource.url} target="_blank" rel="noreferrer">{t('مصدر ترتيب المحاصيل محليًا', 'Local crop-order source')} · LENSES §3.1.1</a>}
          </article>;
        })}
      </div>
      <p className="model-limit">{t('أفضل دليل المستخدم المتاح يخص الخضار، بينما هذه التجربة للأعلاف. لا ننقل دليل تبني فئة إلى الأخرى. لم يجرِ فريقنا مقابلات أو قياسات حقلية أو اختبارًا لقيمة الأداة.', 'The strongest available user evidence concerns vegetables; this trial concerns forage. Adoption evidence is not transferred between them. Our team has not conducted interviews, field measurements or a value test.')}</p>
    </div>
  </details>;
}
