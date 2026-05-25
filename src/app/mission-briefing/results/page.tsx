"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { hasQuestionnaireData } from "@/lib/questionnaire-storage";

export default function ResultsTeaserPage() {
  const [hasData, setHasData] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!hasQuestionnaireData()) {
      router.push("/mission-briefing");
      return;
    }
    setHasData(true);
  }, [router]);

  if (!hasData) return null;

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          {/* Blurred placeholder radar */}
          <div className="mx-auto mb-8 h-48 w-48 rounded-full bg-gradient-to-br from-fishburners-100 to-fishburners-200 blur-sm" />
          <h1 className="text-3xl font-bold text-gray-900">
            Your Fundraising Readiness Score is ready.
          </h1>
          <p className="mt-4 text-gray-600">
            Sign up to unlock your full diagnostic and access your Command
            Center.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              href="/signup"
              className="block w-full rounded-md bg-fishburners-500 px-4 py-3 text-center font-medium text-white hover:bg-fishburners-600"
            >
              Continue with Google
            </Link>
            <Link
              href="/signup"
              className="block w-full rounded-md border border-gray-300 px-4 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign up with email
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-fishburners-600 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
