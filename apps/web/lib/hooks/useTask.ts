"use client";

import { useState, useEffect, useCallback } from "react";
import { getTaskById, type Task } from "../api/tasks";

export function useTask(taskId: string | null | undefined) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(!!taskId);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getTaskById(taskId);
      setTask(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch task details");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return {
    task,
    loading,
    error,
    refetch: fetchTask,
  };
}
