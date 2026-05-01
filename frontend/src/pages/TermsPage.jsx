import LegalPageLayout from "../components/LegalPageLayout";

const SECTIONS = [
  {
    heading: "Acceptance of these terms",
    paragraphs: [
      "By creating an account or using FormFixer, you agree to these Terms and Conditions. If you do not agree, you should not use the service.",
      "FormFixer is a digital utility platform that helps users prepare exam-related photos, signatures, PDFs, and similar upload-ready files.",
    ],
  },
  {
    heading: "What FormFixer provides",
    points: [
      "Exam photo resize and compression presets.",
      "Signature formatting and KB targeting.",
      "Photo + sign/date merger tools.",
      "PDF compression and related document utilities.",
      "Converter and upload-preparation workflows as available on the platform.",
    ],
  },
  {
    heading: "User responsibility",
    paragraphs: [
      "FormFixer helps prepare files, but it does not guarantee that every exam body, university, or website will accept a file in every case. Final review before submission remains your responsibility.",
    ],
    points: [
      "Use clear and lawful documents that belong to you or that you are authorized to process.",
      "Check exam-specific instructions before final submission.",
      "Do not upload illegal, harmful, fraudulent, or abusive material.",
    ],
  },
  {
    heading: "Credits, plans, and fair use",
    paragraphs: [
      "Some tools require credits, and paid plans may provide either a fixed number of credits or an unlimited plan subject to fair-usage limits.",
    ],
    points: [
      "Free credits, refill rules, and paid plan details may change over time.",
      "Single Fix is intended for one urgent clean download.",
      "Unlimited plans may be limited by daily fair-use safeguards to prevent abuse.",
      "Abusive automated usage, reselling without permission, or attempts to bypass plan limits may lead to suspension.",
    ],
  },
  {
    heading: "Payments and refunds",
    paragraphs: [
      "Payments are processed by Razorpay or another payment partner integrated into the service. Payment success depends on the gateway, bank, or UPI provider as well as FormFixer verification.",
      "Because FormFixer provides digital services, refund requests are handled case-by-case, especially where there is a clear technical failure or duplicate payment issue.",
    ],
  },
  {
    heading: "Availability and changes",
    paragraphs: [
      "We may update, improve, suspend, or remove features at any time to improve reliability, security, pricing, or product direction.",
      "We are not responsible for exam deadlines missed because of network issues, late uploads, user error, or third-party service outages.",
    ],
  },
  {
    heading: "Intellectual property and misuse",
    points: [
      "The FormFixer brand, interface, and service logic remain the property of the platform owner.",
      "You may not reverse engineer, misuse, scrape at abusive scale, or interfere with the service.",
      "You may not use the platform to impersonate others, falsify records, or create deceptive documents.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "For support, payment issues, or policy questions, contact supportformfixer@gmail.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      summary="These terms explain how FormFixer can be used, how credits and plans work, and what responsibilities remain with the user before any final submission."
      updated="May 1, 2026"
      sections={SECTIONS}
    />
  );
}
