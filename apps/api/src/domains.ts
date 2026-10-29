/**
 * المجالات المدعومة في الإصدار الأول.
 * كل مجال له وصف يُضاف لتعليمات النظام عشان التطبيق المولَّد يكون مناسب للسوق.
 */
export const DOMAINS = {
  inventory_sales: {
    label: "المخزون والمبيعات",
    guidance:
      "التطبيق يخص إدارة المخزون والمبيعات: أصناف، مخازن، حركات وارد وصادر، فواتير بيع، عملاء، وتقارير رصيد المخزون والمبيعات.",
  },
  accounting: {
    label: "الحسابات",
    guidance:
      "التطبيق يخص الحسابات: دليل حسابات، قيود يومية، دفتر أستاذ، ميزان مراجعة، وقائمة دخل ومركز مالي بالمعايير المصرية.",
  },
} as const;

export type DomainKey = keyof typeof DOMAINS;
export const DOMAIN_KEYS = Object.keys(DOMAINS) as [DomainKey, ...DomainKey[]];
