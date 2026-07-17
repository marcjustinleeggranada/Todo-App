import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

type HomePageProps = {
  searchParams?: { error?: string };
};

export default function HomePage({ searchParams }: HomePageProps) {
  const authFailed = searchParams?.error === "auth";

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Todo App</CardTitle>
          <CardDescription>
            Sign in with a 6-digit code sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {authFailed && (
            <p className="text-sm text-destructive">
              Sign-in failed. Request a new code and try again.
            </p>
          )}
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
