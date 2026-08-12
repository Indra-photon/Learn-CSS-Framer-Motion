"use client";

import { TaskChecklist, type Task } from "@/components/blocks/task-checklist";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();

const SAMPLE_TASKS: Task[] = [
  {
    id: "onboarding",
    title: "Ship the onboarding flow",
    due: NOW + DAY,
    subtasks: [
      {
        id: "onboarding-1",
        title: "Draft the welcome copy",
        completedAt: null,
      },
      {
        id: "onboarding-2",
        title: "Build the account step",
        completedAt: null,
      },
      {
        id: "onboarding-3",
        title: "Wire up email verification",
        completedAt: null,
      },
    ],
  },
  {
    id: "design-system",
    title: "Tidy the design system",
    due: null,
    subtasks: [
      {
        id: "design-system-1",
        title: "Move colors to oklch",
        completedAt: null,
      },
      {
        id: "design-system-2",
        title: "Align nested corner radii",
        completedAt: null,
      },
      {
        id: "design-system-3",
        title: "Document the motion tokens",
        completedAt: null,
      },
    ],
  },
  {
    id: "launch",
    title: "Prepare the launch post",
    due: NOW + 6 * DAY,
    subtasks: [
      { id: "launch-1", title: "Collect the changelog", completedAt: null },
      { id: "launch-2", title: "Record the demo clip", completedAt: null },
      { id: "launch-3", title: "Write the announcement", completedAt: null },
      { id: "launch-4", title: "Schedule the send", completedAt: null },
    ],
  },
];

/**
 * Example usage of the TaskChecklist block, uncontrolled: the block owns its
 * state and reports every mutation through `onTasksChange`.
 */
export default function AddTask() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <TaskChecklist
        className="w-full max-w-xl"
        defaultTasks={SAMPLE_TASKS}
        defaultOpenIds={[SAMPLE_TASKS[0].id]}
        onTasksChange={(tasks) => console.log("tasks", tasks)}
        onTaskComplete={(task) => console.log("completed", task.title)}
        onAllComplete={() => console.log("everything done")}
      />
    </div>
  );
}
