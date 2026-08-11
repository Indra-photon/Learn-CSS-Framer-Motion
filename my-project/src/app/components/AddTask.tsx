"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  IconCheck,
  IconChevronDown,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import useMeasure from "react-use-measure";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Subtask {
  id: string;
  title: string;
  /** Timestamp of completion, or null while open. Doubles as the done flag. */
  completedAt: number | null;
}

interface Task {
  id: string;
  title: string;
  due: number | null;
  subtasks: Subtask[];
}

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();

const INITIAL_TASKS: Task[] = [
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

const SPRING = { type: "spring", duration: 0.3, bounce: 0 } as const;

/** Exits stay softer than enters: a small fixed lift, never the full height. */
const ROW_EXIT = {
  opacity: 0,
  y: -12,
  filter: "blur(4px)",
  transition: { duration: 0.15, ease: "easeOut" },
} as const;

const uid = () => Math.random().toString(36).slice(2, 10);

/* ------------------------------------------------------------------ dates */

const startOfDay = (time: number) => {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const daysFromToday = (time: number) =>
  Math.round((startOfDay(time) - startOfDay(Date.now())) / DAY);

/** The deadline gets louder as it approaches: overdue and today carry weight. */
function formatDue(due: number) {
  const days = daysFromToday(due);

  if (days < 0) {
    return {
      label: days === -1 ? "Yesterday" : `${Math.abs(days)} days late`,
      tone: "text-destructive",
    };
  }
  if (days === 0)
    return { label: "Today", tone: "text-foreground font-medium" };
  if (days === 1) {
    return { label: "Tomorrow", tone: "text-foreground font-medium" };
  }
  if (days < 7) {
    return {
      label: new Date(due).toLocaleDateString(undefined, { weekday: "long" }),
      tone: "text-muted-foreground",
    };
  }
  return {
    label: new Date(due).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    tone: "text-muted-foreground",
  };
}

function formatCompletedAt(completedAt: number) {
  const date = new Date(completedAt);
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const days = daysFromToday(completedAt);

  if (days === 0) return time;
  if (days === -1) return `Yesterday ${time}`;
  return `${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} ${time}`;
}

/**
 * Dates render client-side only. The server has no way to know the reader's
 * timezone, so formatting during SSR guarantees a hydration mismatch.
 */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Counts every false → true crossing, so an effect can replay on each one. */
function useBurst(active: boolean) {
  const [burst, setBurst] = useState(0);
  const wasActive = useRef(active);

  useEffect(() => {
    if (active && !wasActive.current) setBurst((count) => count + 1);
    wasActive.current = active;
  }, [active]);

  return burst;
}

/* --------------------------------------------------------------- confetti */

/**
 * Each particle travels an arc, not a straight ray: the midpoint of its
 * three-keyframe path is pushed perpendicular to the direction of travel, so
 * the position keyframes bend instead of running flat.
 */
function buildBurst(
  count: number,
  origin: number,
  distance: number,
  bend: number,
) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    const swing = index % 2 === 0 ? bend : -bend;

    return {
      endX: origin + Math.cos(angle) * distance,
      endY: origin + Math.sin(angle) * distance,
      midX:
        origin + Math.cos(angle) * distance * 0.55 - Math.sin(angle) * swing,
      midY:
        origin + Math.sin(angle) * distance * 0.55 + Math.cos(angle) * swing,
    };
  });
}

const CELEBRATION = buildBurst(14, 100, 78, 20);

/** Fires once for the whole card: the last task done is the real milestone. */
function Celebration({ burst }: { burst: number }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion || burst === 0) return null;

  return (
    <svg
      key={burst}
      viewBox="0 0 200 200"
      aria-hidden
      className="text-success pointer-events-none absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 overflow-visible"
    >
      {CELEBRATION.map((particle, index) => (
        <motion.circle
          key={index}
          fill="currentColor"
          initial={{ cx: 100, cy: 100, r: 0, opacity: 1 }}
          animate={{
            cx: [100, particle.midX, particle.endX],
            cy: [100, particle.midY, particle.endY],
            r: [0, 5, 1.5],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.9,
            ease: "easeOut",
            delay: index * 0.015,
          }}
        />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------- indicators */

/**
 * Pie indicator: the disc is split into `total` equal cones (360 / total) and
 * `done` of them are filled, sweeping clockwise from 12 o'clock.
 *
 * The fill is a stroked circle, not a wedge path: a stroke of width 2r on a
 * circle of radius r covers the whole disc, so animating `pathLength` sweeps a
 * solid pie instead of an arc.
 */
function TaskProgress({ done, total }: { done: number; total: number }) {
  const reduceMotion = useReducedMotion();
  const complete = total > 0 && done === total;

  const radius = 5.5;
  const strokeWidth = radius * 2;

  return (
    <svg viewBox="0 0 32 32" aria-hidden className="size-6 shrink-0">
      <circle
        cx="16"
        cy="16"
        r="14.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={`transition-[color] duration-300 ease-out ${
          complete ? "text-success/40" : "text-muted-foreground/30"
        }`}
      />

      {/* Motion drives pathLength through strokeDasharray, so at exactly 1 the
          dash ends butt together and leave a hairline seam at 12 o'clock. This
          solid disc sits behind the sweep and covers it once complete. */}
      <motion.circle
        cx="16"
        cy="16"
        r={radius + strokeWidth / 2}
        fill="currentColor"
        className="text-success"
        initial={false}
        animate={{ opacity: complete ? 1 : 0 }}
        transition={reduceMotion ? { duration: 0 } : SPRING}
      />

      <motion.circle
        cx="16"
        cy="16"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        transform="rotate(-90 16 16)"
        className={`transition-[color] duration-300 ease-out ${
          complete ? "text-success" : "text-primary"
        }`}
        initial={false}
        animate={{ pathLength: total > 0 ? done / total : 0 }}
        transition={reduceMotion ? { duration: 0 } : SPRING}
      />

      <motion.path
        d="M11 16.5 L14.5 20 L21 11.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-card"
        initial={false}
        animate={{ pathLength: complete ? 1 : 0, opacity: complete ? 1 : 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { ...SPRING, delay: complete ? 0.1 : 0 }
        }
      />
    </svg>
  );
}

/**
 * The child of the pie: same circle, same green, but binary rather than
 * segmented. One shape and one color mean "done" at both levels.
 */
function SubtaskCheck({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ease-out ${
        done ? "bg-success border-transparent" : "border-foreground/25"
      }`}
    >
      <AnimatePresence initial={false}>
        {done && (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            transition={SPRING}
            className="flex"
          >
            <IconCheck className="text-card size-3.5" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ------------------------------------------------------------------- rows */

/** Rename and delete, revealed on hover and whenever a row takes focus. */
function RowActions({
  label,
  onRename,
  onDelete,
  className,
}: {
  label: string;
  onRename: () => void;
  onDelete: () => void;
  className?: string;
}) {
  return (
    <span
      className={`absolute inset-y-0 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 ease-out group-focus-within/row:opacity-100 group-hover/row:opacity-100 max-sm:opacity-100 ${className}`}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRename}
        aria-label={`Rename ${label}`}
      >
        <IconPencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        className="hover:text-destructive"
      >
        <IconTrash className="size-4" />
      </Button>
    </span>
  );
}

/** Inline rename, in place, at the row's own type size. */
function TitleEditor({
  defaultValue,
  className,
  onCommit,
  onCancel,
}: {
  defaultValue: string;
  className?: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(defaultValue);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed) onCommit(trimmed);
    else onCancel();
  };

  return (
    <Input
      autoFocus
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
        if (event.key === "Escape") onCancel();
      }}
      className={`h-auto rounded-lg border-transparent bg-transparent px-2 py-0.5 focus-visible:border-transparent ${className}`}
    />
  );
}

function SubtaskRow({
  subtask,
  onToggle,
  onRename,
  onDelete,
}: {
  subtask: Subtask;
  onToggle: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const mounted = useMounted();
  const done = subtask.completedAt !== null;

  return (
    <motion.li layout className="group/row relative" exit={ROW_EXIT}>
      {editing ? (
        <div className="flex items-center gap-3 px-4 py-2.5">
          <SubtaskCheck done={done} />
          <TitleEditor
            defaultValue={subtask.title}
            className="text-sm"
            onCommit={(title) => {
              onRename(title);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <>
          <Button
            variant="ghost"
            onClick={onToggle}
            aria-pressed={done}
            className="h-auto w-full justify-start gap-3 rounded-xl px-4 py-2.5 pe-20 text-start whitespace-normal active:scale-[0.96]"
          >
            <SubtaskCheck done={done} />

            {/* Optical alignment: text sits ~1px low against a round glyph. */}
            <span
              className={`relative -top-px min-w-0 flex-1 truncate text-sm font-normal ${
                done ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {subtask.title}
            </span>

            <AnimatePresence initial={false}>
              {done && mounted && (
                <motion.span
                  key="stamp"
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={SPRING}
                  className="text-muted-foreground/70 relative -top-px shrink-0 text-xs font-normal tabular-nums transition-opacity duration-150 group-hover/row:opacity-0"
                >
                  {formatCompletedAt(subtask.completedAt!)}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          <RowActions
            label={subtask.title}
            onRename={() => setEditing(true)}
            onDelete={onDelete}
            className="end-2"
          />
        </>
      )}
    </motion.li>
  );
}

function TaskItem({
  task,
  isOpen,
  onOpenChange,
  onRename,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onRenameSubtask,
  onDeleteSubtask,
}: {
  task: Task;
  isOpen: boolean;
  onOpenChange: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onRenameSubtask: (subtaskId: string, title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}) {
  const [panelRef, { height }] = useMeasure();
  const [editing, setEditing] = useState(false);
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();
  const panelId = useId();

  const done = task.subtasks.filter(
    (subtask) => subtask.completedAt !== null,
  ).length;
  const total = task.subtasks.length;
  const complete = total > 0 && done === total;
  const due = task.due !== null ? formatDue(task.due) : null;

  return (
    <motion.li layout exit={ROW_EXIT}>
      {/* Completed work recedes so the remaining pile reads as the shorter one. */}
      <div
        className={`group/row relative transition-opacity duration-300 ease-out ${
          complete ? "opacity-60 hover:opacity-100" : ""
        }`}
      >
        {editing ? (
          <div className="flex items-center gap-3 px-4 py-3.5">
            <TaskProgress done={done} total={total} />
            <TitleEditor
              defaultValue={task.title}
              className="text-base font-semibold"
              onCommit={(title) => {
                onRename(title);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <>
            <h3>
              <Button
                variant="ghost"
                onClick={onOpenChange}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="h-auto w-full justify-start gap-3 rounded-xl px-4 py-3.5 pe-32 text-start whitespace-normal active:scale-[0.96]"
              >
                <TaskProgress done={done} total={total} />

                {/* Optical alignment: text sits ~1px low against a round glyph. */}
                <span className="text-foreground relative -top-px min-w-0 flex-1 truncate text-base font-semibold">
                  {task.title}
                </span>

                {/* The deadline stops mattering the moment the task is done. */}
                <AnimatePresence initial={false}>
                  {due && !complete && mounted && (
                    <motion.span
                      key="due"
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(4px)" }}
                      transition={SPRING}
                      className={`relative -top-px shrink-0 text-xs tabular-nums transition-opacity duration-150 group-hover/row:opacity-0 ${due.tone}`}
                    >
                      {due.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                <motion.span
                  aria-hidden
                  className="text-muted-foreground/60 relative -top-px flex shrink-0"
                  initial={false}
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                >
                  <IconChevronDown className="size-4" strokeWidth={1.5} />
                </motion.span>
              </Button>
            </h3>

            <RowActions
              label={task.title}
              onRename={() => setEditing(true)}
              onDelete={onDelete}
              className="end-10"
            />
          </>
        )}
      </div>

      <motion.div
        id={panelId}
        initial={false}
        animate={{ height: isOpen ? height : 0 }}
        transition={reduceMotion ? { duration: 0 } : SPRING}
        className="overflow-hidden"
      >
        {/* The measured element: its natural height drives the animation above. */}
        <div ref={panelRef} inert={!isOpen}>
          <motion.div
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -8 }}
            transition={reduceMotion ? { duration: 0 } : SPRING}
            className="ps-6 pe-1 pb-2"
          >
            <ul>
              <AnimatePresence mode="popLayout" initial={false}>
                {task.subtasks.map((subtask) => (
                  <SubtaskRow
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={() => onToggleSubtask(subtask.id)}
                    onRename={(title) => onRenameSubtask(subtask.id, title)}
                    onDelete={() => onDeleteSubtask(subtask.id)}
                  />
                ))}
              </AnimatePresence>
            </ul>

            <Composer
              label="Add subtask"
              placeholder="What's the next step?"
              onSubmit={onAddSubtask}
              className="ms-4 text-sm"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.li>
  );
}

/* --------------------------------------------------------------- composer */

/** A trigger that becomes a field in place; both are the same height, so the
 *  swap costs no layout shift and needs no height animation of its own. */
function Composer({
  label,
  placeholder,
  className,
  onSubmit,
}: {
  label: string;
  placeholder: string;
  className?: string;
  onSubmit: (title: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const commit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setOpen(false);
      return;
    }
    onSubmit(trimmed);
    setValue("");
  };

  return (
    <div className={`flex h-10 items-center ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        {open ? (
          <motion.form
            key="field"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={SPRING}
            className="flex w-full items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              commit();
            }}
          >
            <Input
              autoFocus
              value={value}
              placeholder={placeholder}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setValue("");
                  setOpen(false);
                }
              }}
              className="h-8 flex-1 rounded-lg"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!value.trim()}
              className="rounded-lg"
            >
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-lg"
              onClick={() => {
                setValue("");
                setOpen(false);
              }}
            >
              Cancel
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="trigger"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={SPRING}
          >
            <Button
              variant="ghost"
              onClick={() => setOpen(true)}
              className="text-muted-foreground hover:text-foreground h-8 gap-2 rounded-lg px-2 font-normal"
            >
              <IconPlus className="size-4" />
              {label}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------- card */

function AddTask() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [openTaskIds, setOpenTaskIds] = useState<string[]>([
    INITIAL_TASKS[0].id,
  ]);
  const isComplete = (task: Task) =>
    task.subtasks.length > 0 &&
    task.subtasks.every((subtask) => subtask.completedAt !== null);

  const doneCount = useMemo(() => tasks.filter(isComplete).length, [tasks]);
  const allDone = tasks.length > 0 && doneCount === tasks.length;
  const burst = useBurst(allDone);

  const toggleOpen = (taskId: string) =>
    setOpenTaskIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
    );

  const updateTask = (taskId: string, update: (task: Task) => Task) =>
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? update(task) : task)),
    );

  const addTask = (title: string) => {
    const id = uid();
    setTasks((current) => [...current, { id, title, due: null, subtasks: [] }]);
    setOpenTaskIds((current) => [...current, id]);
  };

  const deleteTask = (taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setOpenTaskIds((current) => current.filter((id) => id !== taskId));
  };

  const addSubtask = (taskId: string, title: string) =>
    updateTask(taskId, (task) => ({
      ...task,
      subtasks: [...task.subtasks, { id: uid(), title, completedAt: null }],
    }));

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const subtasks = task.subtasks.map((subtask) =>
      subtask.id === subtaskId
        ? {
            ...subtask,
            completedAt: subtask.completedAt === null ? Date.now() : null,
          }
        : subtask,
    );

    setTasks((current) =>
      current.map((item) =>
        item.id === taskId ? { ...item, subtasks } : item,
      ),
    );

    // A finished task folds itself away, so the list visibly shortens.
    if (subtasks.every((subtask) => subtask.completedAt !== null)) {
      setOpenTaskIds((current) => current.filter((id) => id !== taskId));
    }
  };

  const summary = () => {
    if (tasks.length === 0) return "Nothing on the list.";
    if (allDone) return "Every task is done.";
    return `${doneCount} of ${tasks.length} tasks done`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="relative w-full max-w-xl gap-0 py-0">
        <Celebration burst={burst} />

        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-xl">Tasks</CardTitle>
          <CardDescription>{summary()}</CardDescription>
        </CardHeader>

        <CardContent className="px-2 pb-2">
          <div>
            <div>
              <ul className="space-y-0.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      isOpen={openTaskIds.includes(task.id)}
                      onOpenChange={() => toggleOpen(task.id)}
                      onRename={(title) =>
                        updateTask(task.id, (current) => ({
                          ...current,
                          title,
                        }))
                      }
                      onDelete={() => deleteTask(task.id)}
                      onAddSubtask={(title) => addSubtask(task.id, title)}
                      onToggleSubtask={(subtaskId) =>
                        toggleSubtask(task.id, subtaskId)
                      }
                      onRenameSubtask={(subtaskId, title) =>
                        updateTask(task.id, (current) => ({
                          ...current,
                          subtasks: current.subtasks.map((subtask) =>
                            subtask.id === subtaskId
                              ? { ...subtask, title }
                              : subtask,
                          ),
                        }))
                      }
                      onDeleteSubtask={(subtaskId) =>
                        updateTask(task.id, (current) => ({
                          ...current,
                          subtasks: current.subtasks.filter(
                            (subtask) => subtask.id !== subtaskId,
                          ),
                        }))
                      }
                    />
                  ))}
                </AnimatePresence>
              </ul>

              {tasks.length === 0 && (
                <p className="text-muted-foreground px-4 py-6 text-sm">
                  Add your first task below.
                </p>
              )}

              <Composer
                label="Add task"
                placeholder="What needs doing?"
                onSubmit={addTask}
                className="ms-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddTask;
