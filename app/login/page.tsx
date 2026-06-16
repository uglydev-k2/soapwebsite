import { Card, CardContent } from "@/components/ui/Card";
import { AuthBrandHeader, AuthFooterLink } from "@/components/auth/AuthBrandHeader";
import { LoginForm } from "@/components/auth/LoginForm";
import { isGoogleOAuthConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Sign In — mvlusciouslather",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <AuthBrandHeader subtitle="Welcome back" />
        <CardContent>
          <LoginForm showGoogle={isGoogleOAuthConfigured()} />
          <div className="pt-6">
            <AuthFooterLink
              text="Don't have an account?"
              linkText="Sign up"
              href="/signup"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
