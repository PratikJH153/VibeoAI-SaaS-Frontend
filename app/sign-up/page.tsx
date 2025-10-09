"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your free trial. No credit card required."
    >
      <div className="space-y-4">
        <div>
          <SignUp
            routing="hash"
            signInUrl="/sign-in"
            forceRedirectUrl="/projects"
          />
        </div>
      </div>
    </AuthLayout>
  );
}
