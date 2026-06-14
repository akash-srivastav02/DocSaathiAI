import LegalPageLayout from "../components/LegalPageLayout";

const SECTIONS = [
  {
    heading: "What we collect",
    paragraphs: [
      "FormFixer is currently a direct-access website, so basic reading and navigation do not require account signup or login.",
      "When you use a tool or open an exam workflow, we may process uploaded photos and related file metadata such as file type, file size, selected exam page, and processing timestamps.",
    ],
  },
  {
    heading: "How uploads are used",
    paragraphs: [
      "Uploaded files are used only to process the workflow you request, such as exam-related photo preparation or printable passport photo sheet output.",
      "Processed files may be temporarily stored through infrastructure and delivery partners only where required for previews or final downloads.",
    ],
    points: [
      "We do not use your uploaded files to train public AI models.",
      "You should avoid uploading highly sensitive documents unless necessary for your own exam or student workflow.",
      "Final responsibility for checking correctness before submission remains with the user.",
    ],
  },
  {
    heading: "Payments and third-party services",
    paragraphs: [
      "Payments are processed by Razorpay. FormFixer does not store your full card details, UPI PIN, or other sensitive payment credentials.",
      "We may also rely on third-party providers for file delivery, authentication, hosting, analytics, and infrastructure security.",
    ],
    points: [
      "If payments or ads are introduced later, third-party providers may handle those layers.",
      "Hosting and file-delivery providers may process technical request data required to serve the platform.",
    ],
  },
  {
    heading: "How we use your data",
    points: [
      "To process files and generate the requested output.",
      "To detect abuse, fraud, excessive automation, or misuse of the service.",
      "To answer support requests and improve reliability of the platform.",
    ],
  },
  {
    heading: "Data retention",
    paragraphs: [
      "Uploaded and processed files should be treated as temporary workflow assets, not long-term document storage.",
      "Analytics, ad, or technical logs may be retained for security, debugging, and operational reporting where needed.",
    ],
  },
  {
    heading: "Your choices",
    points: [
      "You may contact us if you want help with account-related questions.",
      "You may avoid storing unnecessary personal documents on the platform and should download and keep your final files on your own device.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "For privacy questions, account issues, or support concerns, contact us at supportformfixer@gmail.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      summary="This page explains what FormFixer collects, how uploads are processed, how payments are handled, and what users should expect when using the platform."
      updated="May 1, 2026"
      sections={SECTIONS}
    />
  );
}
