import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, insertTaskSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

const priorities = ["Low", "Medium", "High", "Urgent"];

export default function TasksPage() {
  const { user } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "Medium",
      completed: false,
    },
  });

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const addTaskMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      form.reset();
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await apiRequest("PATCH", `/api/tasks/${taskId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">Organize your farming tasks</p>
          </div>
          <nav className="flex gap-4">
            <Link href="/">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/inventory">
              <Button variant="outline">Inventory</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit((data) =>
                  addTaskMutation.mutate(data)
                )}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input {...form.register("title")} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea {...form.register("description")} />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    type="date"
                    {...form.register("dueDate")}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("priority", value)
                    }
                    defaultValue={form.getValues("priority")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={addTaskMutation.isPending}
                >
                  {addTaskMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Task
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {tasks?.map((task) => (
            <Card
              key={task.id}
              className={task.completed ? "opacity-60" : undefined}
            >
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {task.title}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === "High" || task.priority === "Urgent"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </CardTitle>
                </div>
                {!task.completed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => completeTaskMutation.mutate(task.id)}
                    disabled={completeTaskMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{task.description}</p>
                <p className="text-sm">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!tasks || tasks.length === 0) && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No tasks found. Add some tasks to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
