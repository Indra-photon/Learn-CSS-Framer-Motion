import type { Metadata } from "next";

import { FormwiseSignIn } from "@/components/SignIn/FormwiseSignIn";

export const metadata: Metadata = {
  title: "Sign in · Formwise",
  description: "Sign in to your Formwise workspace.",
};

export default function FormwiseSignInPage() {
  return <FormwiseSignIn />;
}
