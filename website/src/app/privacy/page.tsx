import { LegalLayout } from "@/features/legal/LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Last updated: August 19, 2026"
    >
      <p>
        LiveMentorHub (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by LiveMentorHub.
      </p>
      <h3 className="text-lg font-bold text-white mt-6 mb-2">1. Information We Collect</h3>
      <p>
        We collect student profile information, mobile numbers, institute batch affiliations, attendance logs, and test performance data required to deliver educational services.
      </p>
      <h3 className="text-lg font-bold text-white mt-6 mb-2">2. How We Use Information</h3>
      <p>
        We use collected data solely to deliver HD live classes, record lectures, generate performance analytics for parents and mentors, and maintain secure portal access.
      </p>
    </LegalLayout>
  );
}
