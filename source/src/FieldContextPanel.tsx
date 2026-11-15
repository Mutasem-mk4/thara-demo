// SPDX-License-Identifier: Apache-2.0
import { Field, Ltr, type Translate } from './fields';
import type { Language } from './evidence';
import { contextFields, measurementDocumented, priorityNames, reviewOrder, type PlanningContext, type SalinityRecord } from './planningContext';

function SalinityEditor({ record, kind, update, t }: { record: SalinityRecord; kind: 'soil' | 'water'; update: (record: SalinityRecord) => void; t: Translate }) {
  const name = kind === 'soil' ? t('ملوحة التربة ECe', 'Soil salinity ECe') : t('ملوحة ماء الري ECw', 'Irrigation water salinity ECw');
  return <fieldset className="salinity-editor"><legend>{name}</legend>
    <Field label={t(`حالة ${name}`, `${name} status`)}><select value={record.state} onChange={event => update({ ...record, state: event.currentTarget.value as SalinityRecord['state'] })}>
      <option value="not_entered">{t('لم أُدخل', 'Not entered')}</option><option value="unknown">{t('لا أعرف', 'I do not know')}</option><option value="measured">{t('عندي قياس من تقرير', 'I have a measurement report')}</option>
    </select></Field>
    {record.state === 'measured' && <>
      <p className="model-limit">{kind === 'soil' ? t('ECe تخص مستخلص الإشباع. لا تدخل قراءة مستخلص 1:5 أو ECw بدلها. نعرض القياس كما أدخلته، ولا نتحقق من صحته.', 'ECe refers to the saturated-paste extract. Do not substitute a 1:5 extract or ECw. This is your reported measurement, not a verified result.') : t('ECw تخص ماء الري، ولا تعوّض قياس ملوحة التربة. لا نستنتج منها ملاءمة المحصول.', 'ECw describes irrigation water and does not replace soil ECe. No crop suitability is inferred.')}</p>
      <div className="input-pair">
        <Field label={`${name} · dS/m`}><input type="number" min="0" step="any" dir="ltr" value={record.value} onChange={event => update({ ...record, value: event.currentTarget.value })} /></Field>
        <Field label={t(`تاريخ ${name}`, `${name} date`)}><input type="date" dir="ltr" value={record.date} onChange={event => update({ ...record, date: event.currentTarget.value })} /></Field>
        <Field label={t(`طريقة قياس ${name}`, `${name} measurement method`)}><input value={record.method} onChange={event => update({ ...record, method: event.currentTarget.value })} /></Field>
        <Field label={t(`مصدر قياس ${name}`, `${name} measurement source`)}><input value={record.source} onChange={event => update({ ...record, source: event.currentTarget.value })} /></Field>
        {kind === 'soil' && <Field label={t('عمق عينة ECe بالسنتيمتر', 'ECe sample depth in centimetres')}><input type="number" min="0.1" step="any" dir="ltr" value={record.depth} onChange={event => update({ ...record, depth: event.currentTarget.value })} /></Field>}
      </div>
      <p className="measurement-status">{measurementDocumented(record, kind) ? t('بيانات التوثيق مدخلة؛ القياس نفسه غير متحقق منه.', 'Documentation fields are recorded; the measurement itself is unverified.') : t('توثيق القياس غير مكتمل. لا نملأ النواقص بافتراضات.', 'Measurement documentation is incomplete. Missing fields are not assumed.')}</p>
    </>}
  </fieldset>;
}

export function ContextEditor({ context, update, t, language }: { context: PlanningContext; update: (context: PlanningContext) => void; t: Translate; language: Language }) {
  return <details className="disclosure context-editor no-print"><summary>{t('معلومات الحقل والقيود، اختياري', 'Field information and constraints, optional')}</summary>
    <p className="model-limit">{t('بتظهر هذه المعلومات في أسئلة المراجعة والملخص، ولا تغيّر معاملات NASA أو FAO. إدخالها مش تحقق منها.', 'These inputs appear in review questions and the summary; they do not change NASA or FAO coefficients. Recording them does not verify them.')}</p>
    <div className="context-fields">{contextFields.map(field => {
      const note = context.notes[field.id];
      const label = field[language];
      return <fieldset key={field.id}><legend>{label}</legend>
        <Field label={t(`حالة ${label}`, `${label} status`)}><select value={note.state} onChange={event => update({ ...context, notes: { ...context.notes, [field.id]: { ...note, state: event.currentTarget.value } } })}>
          <option value="not_entered">{t('لم أُدخل', 'Not entered')}</option><option value="unknown">{t('لا أعرف', 'I do not know')}</option><option value="reported">{t('عندي معلومة أو قيد', 'I have information or a constraint')}</option>
        </select></Field>
        {note.state === 'reported' && <Field label={label}><textarea rows={2} value={note.text} onChange={event => update({ ...context, notes: { ...context.notes, [field.id]: { ...note, text: event.currentTarget.value } } })} /></Field>}
      </fieldset>;
    })}</div>
    <SalinityEditor record={context.soilECe} kind="soil" update={soilECe => update({ ...context, soilECe })} t={t} />
    <SalinityEditor record={context.waterECw} kind="water" update={waterECw => update({ ...context, waterECw })} t={t} />
  </details>;
}

export function PriorityReview({ context, update, t, language }: { context: PlanningContext; update: (context: PlanningContext) => void; t: Translate; language: Language }) {
  const explanations = {
    water: t('ابدأ بكمية الدور والفاصل بين الأدوار. النسبة مقارنة بالاستهلاك المقدر؛ المطر الفعال ومخزون التربة غير محسوبين.', 'Start with turn volume and the interval between turns. The ratio compares estimated use; effective rain and stored soil water are not balanced.'),
    soil: t('ابدأ بتاريخ القطعة والصرف وقياسات التربة. اختلاف عائلة المحصول فحص أولي، وليس حكمًا بتحسن التربة.', 'Start with field history, drainage and soil measurements. A different crop family is an initial check, not evidence of improved soil.'),
    risk: t('ابدأ بالسوق والمال والعمالة والمعدات قبل اعتماد موعد. لا نحسب ربحًا أو احتمال خسارة من هذه الملاحظات.', 'Start with market, finance, labour and equipment before adopting a date. These notes do not produce profit or loss probabilities.'),
  };
  return <section className="priority-review">
    <Field label={t('شو أولويتك بالمقارنة؟', 'Your comparison priority')}><select value={context.priority} onChange={event => update({ ...context, priority: event.currentTarget.value as PlanningContext['priority'] })}>
      {(['water', 'soil', 'risk'] as const).map(priority => <option value={priority} key={priority}>{priorityNames[priority][language]}</option>)}
    </select></Field>
    <p className="model-limit">{t('الأولوية تغيّر ترتيب الشرح والأسئلة، وليس القيم العلمية أو ترتيب أفضلية المحاصيل.', 'Priority changes the order of explanations and questions, not scientific values or a crop ranking.')}</p>
    <div className="review-sections">{reviewOrder(context.priority).map(priority => <section key={priority} data-review={priority}>
      <h3>{priorityNames[priority][language]}</h3><p>{explanations[priority]}</p>
      <ul>{contextFields.filter(field => field.group === priority).map(field => {
        const note = context.notes[field.id];
        return <li key={field.id}><strong>{field[language]}</strong>: {note.state === 'reported' && note.text.trim()
          ? <>{t('قيد أو معلومة أدخلتها', 'User-entered information or constraint')} — {note.text}</>
          : note.state === 'unknown' ? t('لا أعرف؛ يلزم التحقق.', 'Unknown; needs checking.') : note.state === 'reported' ? t('التفاصيل لم تُكتب.', 'Details are missing.') : t('لم يُدخل.', 'Not entered.')}</li>;
      })}</ul>
    </section>)}</div>
    <details className="disclosure measurement-summary print-expand"><summary>{t('قياسات الملوحة المسجّلة', 'Recorded salinity measurements')}</summary>
      {(['soilECe', 'waterECw'] as const).map(key => {
        const record = context[key], kind = key === 'soilECe' ? 'soil' : 'water';
        return <div className="source-record" key={key}><h4>{key === 'soilECe' ? t('التربة ECe', 'Soil ECe') : t('ماء الري ECw', 'Irrigation water ECw')}</h4>
          {record.state !== 'measured' ? <p>{record.state === 'unknown' ? t('لا أعرف', 'Unknown') : t('لم يُدخل', 'Not entered')}</p> : <>
            <p>{record.value.trim() ? <Ltr>{record.value} {record.unit}</Ltr> : t('القيمة غير مدخلة', 'Value not entered')} · {t('تاريخ', 'Date')} <Ltr>{record.date || '—'}</Ltr></p>
            <p>{t('الطريقة', 'Method')}: {record.method || '—'} · {t('المصدر', 'Source')}: {record.source || '—'}{kind === 'soil' && <> · {t('العمق', 'Depth')}: <Ltr>{record.depth || '—'} cm</Ltr></>}</p>
            <p>{measurementDocumented(record, kind) ? t('قياس يذكره المستخدم مع بيانات التوثيق؛ لم نتحقق منه.', 'User-reported measurement with documentation fields; unverified.') : t('قياس يذكره المستخدم بتوثيق ناقص؛ غير متحقق منه.', 'User-reported measurement with incomplete documentation; unverified.')}</p>
          </>}
        </div>;
      })}
      <p className="model-limit">{t('ECw وECe قياسان مختلفان. لا نحولهما لبعض ولا نستخدمهما لإعلان ملاءمة محصول.', 'ECw and ECe are different measurements. They are not converted into one another or used to declare crop suitability.')}</p>
    </details>
  </section>;
}
