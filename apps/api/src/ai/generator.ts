import Anthropic from "@anthropic-ai/sdk";
import { DOMAINS } from "../domains.js";
import type { GenerateInput, GenerateResult, Generator } from "./types.js";

const SYSTEM_PROMPT = `أنت مولّد تطبيقات ويب لمستخدمين عرب.
- اكتب تطبيق ويب كامل في ملف HTML واحد (HTML + CSS + JavaScript داخل الملف).
- الواجهة بالعربية بالكامل، والصفحة dir="rtl" و lang="ar".
- استخدم خط عربي واضح من Google Fonts (مثل Cairo أو Tajawal).
- احفظ البيانات في localStorage مؤقتًا.
- الأرقام والتواريخ بتنسيق مناسب للعربية، والعملة الافتراضية الجنيه المصري.
- أرجع ملف HTML فقط بدون أي شرح وبدون علامات Markdown.`;

export class AppGenerator implements Generator {
  readonly mode = "live" as const;
  private client: Anthropic;

  constructor(apiKey: string, private model: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generate({ prompt, domain }: GenerateInput): Promise<GenerateResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 16000,
      system: `${SYSTEM_PROMPT}\n\nالمجال: ${DOMAINS[domain].label}. ${DOMAINS[domain].guidance}`,
      messages: [{ role: "user", content: prompt }],
    });

    const html = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .replace(/^```(?:html)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    return {
      html,
      // نسجل الاستهلاك عشان نحسب التكلفة والهامش على كل عملية توليد
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      model: response.model,
    };
  }
}
