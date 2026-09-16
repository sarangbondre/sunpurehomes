import type { Metadata } from "next";
import Link from "next/link";
import { arkaConfig } from "@/lib/chatbot/env";
import { mailtoHref, telHref } from "@/lib/links";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} handles the information you share on this website.`,
};

/**
 * The privacy policy.
 *
 * INTERIM TEXT, written on 16 September 2026 from what this site actually
 * does, until the client supplies their approved policy — replace the body
 * below when it arrives. Until then it must stay true, so:
 *
 * - Anything added to the site that collects or shares data — analytics, a
 *   new form, a new provider — has to be reflected here in the same change.
 * - The model providers are read from Arka's configuration at build time,
 *   so switching ARKA_PROVIDER or ARKA_MODEL changes this page too.
 * - Nothing here names a legal entity, a grievance officer or a retention
 *   period, because none has been confirmed. They are in openQuestions in
 *   lib/site.ts. BRIEF §2 forbids placeholder text on a page, so the page
 *   says only what is true without them.
 */

const UPDATED = "16 September 2026";

/** "meta-llama/Llama-3.3-70B-Instruct:novita" → "Novita". */
const HOST_NAMES: Record<string, string> = {
  novita: "Novita",
  ovhcloud: "OVHcloud",
  together: "Together AI",
  deepinfra: "DeepInfra",
  scaleway: "Scaleway",
  nscale: "Nscale",
  groq: "Groq",
  cerebras: "Cerebras",
  fireworks: "Fireworks AI",
  "featherless-ai": "Featherless AI",
};

function hostOf(model: string | undefined): string | undefined {
  const suffix = model?.split(":")[1];
  return suffix ? (HOST_NAMES[suffix] ?? suffix) : undefined;
}

/** Who generates Arka's replies, in words, from the live configuration. */
function modelProviders(): string {
  const config = arkaConfig();
  if (config.provider === "anthropic") return "Anthropic, which generates the replies";
  if (config.provider === "huggingface") {
    const main = hostOf(config.model);
    const backup = hostOf(config.fallbackModel);
    const hosts = main
      ? backup
        ? `${main}, or ${backup} when ${main} is busy`
        : main
      : "the company hosting the model";
    return `Hugging Face, which passes them to the company that runs the language model — currently ${hosts}`;
  }
  const host = config.ossBaseUrl ? new URL(config.ossBaseUrl).hostname : "the model host";
  return `the service at ${host}, which generates the replies`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] leading-tight">{title}</h2>
      <div className="mt-5 space-y-4 leading-relaxed text-ink-soft [&_a]:text-accent-ink [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[86rem] px-6 pb-16 sm:px-10 lg:px-16">
      <div className="max-w-[46rem]">
        <header className="pb-10 pt-16 sm:pt-24">
          <p className="u-mono text-accent-ink">Privacy</p>
          <h1 className="mt-6 text-[clamp(2.5rem,6vw,4rem)]">Privacy policy</h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            What this website collects, why, who it is shared with, and what
            you can ask us to do about it. It covers {site.name}&rsquo;s website
            only.
          </p>
          <p className="u-mono mt-6 text-muted">Last updated {UPDATED}</p>
        </header>

        <Section title="In short">
          <ul>
            <li>This website uses no analytics and sets no cookies of its own.</li>
            <li>
              If you send us an enquiry, your details go to our sales team so
              they can contact you — only after you tick the consent box.
            </li>
            <li>
              If you chat with Arka, our website assistant, your questions are
              sent to an AI service to write the replies. Phone numbers, email
              addresses and links are removed first.
            </li>
            <li>We do not sell your information.</li>
          </ul>
        </Section>

        <Section title="What we collect">
          <p>
            <strong>When you browse.</strong> Our hosting provider records
            standard technical details — your IP address, browser type and the
            pages requested — to deliver the site and keep it secure.
          </p>
          <p>
            <strong>When you chat with Arka.</strong> The questions you type and
            Arka&rsquo;s replies. Arka answers from the project details
            published on this site. The website does not keep a copy of the
            conversation; our logs record only that a question was asked, not
            what it said.
          </p>
          <p>
            <strong>When you send an enquiry.</strong> Your name, phone number
            and, if you give them, your email address, the project you are
            interested in and a note. With it we record the conversation you had
            with Arka, the page you were on, the website or campaign link that
            brought you here, your browser type and the time.
          </p>
          <p>
            <strong>When you contact us directly</strong> by WhatsApp, phone or
            email, whatever you choose to share, under the terms of the service
            you use.
          </p>
          <p>
            <strong>On your own device.</strong> If you shortlist homes on a
            project plan, the shortlist is saved in your browser until you
            clear it. So that an enquiry can say where you first arrived from,
            that page and referring site are saved for the current browser tab
            and cleared when the tab closes. Neither is sent to us unless you
            send an enquiry.
          </p>
        </Section>

        <Section title="Why we use it">
          <ul>
            <li>To answer your questions about our projects.</li>
            <li>To reply to your enquiry and arrange a call or a site visit.</li>
            <li>To understand which websites and campaigns bring us enquiries.</li>
            <li>To keep the website running and secure.</li>
          </ul>
          <p>
            We do not use your information to make automated decisions about
            you, and we do not sell it.
          </p>
        </Section>

        <Section title="Your consent">
          <p>
            The enquiry form sends nothing until you tick the box agreeing that
            we may call or email you about it. You can withdraw that consent at
            any time by writing to{" "}
            <a href={mailtoHref}>{site.contact.email}</a>, and we will stop
            contacting you about it.
          </p>
        </Section>

        <Section title="Who we share it with">
          <p>
            Only with the services that run this website for us, each for the
            purpose described:
          </p>
          <ul>
            <li>
              <strong>Vercel</strong> hosts the website.
            </li>
            <li>
              <strong>Arka&rsquo;s replies:</strong> your questions, with
              contact details removed, go to {modelProviders()}.
            </li>
            <li>
              <strong>Resend</strong> delivers enquiry emails to our sales team.
            </li>
            <li>
              <strong>Virtual tour providers</strong> such as Matterport — only
              if you choose to open a tour. The tour then loads from that
              provider, and its own privacy policy and cookies apply.
            </li>
            <li>
              <strong>WhatsApp</strong> — only if you choose to message us
              there.
            </li>
          </ul>
          <p>
            Some of these services process information outside India. We also
            share information where the law requires us to.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            We keep enquiry details for as long as we need them to respond to
            you and follow up on your interest, or for as long as the law
            requires. Our hosting provider keeps its technical records for a
            limited period under its own policy.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can ask us to show you the information we hold about you, to
            correct or update it, or to erase it, and you can withdraw your
            consent. Write to <a href={mailtoHref}>{site.contact.email}</a> or
            call <a href={telHref}>{site.contact.phoneDisplay}</a>.
          </p>
          <p>
            If you are not satisfied with our response, you may complain to the
            Data Protection Board of India.
          </p>
        </Section>

        <Section title="Children">
          <p>
            This website is meant for adults buying or enquiring about homes.
            We do not knowingly collect information from anyone under 18.
          </p>
        </Section>

        <Section title="Security">
          <p>
            The website is served over an encrypted connection, and access to
            enquiry details is limited to our sales team and the services
            listed above. No system is perfectly secure, but we take reasonable
            steps to protect what you share.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If this policy changes we will update this page and the date at the
            top. See also the <Link href="/about#contact">ways to reach us</Link>.
          </p>
        </Section>
      </div>
    </main>
  );
}
