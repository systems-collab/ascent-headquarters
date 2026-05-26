/**
 * Maps known error codes from the OAuth callback route to user-facing
 * messages. The callback in src/app/auth/callback/route.ts redirects to
 * /login?error=<code> when the code exchange fails; this turns those codes
 * into something a human can act on.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_callback:
    "We couldn't finish signing you in. The sign-in link may have expired. Please try again.",
  missing_code:
    "Your sign-in link looked incomplete. Please request a new one and try again.",
  access_denied:
    "Sign-in was cancelled. You can try again whenever you're ready.",
};

export function getAuthErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? "Something went wrong signing you in. Please try again.";
}
