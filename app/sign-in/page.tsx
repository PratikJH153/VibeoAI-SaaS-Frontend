"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <AuthLayout
      title="Log in to your Account"
      subtitle="Welcome back! Select method to log in:"
    >
      <div className="space-y-4">
        <div className="bg-transparent">
          {/* Clerk SignIn handles the actual form fields and flows. */}
          <SignIn
            routing="hash"
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/projects"
          />
        </div>
      </div>
    </AuthLayout>
  );
}
