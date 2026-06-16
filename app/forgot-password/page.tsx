import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password — mvlusciouslather",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <AuthBrandHeader subtitle="Reset your password" />
        <CardContent>
          <ForgotPasswordForm />
          <p className="text-center text-sm text-muted pt-6">
            <Link
              href="/login"
              className="text-terra hover:text-terra-2 transition-colors"
            >
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
