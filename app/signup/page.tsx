import { Card, CardContent } from "@/components/ui/Card";
import { AuthBrandHeader, AuthFooterLink } from "@/components/auth/AuthBrandHeader";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = {
  title: "Create Account — MsVee Soaps",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <AuthBrandHeader subtitle="Join the ritual" />
        <CardContent>
          <SignupForm />
          <div className="pt-6">
            <AuthFooterLink
              text="Already have an account?"
              linkText="Sign in"
              href="/login"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
