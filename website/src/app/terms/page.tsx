import { LegalLayout } from "@/features/legal/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Last updated: August 19, 2026"
    >
      <p>
        By accessing or using the LiveMentorHub platform, website, or mobile ecosystem, you agree to be bound by these Terms of Service.
      </p>
      <h3 className="text-lg font-bold text-white mt-6 mb-2">1. Use of Services</h3>
      <p>
        LiveMentorHub grants students, parents, teachers, and coaching institutes access to live mentorship, recorded video streams, and educational management tools subject to platform guidelines.
      </p>
      <h3 className="text-lg font-bold text-white mt-6 mb-2">2. Portal Access &amp; Subscriptions</h3>
      <p>
        Registered students, parents, teachers, and coaching institutes receive portal access to their respective LiveMentorHub modules.
      </p>
    </LegalLayout>
  );
}
