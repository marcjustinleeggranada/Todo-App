import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";
import { TodoList } from "@/components/todo-list";
import { createClient } from "@/utils/supabase/server";
import type { Todo } from "@/types/todo";

export default async function TodosPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: todos, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // Surface fetch errors in the UI rather than crashing the page
    console.error("Failed to load todos:", error.message);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your list</CardTitle>
          <CardDescription>
            Add, complete, or delete tasks. Only you can see these.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">
              Could not load todos: {error.message}
            </p>
          ) : (
            <TodoList
              initialTodos={(todos ?? []) as Todo[]}
              userId={user.id}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
