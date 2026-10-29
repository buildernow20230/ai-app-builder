import { z } from "zod";

const EnvSchema = z.object({
  // لو فاضي، الخادم يشتغل في الوضع التجريبي ويرجّع تطبيقات أمثلة بدون تكلفة
  ANTHROPIC_API_KEY: z.string().trim().default(""),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-5-5"),
  PORT: z.coerce.number().int().positive().default(3001),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),
});

export type Config = z.infer<typeof EnvSchema>;

export function loadConfig(): Config {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`إعدادات البيئة غير صحيحة:\n${issues}`);
  }
  return parsed.data;
}
