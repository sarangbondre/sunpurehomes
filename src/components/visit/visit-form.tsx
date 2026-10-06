"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { MailIcon, WhatsAppIcon } from "@/components/brand/icons";
import { mailtoHref, whatsappHref } from "@/lib/links";
import {
  emailLooksReal,
  phoneLooksReal,
  visitMessage,
  type VisitProject,
} from "@/lib/visit";
import { site } from "@/lib/site";

type Errors = Partial<
  Record<"name" | "phone" | "email" | "project" | "consent", string>
>;

/**
 * The form behind "Arrange a site visit", asked for by the client on
 * 6 October: which development you want to see, who you are, and a way to
 * reach you — then your choice of WhatsApp or email to send it.
 *
 * NOTHING IS POSTED ANYWHERE. The two buttons open the visitor's own WhatsApp
 * or mail client with the message already written, and they press send. That
 * is the client's own instruction — "give an option to the user to send these
 * details on a WhatsApp or an email" — and it is also the design with the
 * least to go wrong: no inbox to configure, no key to rotate, no copy of
 * anyone's phone number on a server of ours, and nothing to break when
 * Webflow Cloud rebuilds. The enquiry lands in the same two places the team
 * already watches.
 *
 * Arka has a form that does post, to /api/lead and out through Resend. It is
 * switched off with the rest of Arka and needs a verified sender before it
 * can be switched on; when that happens this page can post as well and keep
 * both buttons as the fallback. Until then a server round trip would only add
 * a way to lose an enquiry silently.
 *
 * Validation runs here rather than in the browser's own bubble, so the
 * messages are ours and a reader hears them: aria-invalid on the field,
 * aria-describedby to the message, and focus moved to the first one that
 * failed. noValidate turns off the native bubbles that would otherwise fire
 * first and say something else.
 */
export function VisitForm({
  projects,
  defaultProject,
}: {
  projects: readonly VisitProject[];
  /** Pre-chosen when the visitor arrived from a project page. */
  defaultProject?: string;
}) {
  const formId = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<"whatsapp" | "email" | null>(null);

  const idFor = (key: string) => `${formId}-${key}`;
  const a11y = (key: keyof Errors) => ({
    id: idFor(key),
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${idFor(key)}-err` : undefined,
  });

  const control =
    "mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 text-[1rem] text-ink focus:border-ink focus:outline-none aria-[invalid=true]:border-accent-ink";

  function send(channel: "whatsapp" | "email", form: HTMLFormElement) {
    const data = new FormData(form);
    const read = (key: string) => String(data.get(key) ?? "");

    // A person never sees or reaches this; a form-filling bot fills it.
    if (read("website").trim()) return;

    const name = read("name");
    const phone = read("phone");
    const email = read("email");
    const slug = read("project");
    const note = read("note");

    const found: Errors = {};
    if (!name.trim()) found.name = "Please tell us your name.";
    if (!phone.trim()) found.phone = "Please leave a number we can call.";
    else if (!phoneLooksReal(phone))
      found.phone =
        "Enter a number we can call: a 10-digit mobile, a landline with its STD code, or an international number starting with +.";
    if (!email.trim()) found.email = "Please leave an email address.";
    else if (!emailLooksReal(email))
      found.email = "That address is missing an @ or a domain.";
    if (!slug) found.project = "Choose the development you would like to see.";
    if (!data.get("consent"))
      found.consent = "We need your agreement before we can get in touch.";

    setErrors(found);
    /*
      Document order, not the order they are validated in: focus has to land
      on the first thing that failed as the reader sees the form, which is the
      development select, not the name.
    */
    const first = (["project", "name", "phone", "email", "consent"] as const).find(
      (key) => found[key],
    );
    if (first) {
      form.querySelector<HTMLElement>(`#${CSS.escape(idFor(first))}`)?.focus();
      return;
    }

    const message = visitMessage({
      name,
      phone,
      email,
      project: projects.find((p) => p.slug === slug),
      note,
    });

    /*
      A new tab, not this one. On a desktop the mail client or web WhatsApp
      opens beside the site; on a phone the app takes over and the page is
      still there when they come back — which matters, because the message is
      not sent until they press send in that app and they may want to read it
      again first.
    */
    const href =
      channel === "whatsapp"
        ? whatsappHref(message)
        : `${mailtoHref}?subject=${encodeURIComponent(
            `Site visit request — ${
              projects.find((p) => p.slug === slug)?.name ?? site.name
            }`,
          )}&body=${encodeURIComponent(message)}`;

    window.open(href, "_blank", "noopener,noreferrer");
    setSent(channel);
  }

  return (
    <form
      noValidate
      onSubmit={(e) => e.preventDefault()}
      aria-labelledby={`${formId}-title`}
      className="relative max-w-[42rem]"
    >
      <h2 id={`${formId}-title`} className="sr-only">
        Your details
      </h2>

      <div className="space-y-6">
        <Field htmlFor={idFor("project")} label="Which development?" error={errors.project}>
          <select {...a11y("project")} name="project" defaultValue={defaultProject ?? ""} className={control}>
            <option value="">Choose a development</option>
            {projects.map((project) => (
              <option key={project.slug} value={project.slug}>
                {project.name} — {project.place}
              </option>
            ))}
          </select>
        </Field>

        <Field htmlFor={idFor("name")} label="Full name" error={errors.name}>
          <input {...a11y("name")} name="name" autoComplete="name" maxLength={80} className={control} />
        </Field>

        <Field htmlFor={idFor("phone")} label="Phone number" error={errors.phone}>
          <input
            {...a11y("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={24}
            className={control}
          />
        </Field>

        <Field htmlFor={idFor("email")} label="Email" error={errors.email}>
          <input {...a11y("email")} name="email" type="email" autoComplete="email" maxLength={120} className={control} />
        </Field>

        <Field htmlFor={idFor("note")} label="Anything we should know?" optional>
          <input id={idFor("note")} name="note" maxLength={500} className={control} />
        </Field>

        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={idFor("website")}>Website</label>
          <input id={idFor("website")} name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <div className="flex items-start gap-3">
            <input
              {...a11y("consent")}
              name="consent"
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-[var(--color-ink)]"
            />
            <label htmlFor={idFor("consent")} className="text-ink-soft">
              {site.name} may call or email me about this visit. My details are
              used for nothing else.
            </label>
          </div>
          {/*
            Outside the label: a link inside it would become part of the
            checkbox's name, and a tap on it would tick the box.
          */}
          <p className="ml-7 mt-2">
            <Link href="/privacy" className="text-accent-ink underline underline-offset-4">
              Privacy policy
            </Link>
          </p>
          <FieldError id={`${idFor("consent")}-err`} message={errors.consent} />
        </div>
      </div>

      {/*
        Two buttons, because the choice of channel IS the submit. Neither is
        the primary one: a family in Mysuru is as likely to want WhatsApp as
        email, and picking one for them would be guessing.
      */}
      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="submit"
          onClick={(e) => send("whatsapp", e.currentTarget.form!)}
          className="u-cta"
        >
          <WhatsAppIcon className="size-[1.1rem]" />
          Send on WhatsApp
        </button>
        <button
          type="submit"
          onClick={(e) => send("email", e.currentTarget.form!)}
          className="u-cta"
        >
          <MailIcon className="size-[1.1rem]" />
          Send by email
        </button>
      </div>

      {/*
        Said plainly, because the message is NOT sent yet — their app has it
        and they still have to press send there. A page that said "thank you,
        we'll be in touch" at this point would be lying to anyone who closed
        the tab.
      */}
      {sent && (
        <p role="status" className="mt-6 max-w-[46ch] leading-relaxed text-ink-soft">
          {sent === "whatsapp" ? "WhatsApp" : "Your email app"} should have
          opened with your details already written in. Press send there and the
          sales team will have them. If nothing opened, you can reach us on{" "}
          <a href={whatsappHref(`Hello ${site.name} — I'd like to arrange a site visit.`)} className="text-accent-ink underline underline-offset-4">
            WhatsApp
          </a>{" "}
          or at{" "}
          <a href={mailtoHref} className="text-accent-ink underline underline-offset-4">
            {site.contact.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}

function Field({
  htmlFor,
  label,
  optional = false,
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
      <label htmlFor={htmlFor} className="u-mono text-[0.8125rem] tracking-[0.16em] text-ink-soft">
        {label}
        {optional && <span className="ml-2 text-muted">Optional</span>}
      </label>
      {children}
      <FieldError id={`${htmlFor}-err`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-[0.9rem] leading-snug text-accent-ink">
      {message}
    </p>
  );
}
