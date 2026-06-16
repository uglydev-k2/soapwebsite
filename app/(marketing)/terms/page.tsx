import { MarketingPage } from "@/components/marketing/MarketingPage";

export const metadata = { title: "Terms of Service — mvlusciouslather" };

export default function TermsPage() {
  return (
    <MarketingPage eyebrow="Legal" title="Terms of Service">
      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p>
          By using mvlusciouslather.com you agree to these terms. Products are sold as described;
          colors and scents may vary slightly due to natural ingredients and small-batch
          production.
        </p>
        <p>
          We reserve the right to limit quantities, refuse orders, or update pricing with
          notice on the site. All content on this site is owned by mvlusciouslather.
        </p>
        <p>
          Questions? Email hello@mvlusciouslather.com.
        </p>
      </div>
    </MarketingPage>
  );
}
