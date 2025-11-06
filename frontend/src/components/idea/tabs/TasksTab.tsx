import { useState, useEffect } from "react";
import { Analysis, Task } from "@/types";
import { Button } from "@/components/common/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { Plus, Check, Trash2, ListTodo } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { cn } from "@/utils/cn";
import {
  useTasks,
  useCreateTask,
  useBulkCreateTasks,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/queries/useTasks";

interface TasksTabProps {
  ideaId: string;
  analyses: Analysis[];
}

export const TasksTab = ({ ideaId, analyses }: TasksTabProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const tasksQuery = useTasks(ideaId);
  const createTaskMutation = useCreateTask(ideaId);
  const bulkCreateTasksMutation = useBulkCreateTasks(ideaId);
  const updateTaskMutation = useUpdateTask(ideaId);
  const deleteTaskMutation = useDeleteTask(ideaId);

  const tasks = tasksQuery.data ?? [];

  // Initialize tasks from next_steps analysis if there are no tasks yet
  useEffect(() => {
    if (hasInitialized || tasksQuery.isLoading || !tasksQuery.data) {
      return;
    }

    setHasInitialized(true);

    // If there are no tasks, populate from next_steps analysis
    if (tasksQuery.data.length === 0) {
      const nextStepsAnalysis = analyses.find((a) => a.sectionType === "next_steps");
      if (nextStepsAnalysis?.content?.steps) {
        const initialTasks = nextStepsAnalysis.content.steps.map((step: any, idx: number) => ({
          title: step.title,
          description: step.description,
          order: idx,
        }));

        if (initialTasks.length > 0) {
          bulkCreateTasksMutation.mutate(initialTasks);
        }
      }
    }
  }, [tasksQuery.data, tasksQuery.isLoading, analyses, bulkCreateTasksMutation, hasInitialized]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    createTaskMutation.mutate(
      {
        title: newTaskTitle,
        description: newTaskDescription.trim() || undefined,
        order: tasks.length,
      },
      {
        onSuccess: () => {
          setNewTaskTitle("");
          setNewTaskDescription("");
          setIsAddingTask(false);
        },
      }
    );
  };

  const handleCancelAdd = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setIsAddingTask(false);
  };

  const toggleTask = (task: Task) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { completed: !task.completed },
    });
  };

  const deleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  if (tasksQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (tasksQuery.isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Failed to load tasks. Please try again.
      </div>
    );
  }

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
            <Button onClick={() => setIsAddingTask(true)} size="sm" disabled={isAddingTask}>
              <Plus size={16} className="mr-1" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingTask && (
            <div className="mb-4 rounded-lg border border-border bg-background p-4">
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="task-title"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    htmlFor="task-description"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Description <span className="text-text-secondary text-xs">(optional)</span>
                  </label>
                  <textarea
                    id="task-description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Add more details about this task..."
                    rows={3}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={handleCancelAdd} variant="ghost" size="sm">
                    Cancel
                  </Button>
                  <Button
                    onClick={addTask}
                    size="sm"
                    isLoading={createTaskMutation.isPending}
                    disabled={createTaskMutation.isPending || !newTaskTitle.trim()}
                  >
                    Add Task
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tasks.length === 0 && !bulkCreateTasksMutation.isPending ? (
            <div className="py-12 text-center">
              <ListTodo size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
              <p className="text-text-secondary">
                No tasks yet. Add tasks to track your progress or they'll be automatically populated
                from your analysis.
              </p>
            </div>
          ) : bulkCreateTasksMutation.isPending ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="sm" />
              <span className="ml-3 text-text-secondary">Initializing tasks from analysis...</span>
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
                    onClick={() => toggleTask(task)}
                    disabled={updateTaskMutation.isPending}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      task.completed
                        ? "border-primary bg-primary text-white"
                        : "border-border hover:border-primary",
                      updateTaskMutation.isPending && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {task.completed && <Check size={14} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("text-text-primary", task.completed && "line-through")}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="mt-1 text-sm text-text-secondary">{task.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    disabled={deleteTaskMutation.isPending}
                    className={cn(
                      "shrink-0 text-text-secondary opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100",
                      deleteTaskMutation.isPending && "opacity-50 cursor-not-allowed"
                    )}
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
