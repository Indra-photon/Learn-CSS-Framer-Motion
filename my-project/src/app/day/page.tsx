"use client";

import { useEffect, useState } from "react";

import { DayView } from "@/components/blocks/day-view-drawer";
import type { Task } from "@/components/blocks/task-checklist";

const HOUR = 60 * 60 * 1000;

/** Today at a fixed hour, so the seeded completion times read sensibly. */
const at = (hour: number, minute = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
};

const seed = (): Task[] => [
  {
    id: "life",
    title: "Life",
    due: Date.now(),
    subtasks: [
      { id: "life-1", title: "Journal for 3 min", completedAt: at(7, 51) },
      {
        id: "life-2",
        title: "Finish book (only 64 pages left!!)",
        completedAt: null,
      },
      { id: "life-3", title: "Workout", completedAt: null },
    ],
  },
  {
    id: "home",
    title: "Home & Family",
    due: Date.now(),
    subtasks: [
      { id: "home-1", title: "Water the plants", completedAt: at(9, 20) },
      { id: "home-2", title: "Dinner at Lucca", completedAt: null },
    ],
  },
  {
    id: "work",
    title: "Work",
    due: Date.now(),
    subtasks: [
      { id: "work-1", title: "Review the pull request", completedAt: null },
      { id: "work-2", title: "Send the launch email", completedAt: null },
    ],
  },
];

/**
 * Standalone view of the phone screen. The tree renders after mount only:
 * completion times are locale- and timezone-dependent, so rendering them on
 * the server would guarantee a hydration mismatch.
 */
export default function DayPage() {
  const [tasks, setTasks] = useState<Task[]>(seed);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggleSubtask = (taskId: string, subtaskId: string) =>
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === subtaskId
                  ? {
                      ...subtask,
                      completedAt:
                        subtask.completedAt === null ? Date.now() : null,
                    }
                  : subtask,
              ),
            }
          : task,
      ),
    );

  const addSubtask = (taskId: string, title: string) =>
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...task.subtasks,
                { id: crypto.randomUUID(), title, completedAt: null },
              ],
            }
          : task,
      ),
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,oklch(0_0_0_/_0.02)_10px,oklch(0_0_0_/_0.02)_11px)] p-6">
      {mounted && (
        <DayView
          date={Date.now() + 0 * HOUR}
          tasks={tasks}
          onClose={() => history.back()}
          onToggleSubtask={toggleSubtask}
          onAddSubtask={addSubtask}
        />
      )}
    </div>
  );
}
