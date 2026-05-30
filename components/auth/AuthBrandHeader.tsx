import Link from "next/link";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export function AuthBrandHeader({
  subtitle,
}: {
  subtitle: string;
}) {
  return (
    <CardHeader>
      <CardTitle>
        <span className="italic text-terra">Ms</span>
        <span>Vee</span>
        <span className="text-2xl"> Soaps</span>
      </CardTitle>
      <CardDescription>{subtitle}</CardDescription>
    </CardHeader>
  );
}

export function AuthFooterLink({
  text,
  linkText,
  href,
}: {
  text: string;
  linkText: string;
  href: string;
}) {
  return (
    <p className="text-center text-sm text-muted">
      {text}{" "}
      <Link href={href} className="text-terra hover:text-terra-2 transition-colors">
        {linkText}
      </Link>
    </p>
  );
}
