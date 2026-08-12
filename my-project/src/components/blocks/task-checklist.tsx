"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IconCalendarEvent,
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
import { DayViewDrawer } from "@/components/blocks/day-view-drawer";

/* ------------------------------------------------------------------ types */

export interface Subtask {
  id: string;
  title: string;
  /** Timestamp of completion, or null while open. Doubles as the done flag. */
  completedAt: number | null;
}

export interface Task {
  id: string;
  title: string;
  /** Due timestamp, or null when the task has no deadline. */
  due: number | null;
  subtasks: Subtask[];
}

/** A formatted deadline: the label to show, plus classes carrying its urgency. */
export interface DueDisplay {
  label: string;
  tone?: string;
}

export const DEFAULT_LABELS = {
  title: "Tasks",
  addTask: "Add task",
  addSubtask: "Add subtask",
  taskPlaceholder: "What needs doing?",
  subtaskPlaceholder: "What's the next step?",
  add: "Add",
  cancel: "Cancel",
  rename: (name: string) => `Rename ${name}`,
  delete: (name: string) => `Delete ${name}`,
  empty: "Add your first task below.",
  emptySummary: "Nothing on the list.",
  allDone: "Every task is done.",
  summary: (done: number, total: number) => `${done} of ${total} tasks done`,
};

export type TaskChecklistLabels = typeof DEFAULT_LABELS;

export interface TaskChecklistProps extends Omit<
  React.ComponentProps<"div">,
  "onChange" | "title"
> {
  /** Controlled task list. Pair with `onTasksChange`. */
  tasks?: Task[];
  /** Initial task list when the component owns its own state. */
  defaultTasks?: Task[];
  /** Fires on every mutation with the complete next list. */
  onTasksChange?: (tasks: Task[]) => void;

  /** Controlled set of expanded task ids. */
  openIds?: string[];
  defaultOpenIds?: string[];
  onOpenIdsChange?: (openIds: string[]) => void;

  /** `single` closes the previous panel when another opens. */
  mode?: "single" | "multiple";
  /** Fold a task away as its last subtask is checked off. */
  collapseOnComplete?: boolean;

  labels?: Partial<TaskChecklistLabels>;
  formatDue?: (due: number) => DueDisplay;
  formatCompletedAt?: (completedAt: number) => string;
  /** Override id creation to match the ids your backend hands out. */
  generateId?: () => string;

  /** Fires when a task's last subtask is checked off. */
  onTaskComplete?: (task: Task) => void;
  /** Fires when every task in the list is complete. */
  onAllComplete?: () => void;
}

/* -------------------------------------------------------------- internals */

const SPRING = { type: "spring", duration: 0.3, bounce: 0 } as const;

/** Exits stay softer than enters: a small fixed lift, never the full height. */
const ROW_EXIT = {
  opacity: 0,
  y: -12,
  filter: "blur(4px)",
  transition: { duration: 0.15, ease: "easeOut" },
} as const;

const DAY = 24 * 60 * 60 * 1000;

const defaultGenerateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const startOfDay = (time: number) => {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const daysFromToday = (time: number) =>
  Math.round((startOfDay(time) - startOfDay(Date.now())) / DAY);

/** The deadline gets louder as it approaches: overdue and today carry weight. */
export function defaultFormatDue(due: number): DueDisplay {
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

export function defaultFormatCompletedAt(completedAt: number) {
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

interface ChecklistContextValue {
  labels: TaskChecklistLabels;
  formatDue: (due: number) => DueDisplay;
  formatCompletedAt: (completedAt: number) => string;
}

const ChecklistContext = createContext<ChecklistContextValue | null>(null);

function useChecklist() {
  const value = useContext(ChecklistContext);
  if (!value) {
    throw new Error("TaskChecklist internals used outside of <TaskChecklist>");
  }
  return value;
}

/** Uncontrolled by default; defers to the prop the moment one is passed. */
function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : uncontrolled;

  const valueRef = useRef(value);
  valueRef.current = value;

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (previous: T) => T)(valueRef.current)
          : next;

      if (!isControlled) setUncontrolled(resolved);
      onChange?.(resolved);
    },
    [isControlled, onChange],
  );

  return [value, setValue] as const;
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

const isTaskComplete = (task: Task) =>
  task.subtasks.length > 0 &&
  task.subtasks.every((subtask) => subtask.completedAt !== null);

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
          transition={{ duration: 0.9, ease: "easeOut", delay: index * 0.015 }}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------- indicators */

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
  const { labels } = useChecklist();

  return (
    <span
      className={`absolute inset-y-0 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 ease-out group-focus-within/row:opacity-100 group-hover/row:opacity-100 max-sm:opacity-100 ${className}`}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRename}
        aria-label={labels.rename(label)}
      >
        <IconPencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label={labels.delete(label)}
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
  const { labels } = useChecklist();
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
              {labels.add}
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
              {labels.cancel}
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
  const { formatCompletedAt } = useChecklist();
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
  onOpenDay,
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
  onOpenDay: (date: number) => void;
}) {
  const { labels, formatDue } = useChecklist();
  const [panelRef, { height }] = useMeasure();
  const [editing, setEditing] = useState(false);
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();
  const panelId = useId();

  const done = task.subtasks.filter(
    (subtask) => subtask.completedAt !== null,
  ).length;
  const total = task.subtasks.length;
  const complete = isTaskComplete(task);
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
                className={`h-auto w-full justify-start gap-3 rounded-xl px-4 py-3.5 text-start whitespace-normal active:scale-[0.96] ${
                  due && !complete ? "pe-56" : "pe-28"
                }`}
              >
                <TaskProgress done={done} total={total} />

                {/* Optical alignment: text sits ~1px low against a round glyph. */}
                <span className="text-foreground relative -top-px min-w-0 flex-1 truncate text-base font-semibold">
                  {task.title}
                </span>
              </Button>
            </h3>

            {/* Three lanes at the trailing edge, none overlapping: the date at
                112px, the row actions at 40px, the chevron at 12px. The date
                has to stay visible and clickable while the row is hovered. */}
            <AnimatePresence initial={false}>
              {due && !complete && mounted && (
                <motion.button
                  key="due"
                  type="button"
                  onClick={() => onOpenDay(task.due!)}
                  aria-label={`Open ${due.label} in the day view`}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={SPRING}
                  className={`bg-muted hover:bg-foreground/10 focus-visible:ring-ring/50 absolute end-28 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-full py-1 ps-2 pe-2.5 text-xs tabular-nums transition-colors duration-150 focus-visible:ring-[3px] focus-visible:outline-none ${due.tone ?? ""}`}
                >
                  <IconCalendarEvent className="size-3.5 shrink-0" />
                  {due.label}
                </motion.button>
              )}
            </AnimatePresence>

            <RowActions
              label={task.title}
              onRename={() => setEditing(true)}
              onDelete={onDelete}
              className="end-10"
            />

            {/* Decorative, and transparent to clicks so the row button owns them. */}
            <motion.span
              aria-hidden
              className="text-muted-foreground/60 pointer-events-none absolute end-3 top-1/2 flex -translate-y-1/2"
              initial={false}
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={reduceMotion ? { duration: 0 } : SPRING}
            >
              <IconChevronDown className="size-4" strokeWidth={1.5} />
            </motion.span>
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
              label={labels.addSubtask}
              placeholder={labels.subtaskPlaceholder}
              onSubmit={onAddSubtask}
              className="ms-4 text-sm"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ block */

export function TaskChecklist({
  tasks: controlledTasks,
  defaultTasks = [],
  onTasksChange,
  openIds: controlledOpenIds,
  defaultOpenIds = [],
  onOpenIdsChange,
  mode = "multiple",
  collapseOnComplete = true,
  labels: labelOverrides,
  formatDue = defaultFormatDue,
  formatCompletedAt = defaultFormatCompletedAt,
  generateId = defaultGenerateId,
  onTaskComplete,
  onAllComplete,
  className,
  ...props
}: TaskChecklistProps) {
  const [tasks, setTasks] = useControllableState(
    controlledTasks,
    defaultTasks,
    onTasksChange,
  );
  const [openIds, setOpenIds] = useControllableState(
    controlledOpenIds,
    defaultOpenIds,
    onOpenIdsChange,
  );

  const [dayViewDate, setDayViewDate] = useState<number | null>(null);

  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelOverrides }),
    [labelOverrides],
  );

  const context = useMemo<ChecklistContextValue>(
    () => ({ labels, formatDue, formatCompletedAt }),
    [labels, formatDue, formatCompletedAt],
  );

  const doneCount = useMemo(() => tasks.filter(isTaskComplete).length, [tasks]);
  const allDone = tasks.length > 0 && doneCount === tasks.length;
  const burst = useBurst(allDone);

  const allCompleteRef = useRef(onAllComplete);
  allCompleteRef.current = onAllComplete;
  useEffect(() => {
    if (burst > 0) allCompleteRef.current?.();
  }, [burst]);

  const toggleOpen = (taskId: string) =>
    setOpenIds((current) => {
      if (current.includes(taskId)) {
        return current.filter((id) => id !== taskId);
      }
      return mode === "single" ? [taskId] : [...current, taskId];
    });

  const updateTask = (taskId: string, update: (task: Task) => Task) =>
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? update(task) : task)),
    );

  const addTask = (title: string) => {
    const id = generateId();
    setTasks((current) => [...current, { id, title, due: null, subtasks: [] }]);
    setOpenIds((current) => (mode === "single" ? [id] : [...current, id]));
  };

  const deleteTask = (taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setOpenIds((current) => current.filter((id) => id !== taskId));
  };

  const addSubtask = (taskId: string, title: string) =>
    updateTask(taskId, (task) => ({
      ...task,
      subtasks: [
        ...task.subtasks,
        { id: generateId(), title, completedAt: null },
      ],
    }));

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const next: Task = {
      ...task,
      subtasks: task.subtasks.map((subtask) =>
        subtask.id === subtaskId
          ? {
              ...subtask,
              completedAt: subtask.completedAt === null ? Date.now() : null,
            }
          : subtask,
      ),
    };

    setTasks((current) =>
      current.map((item) => (item.id === taskId ? next : item)),
    );

    if (isTaskComplete(next) && !isTaskComplete(task)) {
      onTaskComplete?.(next);
      // A finished task folds itself away, so the list visibly shortens.
      if (collapseOnComplete) {
        setOpenIds((current) => current.filter((id) => id !== taskId));
      }
    }
  };

  const summary = () => {
    if (tasks.length === 0) return labels.emptySummary;
    if (allDone) return labels.allDone;
    return labels.summary(doneCount, tasks.length);
  };

  return (
    <ChecklistContext.Provider value={context}>
      <Card className={`relative gap-0 py-0 ${className ?? ""}`} {...props}>
        <Celebration burst={burst} />

        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-xl">{labels.title}</CardTitle>
          <CardDescription>{summary()}</CardDescription>
        </CardHeader>

        <CardContent className="px-2 pb-2">
          <ul className="space-y-0.5">
            <AnimatePresence mode="popLayout" initial={false}>
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isOpen={openIds.includes(task.id)}
                  onOpenChange={() => toggleOpen(task.id)}
                  onRename={(title) =>
                    updateTask(task.id, (current) => ({ ...current, title }))
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
                  onOpenDay={setDayViewDate}
                />
              ))}
            </AnimatePresence>
          </ul>

          {tasks.length === 0 && (
            <p className="text-muted-foreground px-4 py-6 text-sm">
              {labels.empty}
            </p>
          )}

          <Composer
            label={labels.addTask}
            placeholder={labels.taskPlaceholder}
            onSubmit={addTask}
            className="ms-2"
          />
        </CardContent>
      </Card>

      <DayViewDrawer
        date={dayViewDate}
        onClose={() => setDayViewDate(null)}
        tasks={tasks}
        onToggleSubtask={toggleSubtask}
        onAddSubtask={addSubtask}
      />
    </ChecklistContext.Provider>
  );
}

export default TaskChecklist;
