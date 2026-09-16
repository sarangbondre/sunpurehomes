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

const PROVIDERS = ["anthropic", "openai-compatible"] as const;
export type ProviderKind = (typeof PROVIDERS)[number];

const optional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const schema = z.object({
  ARKA_PROVIDER: z.enum(PROVIDERS).default("anthropic"),
  /*
    Claude Haiku 4.5 by default — the client chose a small model on cost, and
    the retrieval and guards are built so a small model is safe here. See
    docs/adr/0002-arka.md for the comparison that led to it.
  */
  ARKA_MODEL: optional,
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

const DEFAULT_MODEL: Record<ProviderKind, string | undefined> = {
  anthropic: "claude-haiku-4-5",
  // No sensible default: an open-source host's model ids are host-specific.
  "openai-compatible": undefined,
};

let cached: ArkaConfig | undefined;

export function arkaConfig(): ArkaConfig {
  if (cached) return cached;

  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // Name the variable, never echo its value.
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Arka configuration is invalid: ${fields}`);
  }
  const env = parsed.data;
  const model = env.ARKA_MODEL ?? DEFAULT_MODEL[env.ARKA_PROVIDER] ?? "";

  const ready =
    model !== "" &&
    (env.ARKA_PROVIDER === "anthropic"
      ? Boolean(env.ANTHROPIC_API_KEY)
      : Boolean(env.ARKA_OSS_BASE_URL && env.ARKA_OSS_API_KEY));

  cached = {
    provider: env.ARKA_PROVIDER,
    model,
    ready,
    anthropicKey: env.ANTHROPIC_API_KEY,
    ossBaseUrl: env.ARKA_OSS_BASE_URL,
    ossKey: env.ARKA_OSS_API_KEY,
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
  return cached;
}
