import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/legal/legal-page";
import { mailtoHref } from "@/lib/links";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} handles the information you share on this website.`,
};

/**
 * The privacy policy, copied on 2 October 2026 from the client's live site at
 * sunpurehomes.com/privacy-policy at their instruction. The words are theirs
 * and are reproduced as published; only the typography is ours.
 *
 * It replaces the interim policy written on 16 September from what this site
 * actually does, which was always meant to go the moment the client supplied
 * their approved text. Two things were lost with it, and want checking before
 * this page is relied on:
 *
 * - It described Arka and the AI service that writes its replies. Arka is off
 *   (ARKA_ENABLED, see docs/adr/0002-arka.md), so nothing on the site sends
 *   anything to a model today — but if it is ever switched on, this policy
 *   does not cover it and must say so before it goes live.
 * - It said this site sets no cookies of its own, which is true. The policy
 *   below says the site may use them. That is the client's wording for their
 *   own estate; it is not a description of this build.
 *
 * The policy carries no date of its own, so none is shown — inventing one
 * would be worse than the absence, and the text itself promises that the date
 * of any update will appear here.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy policy"
      lead={
        <p>
          When you voluntarily send us electronic mail / fillup the form, we
          will keep a record of this information so that we can respond to you.
          We only collect information from you when you register on our site or
          fill out a form. Also, when filling out a form on our site, you may be
          asked to enter your: name, e-mail address or phone number. You may,
          however, visit our site anonymously. In case you have submitted your
          personal information and contact details, we reserve the rights to
          Call, SMS, Email or WhatsApp about our products and offers, even if
          your number has DND activated on it.
        </p>
      }
    >
      <Section title="Online applicant information">
        <p>
          The information which is provided by the Applicant herein may be used
          by the Company and its affiliates:-
        </p>
        <ul>
          <li>
            to send important notices/ communications regarding the status of
            their Expression of Interest Form etc. and the relevant policies,
            terms, conditions, etc.;
          </li>
          <li>
            to keep the Applicant posted on their project launches,
            announcements, project updates and upcoming events and to improve
            their services, content, advertising. If the Applicant does not want
            to be on their mailing list, the Applicant you can opt out anytime
            by updating his/her preference by sending an &lsquo;do not send
            promotional announcements&rsquo; email to help@sunpurehomes.com for
            internal purposes such as auditing, data analysis, and research to
            improve its products, services and customer communications.
          </li>
        </ul>
        <p>
          The Company shall take reasonable security practices to protect the
          privacy of the information provided by the Applicant. Except as
          mentioned herein, the Company shall not disclose such information to
          any third party. However nothing contained herein above shall apply to
          any disclosure of confidential Information if:- such disclosure is
          required by law or requested by any statutory or regulatory or
          judicial/quasi-judicial authority or recognized self-regulating
          organization or other recognized investment exchange having
          jurisdiction over the Parties; or such disclosure is required in
          connection with any litigation; or such information has otherwise
          entered the public domain.
        </p>
      </Section>

      <Section title="Personal identification information">
        <p>
          We may collect personal identification information from Users in a
          variety of ways, including, but not limited to, when Users visit our
          site, subscribe to the newsletter, fill out a form, and in connection
          with other activities, services, features or resources we make
          available on our Site. Users may be asked for, as appropriate, name,
          email address, mailing address, phone number. Users may, however,
          visit our Site anonymously. Users can always refuse to supply personal
          identification information, except that it may prevent them from
          engaging in certain Site related activities.
        </p>
      </Section>

      <Section title="Non-personal identification information">
        <p>
          We may collect non-personal identification information about Users
          whenever they interact with our Site. Non-personal identification
          information may include the browser name, the type of computer and
          technical information about Users means the type of connection to our
          Site, such as the operating system and the Internet service providers
          utilized and other similar information.
        </p>
      </Section>

      <Section title="Web browser cookies">
        <p>
          Our Site may use &ldquo;cookies&rdquo; to enhance User experience.
          User&rsquo;s web browser places cookies on their hard drive for
          record-keeping purposes and sometimes to track information about them.
          User may choose to set their web browser to refuse cookies, or to
          alert the Users when cookies are being sent. If they do so, note that
          some parts of the Site may not function properly.
        </p>
      </Section>

      <Section title="How we use collected information">
        <p>
          {site.name} may collect and use User&rsquo;s personal information for
          the following purposes:
        </p>
        <ul>
          <li>
            <strong>To improve customer service:</strong> Information provided
            by Users helps us respond to the customer service requests and
            support needs, more efficiently.
          </li>
          <li>
            <strong>To personalize User experience:</strong> We may use
            information in the aggregate to understand how our Users as a group
            use the services and resources provided on our Site.
          </li>
          <li>
            <strong>To improve our Site:</strong> We may use feedback provided
            by the User/s to improve our products and services.
          </li>
          <li>To run a promotion, contest, survey or other Site feature.</li>
          <li>
            To send the User/s information they agreed to receive about topics
            of interest to them.
          </li>
          <li>To send periodic emails</li>
        </ul>
        <p>
          We may use the email address to respond to the inquiries, questions,
          and/or other requests of User/s. If User/s decide/s to opt to be part
          of our mailing list, then the User/s will receive emails about company
          news, updates, related product or service information, etc. If at any
          time the User/s would like to unsubscribe from receiving future
          emails, they may do so by contacting us via our Site.
        </p>
      </Section>

      <Section title="How we protect User’s information">
        <p>
          We adopt appropriate data collection, storage and processing practices
          and security measures to protect against unauthorized access,
          alteration, disclosure or destruction of User&rsquo;s personal
          information and data stored on our Site. Sensitive and private data
          exchange between the Site and its Users happens over a SSL secured
          communication channel and is encrypted and protected with digital
          signatures.
        </p>
      </Section>

      <Section title="Sharing personal information of User/s">
        <p>
          We do not sell, trade, or rent User&rsquo;s personal identification
          information to others. We may share generic aggregated demographic
          information not linked to any personal identification information
          regarding User/s without subsidiaries, our business partners, trusted
          affiliates and advertisers for the purposes outlined above.
        </p>
      </Section>

      <Section title="Changes to this privacy policy">
        <p>
          {site.name} shall update this privacy policy at its sole discretion,
          the date of updation would reflect on this page. Users are advised to
          check this page for any changes in the privacy policy and to stay
          informed about how the personal information of the Users is protected
          by us. The User/s hereby acknowledge/s and agree/s that it is their
          responsibility to review this privacy policy periodically and become
          aware of modifications.
        </p>
      </Section>

      <Section title="Your acceptance of these terms">
        <p>
          By using this Site, the Users signify their acceptance of this policy
          as may be modified from time to time. The Users are advised not to
          access this site if they do not agree to our privacy policy. The above
          mentioned privacy policy shall be applicable for the information and
          data collected by our call centers as well.
        </p>
      </Section>

      <Section title="Contacting us">
        <p>
          If you have any questions about this Privacy Policy, the practices of
          this site, or your dealings with this site, please contact us at{" "}
          <a href={mailtoHref}>{site.contact.email}</a>
        </p>
        <p>Thank You</p>
      </Section>
    </LegalPage>
  );
}
