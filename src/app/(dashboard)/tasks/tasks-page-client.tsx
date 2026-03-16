"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/search-input";
import { CreateTaskDialog } from "../dashboard/create-task-dialog";
import { EditTaskDialog } from "./edit-task-dialog";
import { Check, Circle } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
  projectId: string;
  project?: { id: string; name: string } | null;
  assignedTo?: { id: string; name: string | null; email: string } | null;
};

export function TasksPageClient({ tasks, projects }: { tasks: Task[]; projects: { id: string; name: string }[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filtered = tasks.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.project?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const byStatus = {
    todo: filtered.filter((t) => t.status === "todo"),
    in_progress: filtered.filter((t) => t.status === "in_progress"),
    done: filtered.filter((t) => t.status === "done"),
  };

  async function handleToggleDone(task: Task) {
    const newStatus = task.status === "done" ? "todo" : "done";
    await fetch(`/api/projects/${task.projectId}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">All your tasks across projects</p>
        </div>
        <CreateTaskDialog />
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Search tasks..." className="max-w-md" />
      <div className="flex flex-wrap gap-2">
        {["all", "todo", "in_progress", "done"].map((s) => (
          <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(s)}>
            {s === "all" ? "All" : s.replace("_", " ")}
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No tasks yet. Create a task from the dashboard or here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {(["todo", "in_progress", "done"] as const).map((status) => (
            <Card key={status}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base capitalize">{status.replace("_", " ")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {byStatus[status].map((task) => (
                  <div key={task.id} className="flex items-start gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <button type="button" onClick={() => handleToggleDone(task)} className="mt-0.5 shrink-0">
                      {task.status === "done" ? <Check className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <Link href={`/projects/${task.projectId}/tasks`} className="text-xs text-muted-foreground hover:underline">
                            {task.project?.name}
                          </Link>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setEditingTask(task)}>Edit</Button>
                      </div>
                      {task.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>}
                      {task.dueDate && <p className="mt-1 text-xs text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {editingTask && (
        <EditTaskDialog task={editingTask} open={!!editingTask} onClose={() => setEditingTask(null)} onSaved={() => { setEditingTask(null); router.refresh(); }} />
      )}
    </div>
  );
}
