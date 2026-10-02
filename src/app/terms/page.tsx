import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section } from "@/components/legal/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: `The terms on which ${site.name} makes this website available.`,
};

/**
 * The terms, copied on 2 October 2026 from the client's live site at
 * sunpurehomes.com/terms at their instruction. The words are theirs and are
 * reproduced as published; only the typography is ours.
 *
 * Their footer calls this "Terms & Conditions" and their page calls it
 * "Terms", while the text throughout says "Terms of Use". The heading follows
 * the footer, because that is the name a visitor arrives with, and the body
 * keeps their wording.
 *
 * The page carries no date of its own, so none is shown; inventing one would
 * be worse than the absence.
 */
export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms &amp; conditions">
      <Section title="Acceptance of Terms">
        <p>
          By using our website, you acknowledge that you have read, understood,
          and agree to be bound by these Terms of Use. If you do not agree with
          any part of these terms, please refrain from using our website and
          services.
        </p>
      </Section>

      <Section title="Use of the Website">
        <p>
          You may use our website for lawful purposes and in compliance with
          these Terms of Use. You agree not to engage in any activity that
          disrupts, damages, or interferes with the proper functioning of the
          website.
        </p>
      </Section>

      <Section title="Intellectual Property">
        <p>
          All content, trademarks, logos, images, designs, text, and other
          intellectual property displayed on our website are the property of{" "}
          {site.name} or its licensors. You may not use, reproduce, copy,
          modify, or distribute any content from our website without our prior
          written consent.
        </p>
      </Section>

      <Section title="User Responsibilities">
        <p>
          You are responsible for ensuring that any information you provide
          through our website is accurate and complete. If you create or use an
          account on our website, you are responsible for maintaining the
          confidentiality of your account information and for all activities
          that occur under your account.
        </p>
        <p>
          You agree to notify us immediately of any unauthorized use of your
          account or any other breach of security.
        </p>
      </Section>

      <Section title="Privacy Policy">
        <p>
          Your use of our website is also governed by our{" "}
          <Link href="/privacy">Privacy Policy</Link>. Please review the policy
          to understand how we collect, use, store, and protect your
          information.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          {site.name} and its affiliates shall not be liable for any direct,
          indirect, incidental, consequential, special, or punitive damages
          arising out of your use of our website, services, or reliance on any
          information provided on the website.
        </p>
      </Section>

      <Section title="Termination of Access">
        <p>
          We reserve the right to terminate or suspend your access to our
          website at any time, without notice, for any reason, including
          violation of these Terms of Use.
        </p>
      </Section>

      <Section title="Links to Third-Party Websites">
        <p>
          Our website may contain links to third-party websites for your
          convenience. {site.name} does not endorse, control, or take
          responsibility for the content, policies, or practices of any
          third-party websites.
        </p>
      </Section>

      <Section title="Changes to Terms">
        <p>
          {site.name} reserves the right to update, modify, or revise these
          Terms of Use at any time. Your continued use of the website after any
          changes signifies your acceptance of the revised terms.
        </p>
      </Section>

      <Section title="Governing Law">
        <p>
          These Terms of Use are governed by and construed in accordance with
          the laws of the jurisdiction in which {site.name} operates.
        </p>
      </Section>

      <Section title="Contact Information">
        <p>
          If you have any questions or concerns about these Terms of Use, please
          contact us at:
        </p>
        <p>help@sunpurehomes.com</p>
        <p>
          These Terms of Use form the agreement between you and {site.name}{" "}
          regarding the use of our website. We appreciate your commitment to
          abiding by these terms as we continue to build trust, quality, and
          lasting relationships with our customers and partners.
        </p>
      </Section>
    </LegalPage>
  );
}
