"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import type { Todo } from "@/types/todo";

type TodoListProps = {
  initialTodos: Todo[];
  userId: string;
};

export function TodoList({ initialTodos, userId }: TodoListProps) {
  const router = useRouter();
  const [todos, setTodos] = useState(initialTodos);
  const [task, setTask] = useState("");
  const [adding, setAdding] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = task.trim();
    if (!trimmed) {
      toast.error("Enter a task");
      return;
    }

    setAdding(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("todos")
      .insert({ task: trimmed, user_id: userId })
      .select()
      .single();

    setAdding(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setTodos((prev) => [data as Todo, ...prev]);
    setTask("");
    toast.success("Todo added");
    router.refresh();
  }

  async function handleToggle(todo: Todo) {
    setPendingId(todo.id);
    const supabase = createClient();
    const nextComplete = !todo.is_complete;

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, is_complete: nextComplete } : t
      )
    );

    const { error } = await supabase
      .from("todos")
      .update({ is_complete: nextComplete })
      .eq("id", todo.id);

    setPendingId(null);

    if (error) {
      // Roll back on failure
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, is_complete: todo.is_complete } : t
        )
      );
      toast.error(error.message);
      return;
    }

    router.refresh();
  }

  async function handleDelete(id: string) {
    setPendingId(id);
    const supabase = createClient();
    const previous = todos;

    setTodos((prev) => prev.filter((t) => t.id !== id));

    const { error } = await supabase.from("todos").delete().eq("id", id);

    setPendingId(null);

    if (error) {
      setTodos(previous);
      toast.error(error.message);
      return;
    }

    toast.success("Todo deleted");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="What needs to be done?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          disabled={adding}
          className="flex-1"
        />
        <Button type="submit" disabled={adding}>
          {adding ? "Adding…" : "Add"}
        </Button>
      </form>

      {todos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No todos yet. Add one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
            >
              <Checkbox
                checked={todo.is_complete}
                disabled={pendingId === todo.id}
                onCheckedChange={() => handleToggle(todo)}
                aria-label={
                  todo.is_complete ? "Mark incomplete" : "Mark complete"
                }
              />
              <span
                className={`flex-1 text-sm ${
                  todo.is_complete
                    ? "text-muted-foreground line-through"
                    : ""
                }`}
              >
                {todo.task}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={pendingId === todo.id}
                onClick={() => handleDelete(todo.id)}
                aria-label="Delete todo"
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
