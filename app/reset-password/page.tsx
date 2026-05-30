import { Card, CardContent } from "@/components/ui/Card";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset Password — MsVee Soaps",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <AuthBrandHeader subtitle="Choose a new password" />
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
