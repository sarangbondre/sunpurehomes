"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/brand/icons";
import { SunMark, type ProjectOption } from "@/components/chat/arka";
import {
  GREETING,
  LIMITED,
  SUGGESTIONS,
  UNAVAILABLE,
  projectSuggestions,
} from "@/lib/chatbot/copy";
import type { Entry } from "@/lib/chatbot/entry";
import type { ArkaEvent } from "@/lib/chatbot/guards";
import { slugFromPath } from "@/lib/chatbot/paths";
import {
  mailtoHref,
  projectEnquiryMessage,
  telHref,
  whatsappHref,
} from "@/lib/links";
import { site } from "@/lib/site";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  /** Show the contact buttons under this reply. */
  handoff?: boolean;
};

type LeadStatus = "idle" | "sending" | "sent" | "failed";

const MAX_QUESTION = 600;

/**
 * The conversation.
 *
 * A dialog rather than a disclosure, so it takes focus when it opens — the
 * menu panel beside it does not, and its own comment explains that it only
 * holds links. Unlike the menu it does not close on a click elsewhere: a
 * visitor reads the page Arka pointed them at while the conversation is open,
 * and losing the panel to that click would be the wrong way round. Escape and
 * the close button close it, and focus goes back to the launcher.
 *
 * It is not modal. The page stays usable behind it.
 */
export function ArkaPanel({
  id,
  open,
  onClose,
  projects,
  entry,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  projects: readonly ProjectOption[];
  entry?: Entry;
}) {
  const titleId = useId();
  const pathname = usePathname();
  const pageSlug = slugFromPath(pathname);
  const pageProject = projects.find((p) => p.slug === pageSlug);

  const [conversationId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const inflight = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Closing stops a reply that is still coming; nobody is reading it.
  useEffect(() => {
    if (!open) inflight.current?.abort();
  }, [open]);

  useEffect(() => () => inflight.current?.abort(), []);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [messages, leadOpen]);

  const patch = useCallback((messageId: string, change: (m: Message) => Message) => {
    setMessages((all) => all.map((m) => (m.id === messageId ? change(m) : m)));
  }, []);

  async function ask(question: string) {
    const text = question.trim().slice(0, MAX_QUESTION);
    if (!text || busy) return;

    const history = [
      ...messages.filter((m) => m.content && !m.pending),
      { id: crypto.randomUUID(), role: "user" as const, content: text },
    ];
    const replyId = crypto.randomUUID();
    setMessages([...history, { id: replyId, role: "assistant", content: "", pending: true }]);
    setDraft("");
    setBusy(true);

    const controller = new AbortController();
    inflight.current = controller;

    let reply = "";
    const apply = (event: ArkaEvent) => {
      switch (event.t) {
        case "text":
          reply += event.v;
          patch(replyId, (m) => ({ ...m, content: reply }));
          break;
        case "replace":
          reply = event.v;
          patch(replyId, (m) => ({ ...m, content: reply }));
          break;
        case "handoff":
          patch(replyId, (m) => ({ ...m, handoff: true }));
          break;
        case "lead":
          setLeadOpen(true);
          break;
        case "error":
          if (!reply) {
            reply = event.code === "limited" ? LIMITED : UNAVAILABLE;
            patch(replyId, (m) => ({ ...m, content: reply, handoff: true }));
          }
          break;
        case "done":
          break;
      }
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conversationId,
          pagePath: pathname,
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });
      if (!response.body) throw new Error("no body");

      // Error responses are events too, so the body is read either way.
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        let newline: number;
        while ((newline = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (line) apply(JSON.parse(line) as ArkaEvent);
        }
      }
    } catch {
      if (!controller.signal.aborted && !reply) {
        reply = UNAVAILABLE;
        patch(replyId, (m) => ({ ...m, content: reply, handoff: true }));
      }
    } finally {
      patch(replyId, (m) => ({ ...m, pending: false }));
      setBusy(false);
      if (inflight.current === controller) inflight.current = null;
      // Announced once, whole, rather than word by word as it streams.
      if (reply) setAnnouncement(`Arka: ${reply}`);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(draft);
  }

  const asked = messages.some((m) => m.role === "user");
  const suggestions = pageProject ? projectSuggestions(pageProject.name) : SUGGESTIONS;

  return (
    <section
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      hidden={!open}
      className="fixed inset-x-2 bottom-2 z-50 flex max-h-[85svh] flex-col overflow-hidden rounded-2xl border border-line bg-paper text-ink shadow-[0_18px_60px_rgba(28,26,24,0.22)] motion-safe:animate-[arka-in_180ms_ease-out] sm:inset-x-auto sm:bottom-[6.5rem] sm:right-6 sm:w-[25rem] sm:max-h-[min(40rem,78svh)]"
    >
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <SunMark className="size-7 text-laterite" />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-display text-xl leading-none">
            Arka
          </h2>
          <p className="mt-1 text-xs text-muted">{site.name} assistant</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Arka"
          className="flex size-9 items-center justify-center rounded-full text-ink transition-colors duration-hover ease-hover hover:bg-paper-2"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div ref={log} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
        <Bubble role="assistant">{GREETING}</Bubble>

        {!asked && (
          <ul className="flex flex-wrap gap-2" aria-label="Suggested questions">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => void ask(s)}
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-soft transition-colors duration-hover ease-hover hover:border-ink hover:text-ink"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}

        {messages.map((m) => (
          <div key={m.id}>
            <Bubble role={m.role}>
              {m.content || (m.pending ? <Typing /> : null)}
            </Bubble>
            {m.handoff && !m.pending && <Handoff project={pageProject?.name} />}
          </div>
        ))}

        {leadOpen && (
          <LeadForm
            conversationId={conversationId}
            pagePath={pathname}
            entry={entry}
            projects={projects}
            defaultProject={pageProject?.slug ?? ""}
            transcript={messages
              .filter((m) => m.content && !m.pending)
              .map(({ role, content }) => ({ role, content }))}
          />
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-line px-3 pb-3 pt-3">
        <div className="flex items-center gap-2">
          <label htmlFor={`${titleId}-q`} className="sr-only">
            Ask Arka a question
          </label>
          <input
            ref={input}
            id={`${titleId}-q`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_QUESTION}
            autoComplete="off"
            placeholder="Ask about a project…"
            className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-[0.95rem] placeholder:text-muted focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition-colors duration-hover ease-hover hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-2 px-1 text-[0.72rem] leading-snug text-muted">
          Arka answers from the published project details and can make
          mistakes. Prices and availability come from the sales team.
        </p>
      </form>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}

function Bubble({
  role,
  children,
}: {
  role: Message["role"];
  children: React.ReactNode;
}) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[0.95rem] leading-relaxed ${
          mine ? "rounded-br-sm bg-ink text-paper" : "rounded-bl-sm bg-paper-2 text-ink"
        }`}
      >
        {mine ? <span className="sr-only">You: </span> : null}
        {children}
      </p>
    </div>
  );
}

function Typing() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Arka is typing">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          aria-hidden
          className="size-1.5 rounded-full bg-muted motion-safe:animate-pulse"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

/** The canonical contact routes, from site.ts. Arka never writes these. */
function Handoff({ project }: { project?: string }) {
  const message = project
    ? projectEnquiryMessage(project)
    : `Hello ${site.name} — I have a question about your projects.`;
  const chip =
    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors duration-hover ease-hover";
  return (
    <ul className="mt-2 flex flex-wrap gap-2" aria-label="Contact the sales team">
      <li>
        <a
          href={whatsappHref(message)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${chip} border-accent-ink text-accent-ink hover:bg-accent-ink hover:text-paper`}
        >
          <WhatsAppIcon className="size-4" />
          WhatsApp
        </a>
      </li>
      <li>
        <a href={telHref} className={`${chip} border-line text-ink hover:border-ink`}>
          <PhoneIcon className="size-4" />
          {site.contact.phoneDisplay}
        </a>
      </li>
      <li>
        <a href={mailtoHref} className={`${chip} border-line text-ink hover:border-ink`}>
          <MailIcon className="size-4" />
          Email
        </a>
      </li>
    </ul>
  );
}

function LeadForm({
  conversationId,
  pagePath,
  entry,
  projects,
  defaultProject,
  transcript,
}: {
  conversationId: string;
  pagePath: string;
  entry?: Entry;
  projects: readonly ProjectOption[];
  defaultProject: string;
  transcript: { role: Message["role"]; content: string }[];
}) {
  const formId = useId();
  const [status, setStatus] = useState<LeadStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  // One key per form: a double tap or a retry is the same enquiry.
  const [leadId] = useState(() => crypto.randomUUID());

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const data = new FormData(e.currentTarget);
    setStatus("sending");
    setErrors({});

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          leadId,
          conversationId,
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email") || undefined,
          project: data.get("project") || undefined,
          note: data.get("note") || undefined,
          consent: data.get("consent") === "on",
          website: data.get("website") || undefined,
          pagePath,
          source: entry
            ? { referrer: entry.referrer.slice(0, 500), landing: entry.landing.slice(0, 500) }
            : undefined,
          transcript: transcript.slice(-24).map((t) => ({
            role: t.role,
            content: t.content.slice(0, 2_000),
          })),
        }),
      });
      const body = (await response.json()) as {
        ok: boolean;
        fields?: Record<string, string>;
      };
      if (body.ok) {
        setName(String(data.get("name") ?? "").trim().split(/\s+/)[0] ?? "");
        setStatus("sent");
      } else if (response.status === 422 && body.fields) {
        setErrors(body.fields);
        setStatus("idle");
      } else {
        setStatus("failed");
      }
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-line bg-paper-2 p-4" role="status">
        <p className="font-display text-lg">Thank you{name ? `, ${name}` : ""}.</p>
        <p className="mt-1 text-sm text-ink-soft">
          The sales team has your details and will be in touch soon.
        </p>
      </div>
    );
  }

  const control =
    "mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-[0.95rem] focus:border-ink focus:outline-none aria-[invalid=true]:border-accent-ink";
  const idFor = (key: string) => `${formId}-${key}`;
  /*
    Explicit for/id pairs, with the error outside the label. Nested inside,
    an error became part of the field's name and was then read a second time
    through aria-describedby.
  */
  const a11y = (key: string) => ({
    id: idFor(key),
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${idFor(key)}-err` : undefined,
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-labelledby={`${formId}-title`}
      className="relative rounded-xl border border-line p-4"
    >
      <p id={`${formId}-title`} className="font-display text-lg leading-tight">
        Leave your details
      </p>
      <p className="mt-1 text-sm text-ink-soft">The sales team will call you back.</p>

      <div className="mt-3 space-y-3">
        <Field htmlFor={idFor("name")} label="Name" error={errors.name}>
          <input {...a11y("name")} name="name" required autoComplete="name" maxLength={80} className={control} />
        </Field>
        <Field htmlFor={idFor("phone")} label="Phone" error={errors.phone}>
          <input
            {...a11y("phone")}
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            maxLength={24}
            className={control}
          />
        </Field>
        <Field htmlFor={idFor("email")} label="Email" optional error={errors.email}>
          <input {...a11y("email")} name="email" type="email" autoComplete="email" maxLength={120} className={control} />
        </Field>
        <Field htmlFor={idFor("project")} label="Project">
          <select id={idFor("project")} name="project" defaultValue={defaultProject} className={control}>
            <option value="">Not sure yet</option>
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field htmlFor={idFor("note")} label="Anything we should know?" optional>
          <input id={idFor("note")} name="note" maxLength={500} className={control} />
        </Field>

        {/* A person never sees or reaches this; a form-filling bot fills it. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={idFor("website")}>Website</label>
          <input id={idFor("website")} name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <div className="flex items-start gap-2.5">
            <input
              {...a11y("consent")}
              name="consent"
              type="checkbox"
              required
              className="mt-1 size-4 shrink-0 accent-[var(--color-ink)]"
            />
            <label htmlFor={idFor("consent")} className="text-sm text-ink-soft">
              {site.name} may call or email me about this enquiry. My details are
              used for nothing else.
            </label>
          </div>
          {/*
            Outside the label: a link inside it would become part of the
            checkbox's name, and a tap on it would tick the box. The panel
            lives in the root layout, so the conversation survives the visit.
          */}
          <p className="ml-6.5 mt-1 text-sm">
            <Link href="/privacy" className="text-accent-ink underline underline-offset-4">
              Privacy policy
            </Link>
          </p>
          <FieldError id={`${idFor("consent")}-err`} message={errors.consent} />
        </div>
      </div>

      {status === "failed" && (
        <div role="alert" className="mt-3">
          <p className="text-sm text-accent-ink">
            That didn&rsquo;t go through. Please message the team instead:
          </p>
          <Handoff />
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 w-full rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition-colors duration-hover ease-hover hover:bg-ink-soft disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send my details"}
      </button>
    </form>
  );
}

function Field({
  htmlFor,
  label,
  optional,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm text-ink-soft">
        {label}
        {optional && <span className="text-muted"> (optional)</span>}
      </label>
      {children}
      <FieldError id={`${htmlFor}-err`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="mt-1 text-xs text-accent-ink">
      {message}
    </p>
  ) : null;
}
