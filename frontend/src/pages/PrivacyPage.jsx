import LegalPageLayout from "../components/LegalPageLayout";

const SECTIONS = [
  {
    heading: "What we collect",
    paragraphs: [
      "FormFixer collects the basic account information needed to run the service, such as your name, email address, login method, and credit balance.",
      "When you use a tool, we may also process uploaded photos, signatures, PDFs, and related file metadata such as file type, file size, selected exam preset, and processing timestamps.",
    ],
  },
  {
    heading: "How uploads are used",
    paragraphs: [
      "Uploaded files are used only to process the tool action you request, such as exam photo resize, PDF compression, merger output, or image-to-PDF conversion.",
      "Processed files may be temporarily stored through our infrastructure and delivery partners so that previews and final downloads can work correctly.",
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
      "Google sign-in may be used for account access.",
      "Razorpay handles payment authorization and confirmation.",
      "Hosting and file-delivery providers may process technical request data required to serve the platform.",
    ],
  },
  {
    heading: "How we use your data",
    points: [
      "To create and manage your account.",
      "To process files and generate the requested output.",
      "To maintain credits, plans, download permissions, and usage history.",
      "To detect abuse, fraud, excessive automation, or misuse of the service.",
      "To answer support requests and improve reliability of the platform.",
    ],
  },
  {
    heading: "Data retention",
    paragraphs: [
      "We keep account-level information for as long as it is needed to operate your account, maintain purchases and credits, and support legitimate security or support needs.",
      "Uploaded and processed files should be treated as temporary workflow assets, not long-term document storage.",
    ],
  },
  {
    heading: "Your choices",
    points: [
      "You may contact us if you want help with account-related questions.",
      "You can choose not to use Google sign-in and use regular email/password login if available.",
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
