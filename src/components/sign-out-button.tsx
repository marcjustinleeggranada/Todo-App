"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
