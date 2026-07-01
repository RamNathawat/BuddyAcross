"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasks, type GetTasksQuery, type Task } from "../api/tasks";

export function useTasks(initialQuery: GetTasksQuery = {}, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Serialize query to string for stable effect dependency comparison
  const queryString = JSON.stringify(initialQuery);

  const fetchTasks = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const parsedQuery = JSON.parse(queryString);
      const response = await getTasks(parsedQuery);
      setTasks(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [queryString, enabled]);

  useEffect(() => {
    if (enabled) {
      fetchTasks();
    }
  }, [fetchTasks, enabled]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  };
}
