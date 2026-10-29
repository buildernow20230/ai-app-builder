import type { DomainKey } from "../domains.js";

export interface GenerateInput {
  prompt: string;
  domain: DomainKey;
}

export interface GenerateResult {
  html: string;
  usage: { inputTokens: number; outputTokens: number };
  model: string;
}

export interface Generator {
  readonly mode: "live" | "demo";
  generate(input: GenerateInput): Promise<GenerateResult>;
}
