"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("error")) {
      router.replace("/?error=auth");
      return;
    }

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.replace("/todos");
        router.refresh();
      }
    });

    // Triggers client init, which exchanges ?code= using the PKCE verifier cookie.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/todos");
        router.refresh();
      }
    });

    const timeout = window.setTimeout(() => {
      setMessage("Sign-in failed. Redirecting...");
      router.replace("/?error=auth");
    }, 8000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
}
