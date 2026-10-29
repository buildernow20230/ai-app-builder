import type { DomainKey } from "../domains.js";
import type { GenerateInput, GenerateResult, Generator } from "./types.js";

/**
 * مولّد تجريبي: يرجّع تطبيق مثال جاهز لكل مجال بدون استدعاء الـ API.
 * بيُستخدم لما ANTHROPIC_API_KEY مش موجود، عشان نجرب الواجهة بدون تكلفة.
 */
export class DemoGenerator implements Generator {
  readonly mode = "demo" as const;

  async generate({ prompt, domain }: GenerateInput): Promise<GenerateResult> {
    // تأخير بسيط عشان نحاكي وقت التوليد الحقيقي في الواجهة
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return {
      html: SAMPLES[domain](prompt),
      usage: { inputTokens: 0, outputTokens: 0 },
      model: "demo",
    };
  }
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const shell = (title: string, prompt: string, body: string, script: string) => `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Cairo", sans-serif; background: #f4f6f8; color: #1c2430; }
  header { background: #0f766e; color: #fff; padding: 16px 24px; }
  header h1 { margin: 0; font-size: 1.4rem; }
  .demo { background: #fef3c7; color: #92400e; padding: 8px 24px; font-size: .9rem; }
  main { padding: 24px; display: grid; gap: 20px; max-width: 1000px; margin: auto; }
  .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .card h2 { margin-top: 0; font-size: 1.1rem; }
  form { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; align-items: end; }
  input, select, button { font: inherit; padding: 8px 10px; border: 1px solid #d0d7de; border-radius: 6px; }
  button { background: #0f766e; color: #fff; border: none; cursor: pointer; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px; border-bottom: 1px solid #eef1f4; text-align: right; }
  th { background: #f8fafc; }
  .low { color: #b42318; font-weight: 700; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
  .stat { background: #f0fdfa; border-radius: 8px; padding: 12px; }
  .stat b { display: block; font-size: 1.4rem; }
</style>
</head>
<body>
<header><h1>${title}</h1></header>
<div class="demo">وضع تجريبي: ده تطبيق مثال ثابت. طلبك كان: «${escapeHtml(prompt)}»</div>
<main>${body}</main>
<script>
const fmt = (n) => Number(n).toLocaleString("ar-EG", { maximumFractionDigits: 2 });
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
${script}
</script>
</body>
</html>`;

const SAMPLES: Record<DomainKey, (prompt: string) => string> = {
  inventory_sales: (prompt) =>
    shell(
      "إدارة المخزون والمبيعات",
      prompt,
      `
  <div class="stats">
    <div class="stat">عدد الأصناف<b id="sCount">٠</b></div>
    <div class="stat">قيمة المخزون<b id="sValue">٠</b></div>
    <div class="stat">إجمالي المبيعات<b id="sSales">٠</b></div>
  </div>
  <section class="card">
    <h2>إضافة صنف</h2>
    <form id="itemForm">
      <input name="name" placeholder="اسم الصنف" required />
      <input name="qty" type="number" min="0" placeholder="الكمية" required />
      <input name="price" type="number" min="0" step="0.01" placeholder="سعر البيع" required />
      <input name="min" type="number" min="0" placeholder="حد الطلب" value="5" />
      <button>إضافة</button>
    </form>
  </section>
  <section class="card">
    <h2>فاتورة بيع</h2>
    <form id="saleForm">
      <select name="item" id="saleItem" required></select>
      <input name="qty" type="number" min="1" placeholder="الكمية" required />
      <input name="customer" placeholder="اسم العميل" />
      <button>تسجيل البيع</button>
    </form>
  </section>
  <section class="card">
    <h2>الأصناف</h2>
    <table><thead><tr><th>الصنف</th><th>الرصيد</th><th>السعر</th><th>القيمة</th></tr></thead><tbody id="items"></tbody></table>
  </section>`,
      `
let items = load("demo_items", [
  { name: "فلتر زيت", qty: 40, price: 85, min: 10 },
  { name: "تيل فرامل", qty: 4, price: 450, min: 5 },
  { name: "بوجيه", qty: 120, price: 60, min: 20 },
]);
let sales = load("demo_sales", []);
function render() {
  document.getElementById("items").innerHTML = items.map((i) =>
    "<tr><td>" + i.name + "</td><td class='" + (i.qty <= i.min ? "low" : "") + "'>" + fmt(i.qty) +
    "</td><td>" + fmt(i.price) + " ج.م</td><td>" + fmt(i.qty * i.price) + " ج.م</td></tr>").join("");
  document.getElementById("saleItem").innerHTML = items.map((i, n) => "<option value='" + n + "'>" + i.name + "</option>").join("");
  document.getElementById("sCount").textContent = fmt(items.length);
  document.getElementById("sValue").textContent = fmt(items.reduce((s, i) => s + i.qty * i.price, 0)) + " ج.م";
  document.getElementById("sSales").textContent = fmt(sales.reduce((s, x) => s + x.total, 0)) + " ج.م";
  save("demo_items", items); save("demo_sales", sales);
}
document.getElementById("itemForm").onsubmit = (e) => {
  e.preventDefault(); const f = new FormData(e.target);
  items.push({ name: f.get("name"), qty: +f.get("qty"), price: +f.get("price"), min: +f.get("min") || 0 });
  e.target.reset(); render();
};
document.getElementById("saleForm").onsubmit = (e) => {
  e.preventDefault(); const f = new FormData(e.target); const item = items[+f.get("item")]; const qty = +f.get("qty");
  if (qty > item.qty) { alert("الكمية المطلوبة أكبر من الرصيد"); return; }
  item.qty -= qty; sales.push({ item: item.name, qty, total: qty * item.price, customer: f.get("customer") });
  e.target.reset(); render();
};
render();`,
    ),

  accounting: (prompt) =>
    shell(
      "الحسابات العامة",
      prompt,
      `
  <section class="card">
    <h2>قيد يومية</h2>
    <form id="entryForm">
      <input name="date" type="date" required />
      <select name="debit" id="debit" required></select>
      <select name="credit" id="credit" required></select>
      <input name="amount" type="number" min="0.01" step="0.01" placeholder="المبلغ" required />
      <input name="memo" placeholder="البيان" />
      <button>تسجيل القيد</button>
    </form>
  </section>
  <section class="card">
    <h2>ميزان المراجعة</h2>
    <table><thead><tr><th>الحساب</th><th>مدين</th><th>دائن</th></tr></thead><tbody id="tb"></tbody></table>
  </section>
  <section class="card">
    <h2>دفتر اليومية</h2>
    <table><thead><tr><th>التاريخ</th><th>من حـ/</th><th>إلى حـ/</th><th>المبلغ</th><th>البيان</th></tr></thead><tbody id="journal"></tbody></table>
  </section>`,
      `
const accounts = ["الصندوق", "البنك", "العملاء", "الموردين", "المبيعات", "المشتريات", "المصروفات العمومية", "رأس المال"];
let entries = load("demo_entries", [
  { date: "2026-10-01", debit: "الصندوق", credit: "رأس المال", amount: 100000, memo: "إيداع رأس المال" },
  { date: "2026-10-05", debit: "المشتريات", credit: "الصندوق", amount: 25000, memo: "شراء بضاعة نقدًا" },
  { date: "2026-10-10", debit: "العملاء", credit: "المبيعات", amount: 40000, memo: "مبيعات آجلة" },
]);
const opts = accounts.map((a) => "<option>" + a + "</option>").join("");
document.getElementById("debit").innerHTML = opts;
document.getElementById("credit").innerHTML = opts;
function render() {
  document.getElementById("journal").innerHTML = entries.map((e) =>
    "<tr><td>" + e.date + "</td><td>" + e.debit + "</td><td>" + e.credit + "</td><td>" + fmt(e.amount) + "</td><td>" + (e.memo || "") + "</td></tr>").join("");
  const bal = {};
  entries.forEach((e) => { bal[e.debit] = (bal[e.debit] || 0) + e.amount; bal[e.credit] = (bal[e.credit] || 0) - e.amount; });
  let td = 0, tc = 0;
  const rows = Object.entries(bal).filter(([, v]) => v !== 0).map(([a, v]) => {
    if (v > 0) td += v; else tc -= v;
    return "<tr><td>" + a + "</td><td>" + (v > 0 ? fmt(v) : "") + "</td><td>" + (v < 0 ? fmt(-v) : "") + "</td></tr>";
  });
  rows.push("<tr><th>الإجمالي</th><th>" + fmt(td) + "</th><th>" + fmt(tc) + "</th></tr>");
  document.getElementById("tb").innerHTML = rows.join("");
  save("demo_entries", entries);
}
document.getElementById("entryForm").onsubmit = (e) => {
  e.preventDefault(); const f = new FormData(e.target);
  if (f.get("debit") === f.get("credit")) { alert("الحساب المدين والدائن لازم يكونوا مختلفين"); return; }
  entries.push({ date: f.get("date"), debit: f.get("debit"), credit: f.get("credit"), amount: +f.get("amount"), memo: f.get("memo") });
  e.target.reset(); render();
};
render();`,
    ),
};
