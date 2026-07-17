"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        // After clicking the magic link, Supabase redirects here to exchange the code
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      const isRateLimited =
        error.message.toLowerCase().includes("rate limit") ||
        error.status === 429;

      toast.error(
        isRateLimited
          ? "Too many magic link requests. Wait about an hour, or use the latest link already in your inbox."
          : error.message
      );
      return;
    }

    toast.success("Check your email for the magic link");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        disabled={loading}
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending…" : "Sign in with Magic Link"}
      </Button>
    </form>
  );
}
