import { useState, useEffect } from "react";
import { Analysis } from "@/types";
import { Button } from "@/components/common/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { Plus, Check, Trash2, ListTodo } from "lucide-react";
import { cn } from "@/utils/cn";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

interface TasksTabProps {
  ideaId: string;
  analyses: Analysis[];
}

export const TasksTab = ({ ideaId, analyses }: TasksTabProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Initialize tasks from next_steps analysis on first load
  useEffect(() => {
    const storedTasks = localStorage.getItem(`tasks_${ideaId}`);
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      // Populate from next_steps analysis if available
      const nextStepsAnalysis = analyses.find((a) => a.sectionType === "next_steps");
      if (nextStepsAnalysis?.content?.steps) {
        const initialTasks: Task[] = nextStepsAnalysis.content.steps.map(
          (step: any, idx: number) => ({
            id: `initial_${idx}`,
            title: step.title,
            description: step.description,
            completed: false,
            createdAt: new Date().toISOString(),
          })
        );
        setTasks(initialTasks);
        localStorage.setItem(`tasks_${ideaId}`, JSON.stringify(initialTasks));
      }
    }
  }, [ideaId, analyses]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem(`tasks_${ideaId}`, JSON.stringify(tasks));
    }
  }, [tasks, ideaId]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle icon={<ListTodo size={28} />}>Action Items</CardTitle>
              <p className="text-text-secondary mt-2">
                Track progress on your idea with actionable tasks
                {totalCount > 0 && (
                  <span className="ml-2 text-sm">
                    ({completedCount}/{totalCount} completed)
                  </span>
                )}
              </p>
            </div>
            <Button onClick={() => setIsAddingTask(true)} size="sm">
              <Plus size={16} className="mr-1" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingTask && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTask()}
                placeholder="Enter task title..."
                className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                autoFocus
              />
              <Button onClick={addTask} size="sm">
                Add
              </Button>
              <Button onClick={() => setIsAddingTask(false)} variant="ghost" size="sm">
                Cancel
              </Button>
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="py-12 text-center">
              <ListTodo size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
              <p className="text-text-secondary">
                No tasks yet. Add tasks to track your progress or they'll be automatically populated from your
                analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "group flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-background",
                    task.completed && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      task.completed
                        ? "border-primary bg-primary text-white"
                        : "border-border hover:border-primary"
                    )}
                  >
                    {task.completed && <Check size={14} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("text-text-primary", task.completed && "line-through")}>{task.title}</h4>
                    {task.description && (
                      <p className="mt-1 text-sm text-text-secondary">{task.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="shrink-0 text-text-secondary opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
