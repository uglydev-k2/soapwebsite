import { MarketingPage } from "@/components/marketing/MarketingPage";

export const metadata = { title: "Privacy Policy — MsVee Soaps" };

export default function PrivacyPage() {
  return (
    <MarketingPage eyebrow="Legal" title="Privacy Policy">
      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p>
          MsVee Soaps respects your privacy. We collect only the information needed to
          process orders, improve your experience, and communicate about your purchases.
        </p>
        <p>
          We do not sell your personal data. Payment information is handled securely by
          our payment processor and is never stored on our servers.
        </p>
        <p>
          You may request deletion of your account data by contacting hello@msvee.co.
        </p>
      </div>
    </MarketingPage>
  );
}
