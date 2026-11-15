// SPDX-License-Identifier: Apache-2.0
// Codex assistance is acknowledged in docs/AI_DISCLOSURE.md and ai-usage.json.
export type Language = 'ar' | 'en';
export const priorities = ['water', 'soil', 'feed', 'risk'] as const;
export type Priority = typeof priorities[number];
export const priorityLabels = {
  water: { ar: 'توفير الماء', en: 'Save water' }, soil: { ar: 'تحسين التربة', en: 'Improve soil' },
  feed: { ar: 'استمرارية العلف', en: 'Maintain feed supply' }, risk: { ar: 'تقليل المخاطر', en: 'Reduce risk' },
};
export const sources = [
  { id: 'NASA', title: 'NASA POWER Daily API', url: 'https://power.larc.nasa.gov/docs/services/api/temporal/daily/', note: { ar: 'تعريف الخدمة اليومية والتوقيت. الاستجابة المحفوظة تحدد الوحدات والمصادر.', en: 'Daily service and time standard. Saved response metadata identifies the units and sources.' } },
  { id: 'LENSES', title: 'LENSES D2.2 · §3.1.1 Deir Alla', url: 'https://www.lenses-prima.eu/wp-content/uploads/2024/02/D2_2_Activity_of_the_LAAs-D2_2_Activity_of_the_LENSES_Learning_and_Action_Al.pdf', note: { ar: 'يوثق الشعير بعد السيسبانيا والبيقية بعد السورغم. المقارنة الأصلية شملت البرسيم الحجازي.', en: 'Documents barley after sesbania and vetch after sorghum. The original research comparison also included alfalfa.' } },
  { id: 'NARC', title: 'NARC / LENSES · Forage trial', url: 'https://www.lenses-prima.eu/wp-content/uploads/2022/11/Jordan-New-forage-crops-for-fodder-production-in-a-changing-climate_NARC.pdf', note: { ar: 'سياق محاصيل الصيف والشتاء. التواريخ التفاعلية هنا افتراضات عرض، وليست تقويم التجربة.', en: 'Summer/winter crop context. Interactive dates here are display assumptions, not the trial calendar.' } },
  { id: 'USER', title: 'Ghanayem et al. (2025) · pp. 709, 711', url: 'https://journals.nasspublishing.com/index.php/rwae/article/download/104701', note: { ar: 'دراسة قصدية عن الخضار: 45 مزارعًا من 15 أسرة؛ تدعم تعدد القيود، لا تبنّي أداة الأعلاف.', en: 'Purposive vegetable study: 45 farmers from 15 households. Supports multiple decision constraints, not adoption of a forage tool.' } },
  { id: 'RIGHTS', title: 'NASA POWER · referencing & data rights', url: 'https://registry.opendata.aws/nasa-power/', note: { ar: 'يسرد سجل المشروع CC BY 4.0. تبقى بيانات الآخرين منفصلة عن ترخيص كودنا.', en: 'The project registry lists CC BY 4.0. Third-party data retains its own terms, separate from our code license.' } },
] as const;

export const sequences = [
  { id: 'sorghum_vetch', name: { ar: 'سورغم ثم بيقية', en: 'Sorghum → vetch' }, summer: { ar: 'سورغم', en: 'Sorghum' }, winter: { ar: 'بيقية', en: 'Vetch' }, context: { ar: 'علف صيفي في التجربة؛ الغرض النهائي للمنتج الشتوي غير محسوم في المواد المفحوصة.', en: 'Summer forage in the trial; the final winter product is not established in the reviewed materials.' } },
  { id: 'sesbania_barley', name: { ar: 'سيسبانيا ثم شعير', en: 'Sesbania → barley' }, summer: { ar: 'سيسبانيا', en: 'Sesbania' }, winter: { ar: 'شعير', en: 'Barley' }, context: { ar: 'علف صيفي في التجربة؛ لا نفترض أن محصول الشعير منتجه حبوب.', en: 'Summer forage in the trial; barley is not assumed to be harvested for grain.' } },
] as const;

export const questions: Record<Priority, { ar: string[]; en: string[] }> = {
  water: { ar: ['ما كمية ماء الري المتاحة ومتى يتوفر؟', 'هل بيانات التصريف والمدة والمساحة معروفة؟', 'هل توجد نتيجة حديثة لنوعية ماء الري؟'], en: ['How much irrigation water is available, and when?', 'Are flow rate, duration and area known?', 'Is there a recent irrigation-water quality measurement?'] },
  soil: { ar: ['هل توجد عينة تربة ممثلة للقطعة مع العمق والطريقة؟', 'هل قياس التربة ECe منفصل عن ماء الري ECw؟', 'ما سجل القطعة والصرف وبقايا المحصول؟'], en: ['Is there a representative soil sample with depth and method?', 'Is soil ECe distinguished from irrigation-water ECw?', 'What is known about field history, drainage and residues?'] },
  feed: { ar: ['ما غرض العلف المطلوب وموعد الحاجة إليه؟', 'هل مواعيد الحصاد والفجوة بين المحصولين متحققة؟', 'هل السوق والعمالة والتمويل متاحة في الوقت المطلوب؟'], en: ['What feed product is needed, and when?', 'Are harvest dates and the gap between crops verified?', 'Are buyers, labour and finance available at the required time?'] },
  risk: { ar: ['ما الذي قد يعطّل انتقالك للمحصول التالي؟', 'هل البذار والعمالة والمعدات والمشتري متاحون في الموعد؟'], en: ['What could delay the transition to the next crop?', 'Are seed, labour, equipment and a buyer available when needed?'] },
};
