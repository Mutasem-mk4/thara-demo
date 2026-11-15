// SPDX-License-Identifier: Apache-2.0
import type { Language } from './evidence';

type Bilingual = Record<Language, string>;
type Source = { label: Bilingual; url: string };
type Crop = { group: 'vegetables' | 'research'; name: Bilingual; check: Bilingual; action: Bilingual; milestone?: Bilingual; sources: readonly Source[] };

const fao: Source = {
  label: { ar: 'FAO · الفترات الحسّاسة لنقص الماء', en: 'FAO · Stages sensitive to water shortages' },
  url: 'https://www.fao.org/4/t7202e/t7202e05.htm',
};
const umn: Source = {
  label: { ar: 'جامعة مينيسوتا · ريّ الخضار', en: 'University of Minnesota Extension · Vegetable irrigation' },
  url: 'https://extension.umn.edu/agriculture/specialty-crops/vegetable-farming/irrigation-strategies-for-vegetables',
};
const usu: Source = {
  label: { ar: 'جامعة ولاية يوتا · ريّ القرعيات', en: 'Utah State University Extension · Cucurbit irrigation' },
  url: 'https://extension.usu.edu/vegetableguide/cucurbits/irrigation',
};
const uga: Source = {
  label: { ar: 'جامعة جورجيا · البامية', en: 'University of Georgia Extension · Okra' },
  url: 'https://site.extension.uga.edu/colquittag/files/2023/10/Okra.pdf',
};
const barleyStages: Source = {
  label: { ar: 'جامعة مينيسوتا · مراحل نمو الشعير', en: 'University of Minnesota Extension · Spring barley growth stages' },
  url: 'https://extension.umn.edu/agriculture/crop-production/small-grains/spring-barley-growth-and-development-guide',
};
const lenses: Source = {
  label: { ar: 'LENSES · تجربة دير علا، §3.1.1', en: 'LENSES · Deir Alla trial, §3.1.1' },
  url: 'https://www.lenses-prima.eu/wp-content/uploads/2024/02/D2_2_Activity_of_the_LAAs-D2_2_Activity_of_the_LENSES_Learning_and_Action_Al.pdf',
};

export const vegetableContext: Source = {
  label: { ar: 'دائرة الإحصاءات العامة · محاصيل الخضار في دير علا (2019)', en: 'Jordan Department of Statistics · Deir Alla vegetables (2019)' },
  url: 'https://dosweb.dos.gov.jo/DataBank/Agri/Agr_2019.pdf#page=87',
};

export const cropGuidance = {
  tomato: {
    group: 'vegetables', name: { ar: 'بندورة (طماطم)', en: 'Tomato' },
    check: { ar: 'إزهار البندورة مرحلة حسّاسة لنقص الماء.', en: 'Tomato is sensitive to water shortages during flowering.' },
    action: { ar: "لما تلاحظ أول زهر، سجّل التاريخ وشوف مواعيد الميّ حواليه.", en: "When you see the first flowers, record the date and check the water turns around it." },
    milestone: { ar: "تاريخ أول زهر لاحظته", en: "Date you saw the first flowers" },
    sources: [fao],
  },
  cucumber: {
    group: 'vegetables', name: { ar: 'خيار', en: 'Cucumber' },
    check: { ar: 'راجع انتظام رطوبة التربة عند إزهار الخيار وعقد الثمار.', en: 'Check how evenly soil moisture is maintained during flowering and fruit set.' },
    action: { ar: "لما تلاحظ أول ثمار خيار صغيرة، سجّل التاريخ وراجع مواعيد الميّ حواليه.", en: "Record when the first small cucumbers appear and check the water turns around that date." },
    milestone: { ar: "تاريخ ظهور أول ثمار صغيرة", en: "Date the first small fruits appeared" },
    sources: [usu],
  },
  zucchini: {
    group: 'vegetables', name: { ar: 'كوسا', en: 'Zucchini' },
    check: { ar: 'تحتاج الكوسا إلى توفر رطوبة منتظمة حول الإزهار وعقد الثمار.', en: 'Zucchini benefits from consistent moisture around flowering and fruit set.' },
    action: { ar: "سجّل تاريخ أول زهر بالكوسا وراجع مواعيد الميّ حواليه.", en: "Record the first zucchini flowers and check the water turns around that date." },
    milestone: { ar: "تاريخ أول زهر لاحظته", en: "Date you saw the first flowers" },
    sources: [usu],
  },
  eggplant: {
    group: 'vegetables', name: { ar: 'باذنجان', en: 'Eggplant' },
    check: { ar: 'راجع رطوبة التربة خلال إزهار الباذنجان وعقد ثماره وتطوّرها.', en: 'Check soil moisture through eggplant flowering, fruit set and development.' },
    action: { ar: "سجّل يوم ظهور أول ثمار باذنجان صغيرة وراجع مواعيد الميّ حواليه.", en: "Record when the first small eggplants appear and check the water turns around that date." },
    milestone: { ar: "تاريخ ظهور أول ثمار صغيرة", en: "Date the first small fruits appeared" },
    sources: [umn],
  },
  pepper: {
    group: 'vegetables', name: { ar: 'فلفل', en: 'Pepper' },
    check: { ar: 'قد يتأثر الفلفل بنقص الماء طوال الموسم، وتستحق مرحلتا الإزهار وتكوّن الثمار مراجعة خاصة.', en: 'Water shortages can affect pepper throughout the season, with flowering and fruit development worth particular attention.' },
    action: { ar: "سجّل يوم ظهور أول ثمار فلفل صغيرة وراجع مواعيد الميّ حواليه.", en: "Record when the first small peppers appear and check the water turns around that date." },
    milestone: { ar: "تاريخ ظهور أول ثمار صغيرة", en: "Date the first small fruits appeared" },
    sources: [fao, umn],
  },
  potato: {
    group: 'vegetables', name: { ar: 'بطاطا', en: 'Potato' },
    check: { ar: 'بدء تكوّن درنات البطاطا وتضخّمها مرحلتان تستحقان متابعة رطوبة التربة.', en: 'Monitor soil moisture around potato tuber initiation and enlargement.' },
    action: { ar: "إذا بتعرف متى بدأ تكوّن حبات البطاطا تحت التربة، سجّل التاريخ وراجع مواعيد الميّ حواليه.", en: "If you know when the tubers began forming underground, record the date and check the water turns around it." },
    milestone: { ar: "تاريخ بدء تكوّن حبات البطاطا إن عرفته", en: "Date tubers began forming, if known" },
    sources: [fao, umn],
  },
  okra: {
    group: 'vegetables', name: { ar: 'بامية', en: 'Okra' },
    check: { ar: 'الرطوبة مهمّة للبامية أثناء الإزهار ونمو القرون.', en: 'Moisture matters for okra during flowering and pod development.' },
    action: { ar: "سجّل متى شفت أول قرون بامية وراجع مواعيد الميّ حواليه.", en: "Record when you saw the first okra pods and check the water turns around that date." },
    milestone: { ar: "تاريخ ظهور أول قرون", en: "Date the first pods appeared" },
    sources: [uga],
  },
  green_bean: {
    group: 'vegetables', name: { ar: 'فاصولياء خضراء', en: 'Green bean' },
    check: { ar: 'إزهار الفاصولياء وتكوّن القرون ونموها فترات مهمّة لمتابعة الماء.', en: 'Flowering, pod set and pod development are important periods for checking water supply.' },
    action: { ar: "سجّل متى شفت أول قرون فاصولياء وراجع مواعيد الميّ حواليه.", en: "Record when you saw the first bean pods and check the water turns around that date." },
    milestone: { ar: "تاريخ ظهور أول قرون", en: "Date the first pods appeared" },
    sources: [umn],
  },
  sorghum: {
    group: 'research', name: { ar: 'سورغم', en: 'Sorghum' },
    check: { ar: 'جرّبت LENSES السورغم كمحصول علف صيفي، وتبعته البيقية في دير علا.', en: 'LENSES trialled summer forage sorghum followed by vetch in Deir Alla.' },
    action: { ar: "سجّل الصنف من بطاقة البذار. إذا حددت موعد الزراعة، افتح التقويم وشوف مواعيد الميّ حوله.", en: "Note the variety from the seed label. If you have a planting date, check the water turns around it." },
    sources: [lenses],
  },
  vetch: {
    group: 'research', name: { ar: 'بيقية', en: 'Vetch' },
    check: { ar: 'وردت البيقية بعد السورغم في التتابع الشتوي الموثّق بدير علا.', en: 'Vetch followed sorghum in the documented winter sequence in Deir Alla.' },
    action: { ar: "تأكد من اسم البيقية على بطاقة البذار. إذا حددت موعد الزراعة، افتح التقويم وشوف مواعيد الميّ حوله.", en: "Check the vetch name on the seed label. If you have a planting date, check the water turns around it." },
    sources: [lenses],
  },
  sesbania: {
    group: 'research', name: { ar: 'سيسبانيا', en: 'Sesbania' },
    check: { ar: 'كانت السيسبانيا محصولًا صيفيًا في تجربة دير علا، وتبعها الشعير.', en: 'Sesbania was a summer crop followed by barley in the Deir Alla trial.' },
    action: { ar: "تأكد من اسم البذار على البطاقة. إذا حددت موعد الانتقال للشعير، شوف مواعيد الميّ حواليه.", en: "Check the seed name on the label. If you have a date for switching to barley, check the water turns around it." },
    sources: [lenses],
  },
  barley: {
    group: 'research', name: { ar: 'شعير', en: 'Barley' },
    check: { ar: 'جُرّب الشعير بعد السيسبانيا في دير علا. حدّد الغرض من الحصاد قبل وضع خطة الموسم.', en: 'Barley followed sesbania at Deir Alla. Confirm the intended harvest use before planning the season.' },
    action: { ar: "دوّن إذا هدفك العلف أو الحبوب. إذا حددت موعد الحصاد، شوف مواعيد الميّ قبل الموعد.", en: "Note whether you intend to grow for forage or grain. If you have a harvest date, check the water turns leading up to it." },
    sources: [lenses, barleyStages],
  },
} satisfies Record<string, Crop>;

export type CropId = keyof typeof cropGuidance;
export const cropIds = Object.keys(cropGuidance) as CropId[];

export function guidanceFor(id: string): Crop | undefined {
  return isCropId(id) ? cropGuidance[id] : undefined;
}

export function isCropId(id: string): id is CropId {
  return Object.hasOwn(cropGuidance, id);
}
