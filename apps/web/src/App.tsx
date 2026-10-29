import { useEffect, useState } from "react";

interface Domain {
  key: string;
  label: string;
}

interface GenerateResponse {
  html: string;
  usage: { inputTokens: number; outputTokens: number };
}

export function App() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domain, setDomain] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((h: { mode: "live" | "demo" }) => setMode(h.mode))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/domains")
      .then((r) => r.json())
      .then((list: Domain[]) => {
        setDomains(list);
        setDomain(list[0]?.key ?? "");
      })
      .catch(() => setError("تعذر الاتصال بالخادم"));
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "حصل خطأ");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حصل خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="layout">
      <aside className="panel">
        <h1>ابنِ تطبيقك</h1>
        <p className="hint">اوصف التطبيق اللي محتاجه بالعربي، وهنبنيه لك.</p>
        {mode === "demo" && (
          <p className="demo-badge">وضع تجريبي: النتيجة تطبيق مثال ثابت، والتوليد الحقيقي يشتغل لما تضيف مفتاح Anthropic.</p>
        )}

        <label htmlFor="domain">المجال</label>
        <select id="domain" value={domain} onChange={(e) => setDomain(e.target.value)}>
          {domains.map((d) => (
            <option key={d.key} value={d.key}>
              {d.label}
            </option>
          ))}
        </select>

        <label htmlFor="prompt">وصف التطبيق</label>
        <textarea
          id="prompt"
          rows={8}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="مثال: برنامج لمحل قطع غيار فيه أصناف ومخزن واحد وفواتير بيع وتقرير بالأصناف اللي قربت تخلص"
        />

        <button onClick={handleGenerate} disabled={loading || !domain || prompt.trim().length < 10}>
          {loading ? "جاري البناء..." : "ابنِ التطبيق"}
        </button>

        {error && <p className="error">{error}</p>}
        {result && (
          <p className="usage">
            الاستهلاك: {result.usage.inputTokens.toLocaleString("ar-EG")} مدخلات /{" "}
            {result.usage.outputTokens.toLocaleString("ar-EG")} مخرجات
          </p>
        )}
      </aside>

      <main className="preview">
        {result ? (
          <iframe title="معاينة التطبيق" srcDoc={result.html} sandbox="allow-scripts allow-forms allow-modals" />
        ) : (
          <div className="empty">المعاينة هتظهر هنا</div>
        )}
      </main>
    </div>
  );
}
