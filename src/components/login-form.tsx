"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

type Step = "email" | "code";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  function toastAuthError(error: { message: string; status?: number }) {
    const isRateLimited =
      error.message.toLowerCase().includes("rate limit") ||
      error.status === 429;

    toast.error(
      isRateLimited
        ? "Too many code requests. Wait a bit, then try again."
        : error.message
    );
  }

  async function sendCode(trimmedEmail: string) {
    const supabase = createClient();

    // Sends a 6-digit email OTP. The user enters the code manually —
    // we do not use magic-link redirects (avoids Gmail link-prefetch consuming the token).
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
    });

    if (error) {
      toastAuthError(error);
      return false;
    }

    toast.success("Check your email for a 6-digit code");
    return true;
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter your email");
      return;
    }

    setSending(true);
    const ok = await sendCode(trimmed);
    setSending(false);

    if (ok) {
      setEmail(trimmed);
      setCode("");
      setStep("code");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    const trimmedCode = code.trim();
    if (!/^\d{6}$/.test(trimmedCode)) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }

    setVerifying(true);
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: trimmedCode,
      type: "email",
    });

    setVerifying(false);

    if (error) {
      toast.error(
        error.message.toLowerCase().includes("token") ||
          error.message.toLowerCase().includes("otp")
          ? "Invalid or expired code. Try again or resend a new code."
          : error.message
      );
      return;
    }

    toast.success("Signed in");
    router.replace("/todos");
    router.refresh();
  }

  async function handleResend() {
    if (sending) return;

    setSending(true);
    await sendCode(email.trim());
    setSending(false);
  }

  if (step === "code") {
    return (
      <form onSubmit={handleVerify} className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          required
          disabled={verifying}
          autoFocus
        />
        <Button type="submit" disabled={verifying || sending} className="w-full">
          {verifying ? "Verifying…" : "Verify"}
        </Button>
        <div className="flex items-center justify-between gap-2 text-sm">
          <button
            type="button"
            className="text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
            onClick={() => {
              setStep("email");
              setCode("");
            }}
            disabled={verifying || sending}
          >
            Change email
          </button>
          <button
            type="button"
            className="text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
            onClick={handleResend}
            disabled={verifying || sending}
          >
            {sending ? "Sending…" : "Resend code"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="flex flex-col gap-3">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        disabled={sending}
      />
      <Button type="submit" disabled={sending} className="w-full">
        {sending ? "Sending…" : "Send Code"}
      </Button>
    </form>
  );
}
