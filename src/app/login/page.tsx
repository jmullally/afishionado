import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in · afishionado",
  alternates: { canonical: "/login" },
};

// LoginForm reads ?mode=signup on the client, which needs a Suspense boundary.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
