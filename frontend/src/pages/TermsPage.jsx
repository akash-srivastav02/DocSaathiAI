import LegalPageLayout from "../components/LegalPageLayout";

const SECTIONS = [
  {
    heading: "Acceptance of these terms",
    paragraphs: [
      "By using FormFixer, you agree to these Terms and Conditions. If you do not agree, you should not use the service.",
      "FormFixer is a direct-access digital platform focused on exam-related preparation pages, printable passport photo sheet output, and related guidance content.",
    ],
  },
  {
    heading: "What FormFixer provides",
    points: [
      "Exam requirement pages, upload guidance, and form-related content.",
      "Printable passport photo sheet workflow.",
      "Direct-access utility experiences and blog content as available on the platform.",
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
    heading: "Payments and refunds",
    paragraphs: [
      "If paid features, ads, or transaction workflows are introduced later, they may use third-party payment or ad partners.",
      "Refund, billing, or partner-specific terms may be updated later if monetized features go live.",
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
