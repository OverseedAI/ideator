import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as taskService from "@/services/taskService";
import { Task } from "@/types";
import toast from "react-hot-toast";

// Query keys
export const taskKeys = {
  all: () => ["tasks"] as const,
  lists: () => [...taskKeys.all(), "list"] as const,
  list: (ideaId: string) => [...taskKeys.lists(), ideaId] as const,
};

/**
 * Hook to get all tasks for an idea
 */
export const useTasks = (ideaId: string | undefined, options?: { enabled?: boolean }) => {
  return useQuery<Task[]>({
    queryKey: taskKeys.list(ideaId!),
    queryFn: () => taskService.getIdeaTasks(ideaId!),
    enabled: Boolean(ideaId) && (options?.enabled ?? true),
  });
};

/**
 * Hook to create a new task
 */
export const useCreateTask = (ideaId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { title: string; description?: string; order?: number }>({
    mutationFn: (data) => taskService.createTask(ideaId, data),
    onSuccess: () => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.list(ideaId) });
      toast.success("Task created successfully!");
    },
    meta: {
      errorMessage: "Failed to create task. Please try again.",
    },
  });
};

/**
 * Hook to bulk create tasks (useful for initializing from analysis)
 */
export const useBulkCreateTasks = (ideaId: string) => {
  const queryClient = useQueryClient();

  return useMutation<Task[], Error, { title: string; description?: string; order?: number }[]>({
    mutationFn: (tasks) => taskService.bulkCreateTasks(ideaId, tasks),
    onSuccess: () => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.list(ideaId) });
      toast.success("Tasks created successfully!");
    },
    meta: {
      errorMessage: "Failed to create tasks. Please try again.",
    },
  });
};

/**
 * Hook to update a task
 */
export const useUpdateTask = (ideaId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    Task,
    Error,
    {
      taskId: string;
      data: Partial<{ title: string; description?: string; completed: boolean; order: number }>;
    }
  >({
    mutationFn: ({ taskId, data }) => taskService.updateTask(ideaId, taskId, data),
    onSuccess: () => {
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.list(ideaId) });
    },
    meta: {
      errorMessage: "Failed to update task. Please try again.",
    },
  });
};

/**
 * Hook to delete a task
 */
export const useDeleteTask = (ideaId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previousTasks?: Task[] }>({
    mutationFn: (taskId) => taskService.deleteTask(ideaId, taskId),
    onMutate: async (taskId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.list(ideaId) });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.list(ideaId));

      // Optimistically remove the task from the list
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          taskKeys.list(ideaId),
          previousTasks.filter((task) => task.id !== taskId)
        );
      }

      // Return context with the snapshot
      return { previousTasks };
    },
    onError: (_error, _taskId, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(ideaId), context.previousTasks);
      }
    },
    onSuccess: () => {
      toast.success("Task deleted successfully!");
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: taskKeys.list(ideaId) });
    },
    meta: {
      errorMessage: "Failed to delete task. Please try again.",
    },
  });
};
