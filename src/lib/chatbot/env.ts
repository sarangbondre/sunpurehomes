import { z } from "zod";
import { site } from "@/lib/site";

/**
 * Configuration for Arka, read from the environment and validated once.
 *
 * Server-only: nothing here may be imported into a client component. The two
 * keys are secrets and live in Vercel's environment, never in the repo — see
 * .env.example for the names.
 *
 * Every variable is optional on purpose. Without a model key the widget does
 * not break; it tells the visitor it cannot answer right now and shows the
 * sales contact buttons. Without an email key the enquiry form does the same.
 * A misconfigured deploy degrades to the WhatsApp link, which is what the site
 * did before Arka existed.
 */

const PROVIDERS = ["huggingface", "anthropic", "openai-compatible"] as const;
export type ProviderKind = (typeof PROVIDERS)[number];

const optional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const schema = z.object({
  /*
    Hugging Face Inference Providers by default, at the client's instruction
    on 16 September 2026 — open models at the host's own price. Claude and any
    other OpenAI-compatible host remain one variable away. See
    docs/adr/0002-arka.md.
  */
  ARKA_PROVIDER: z.enum(PROVIDERS).default("huggingface"),
  ARKA_MODEL: optional,
  /** Hugging Face's own name for the variable, so an existing token just works. */
  HF_TOKEN: optional,
  ANTHROPIC_API_KEY: optional,
  ARKA_OSS_BASE_URL: optional.pipe(z.string().url().optional()),
  ARKA_OSS_API_KEY: optional,
  /** Ceiling on a reply. A reply is short by design; this is not a target. */
  ARKA_MAX_TOKENS: z.coerce.number().int().min(100).max(4_000).default(500),
  /** Per model call, before the SDK's single retry. */
  ARKA_TIMEOUT_MS: z.coerce.number().int().min(2_000).max(60_000).default(20_000),
  /*
    Open-source hosts only. Current Claude models reject sampling parameters,
    so the Anthropic adapter sends none.
  */
  ARKA_OSS_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.2),
  RESEND_API_KEY: optional,
  LEAD_INBOX: optional.pipe(z.string().email().optional()),
  LEAD_FROM: optional,
});

export type ArkaConfig = {
  provider: ProviderKind;
  model: string;
  /** Set only when the chosen provider has everything it needs. */
  ready: boolean;
  anthropicKey?: string;
  ossBaseUrl?: string;
  ossKey?: string;
  maxTokens: number;
  timeoutMs: number;
  ossTemperature: number;
  lead: {
    ready: boolean;
    resendKey?: string;
    inbox: string;
    from?: string;
  };
};

/*
  The provider suffix is part of the id on Hugging Face and it matters: an
  unpinned id is routed per request to whichever host is fastest, so the
  model a visitor gets could differ from the one the eval passed. Llama 3.3
  70B is served by Novita at $0.135 in / $0.40 out per million tokens
  (16 September 2026). An 8B is cheaper still but markedly worse at holding a
  refusal under pressure — run the eval before swapping it in.
*/
const DEFAULT_MODEL: Record<ProviderKind, string | undefined> = {
  huggingface: "meta-llama/Llama-3.3-70B-Instruct:novita",
  anthropic: "claude-haiku-4-5",
  // No sensible default: other hosts' model ids are host-specific.
  "openai-compatible": undefined,
};

const DEFAULT_BASE_URL: Record<ProviderKind, string | undefined> = {
  huggingface: "https://router.huggingface.co/v1",
  anthropic: undefined,
  "openai-compatible": undefined,
};

/** Pure, so it can be tested without touching process.env. */
export function parseConfig(source: Record<string, string | undefined>): ArkaConfig {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    // Name the variable, never echo its value.
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Arka configuration is invalid: ${fields}`);
  }
  const env = parsed.data;
  const provider = env.ARKA_PROVIDER;
  const model = env.ARKA_MODEL ?? DEFAULT_MODEL[provider] ?? "";

  // Everything but Anthropic speaks the OpenAI-compatible protocol.
  const ossBaseUrl = env.ARKA_OSS_BASE_URL ?? DEFAULT_BASE_URL[provider];
  const ossKey =
    provider === "huggingface"
      ? (env.HF_TOKEN ?? env.ARKA_OSS_API_KEY)
      : env.ARKA_OSS_API_KEY;

  const ready =
    model !== "" &&
    (provider === "anthropic"
      ? Boolean(env.ANTHROPIC_API_KEY)
      : Boolean(ossBaseUrl && ossKey));

  return {
    provider,
    model,
    ready,
    anthropicKey: env.ANTHROPIC_API_KEY,
    ossBaseUrl,
    ossKey,
    maxTokens: env.ARKA_MAX_TOKENS,
    timeoutMs: env.ARKA_TIMEOUT_MS,
    ossTemperature: env.ARKA_OSS_TEMPERATURE,
    lead: {
      ready: Boolean(env.RESEND_API_KEY && env.LEAD_FROM),
      resendKey: env.RESEND_API_KEY,
      inbox: env.LEAD_INBOX ?? site.contact.email,
      from: env.LEAD_FROM,
    },
  };
}

let cached: ArkaConfig | undefined;

export function arkaConfig(): ArkaConfig {
  cached ??= parseConfig(process.env);
  return cached;
}
