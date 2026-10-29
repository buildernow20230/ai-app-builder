import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { DOMAINS, DOMAIN_KEYS } from "./domains.js";
import { AppGenerator } from "./ai/generator.js";

const config = loadConfig();
const generator = new AppGenerator(config.ANTHROPIC_API_KEY, config.ANTHROPIC_MODEL);

const app = Fastify({ logger: true });
await app.register(cors, { origin: config.WEB_ORIGIN });

app.get("/health", async () => ({ status: "ok" }));

app.get("/domains", async () =>
  DOMAIN_KEYS.map((key) => ({ key, label: DOMAINS[key].label })),
);

const GenerateBody = z.object({
  prompt: z.string().trim().min(10, "اكتب وصف أوضح للتطبيق (10 حروف على الأقل)").max(4000),
  domain: z.enum(DOMAIN_KEYS),
});

app.post("/generate", async (request, reply) => {
  const body = GenerateBody.safeParse(request.body);
  if (!body.success) {
    return reply.status(400).send({ error: body.error.issues[0]?.message ?? "طلب غير صحيح" });
  }

  try {
    const result = await generator.generate(body.data);
    request.log.info({ usage: result.usage, model: result.model }, "generation complete");
    return result;
  } catch (err) {
    request.log.error(err, "generation failed");
    return reply.status(502).send({ error: "حصلت مشكلة أثناء توليد التطبيق، حاول تاني" });
  }
});

await app.listen({ port: config.PORT, host: "0.0.0.0" });
