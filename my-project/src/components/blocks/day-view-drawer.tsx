"use client";

import React, { useMemo, useState } from "react";
import {
  IconArrowLeft,
  IconArrowUp,
  IconCalendarPlus,
  IconCheck,
} from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Drawer } from "vaul";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Subtask, Task } from "@/components/blocks/task-checklist";

const SPRING = { type: "spring", duration: 0.3, bounce: 0 } as const;

/** One timeline node: a subtask, plus the task it belongs to. */
interface DayItem {
  task: Task;
  subtask: Subtask;
}

export interface DayViewDrawerProps {
  /** The day being shown, as a timestamp. `null` keeps the drawer closed. */
  date: number | null;
  onClose: () => void;
  tasks: Task[];
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
}

const sameDay = (a: number, b: number) => {
  const left = new Date(a);
  const right = new Date(b);
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

const formatTime = (time: number) =>
  new Date(time).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

/* ------------------------------------------------------------------ phone */

/**
 * Hand-built device: a dark bezel and a home indicator, no status bar.
 * Concentric radii — the outer shell is the screen radius plus the bezel
 * width (32px + 12px = 44px), so the corners nest instead of pinching.
 */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[44px] bg-neutral-900 p-3 shadow-[0_2px_8px_oklch(0_0_0_/_0.2),0_24px_60px_-12px_oklch(0_0_0_/_0.45)] ring-1 ring-white/10">
      <div className="bg-card relative flex h-[640px] w-[320px] flex-col overflow-hidden rounded-[32px]">
        {children}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-neutral-900/25"
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- timeline */

function TimelineRow({
  item,
  index,
  isLast,
  isNext,
  onToggle,
  staggered,
}: {
  item: DayItem;
  index: number;
  isLast: boolean;
  isNext: boolean;
  onToggle: () => void;
  staggered: boolean;
}) {
  const done = item.subtask.completedAt !== null;

  return (
    <motion.li
      layout
      initial={staggered ? { opacity: 0, y: 12, filter: "blur(4px)" } : false}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={
        staggered ? { ...SPRING, delay: 0.12 + index * 0.05 } : SPRING
      }
      className="grid grid-cols-[52px_20px_1fr] items-start gap-x-3"
    >
      {/* Time column: real completion time, or the slot the work still owns. */}
      <span
        className={`pt-1 text-right text-xs tabular-nums ${
          done
            ? "text-foreground/70"
            : isNext
              ? "text-brand font-medium"
              : "text-muted-foreground/50"
        }`}
      >
        {done ? formatTime(item.subtask.completedAt!) : isNext ? "Next" : "—"}
      </span>

      {/* Node + connector. The connector below a done node is dashed brand. */}
      <span className="relative flex h-full justify-center pt-0.5">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={done}
          aria-label={item.subtask.title}
          className={`relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ease-out ${
            done
              ? "border-brand bg-brand"
              : "bg-card border-foreground/20 hover:border-brand"
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
                <IconCheck
                  className="text-brand-foreground size-3"
                  strokeWidth={3.5}
                />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {!isLast && (
          <span
            aria-hidden
            className={`absolute top-6 bottom-[-14px] left-1/2 w-0 -translate-x-1/2 border-l-2 ${
              done
                ? "border-brand border-dashed"
                : "border-foreground/10 border-solid"
            }`}
          />
        )}
      </span>

      <span className="min-w-0 pb-8">
        <button
          type="button"
          onClick={onToggle}
          className={`block w-full truncate text-start text-[15px] transition-colors duration-150 ${
            done
              ? "text-muted-foreground line-through"
              : "text-foreground hover:text-brand"
          }`}
        >
          {item.subtask.title}
        </button>
      </span>
    </motion.li>
  );
}

/* ----------------------------------------------------------------- screen */

function DayScreen({
  date,
  tasks,
  onClose,
  onToggleSubtask,
  onAddSubtask,
}: {
  date: number;
  tasks: Task[];
  onClose: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<string>("all");
  const [draft, setDraft] = useState("");

  const dayTasks = useMemo(
    () => tasks.filter((task) => task.due !== null && sameDay(task.due, date)),
    [tasks, date],
  );

  const items = useMemo(() => {
    const scoped =
      filter === "all"
        ? dayTasks
        : dayTasks.filter((task) => task.id === filter);

    return scoped
      .flatMap((task) => task.subtasks.map((subtask) => ({ task, subtask })))
      .sort((a, b) => {
        // Completed work sits in chronological order above what is still open.
        if (a.subtask.completedAt && b.subtask.completedAt) {
          return a.subtask.completedAt - b.subtask.completedAt;
        }
        if (a.subtask.completedAt) return -1;
        if (b.subtask.completedAt) return 1;
        return 0;
      });
  }, [dayTasks, filter]);

  const nextIndex = items.findIndex(
    (item) => item.subtask.completedAt === null,
  );
  const target =
    filter === "all" ? dayTasks[0] : dayTasks.find((t) => t.id === filter);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !target) return;
    onAddSubtask(target.id, trimmed);
    setDraft("");
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-28">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Back to the task list"
          className="-ms-2 mb-4"
        >
          <IconArrowLeft className="size-5" />
        </Button>

        <p className="text-muted-foreground text-xs">
          {new Date(date).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <h2 className="text-foreground mt-1 text-[28px] leading-tight font-bold tracking-tight">
          Tasks &amp; Events
        </h2>

        {/* Filter chips. One shared highlight slides between them. */}
        <div className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "all", title: "All" }, ...dayTasks].map((chip) => {
            const active = filter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                className={`relative shrink-0 rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-150 ${
                  active
                    ? "text-brand-foreground"
                    : "text-muted-foreground hover:text-foreground bg-muted"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="chip-highlight"
                    className="bg-brand absolute inset-0 rounded-full"
                    transition={reduceMotion ? { duration: 0 } : SPRING}
                  />
                )}
                <span className="relative">{chip.title}</span>
              </button>
            );
          })}
        </div>

        <ul className="mt-7">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item, index) => (
              <TimelineRow
                key={item.subtask.id}
                item={item}
                index={index}
                isLast={index === items.length - 1}
                isNext={index === nextIndex}
                staggered={!reduceMotion}
                onToggle={() => onToggleSubtask(item.task.id, item.subtask.id)}
              />
            ))}
          </AnimatePresence>
        </ul>

        {items.length === 0 && (
          <p className="text-muted-foreground mt-8 text-sm">
            Nothing scheduled for this day.
          </p>
        )}
      </div>

      {/* Floating composer: the reference's recorder bar, doing real work. */}
      <form
        onSubmit={submit}
        className="bg-card absolute inset-x-3 bottom-6 flex items-center gap-2 rounded-full p-1.5 ps-4 shadow-[0_1px_2px_oklch(0_0_0_/_0.06),0_12px_28px_-8px_oklch(0_0_0_/_0.25)] ring-1 ring-black/5"
      >
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={target ? `Add to ${target.title}` : "Nothing to add to"}
          disabled={!target}
          className="h-8 flex-1 border-transparent bg-transparent px-0 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Pick a date"
          className="text-muted-foreground rounded-full"
        >
          <IconCalendarPlus className="size-4" />
        </Button>
        <Button
          type="submit"
          size="icon-sm"
          disabled={!draft.trim() || !target}
          aria-label="Add item"
          className="bg-brand hover:bg-brand/90 text-brand-foreground rounded-full"
        >
          <IconArrowUp className="size-4" strokeWidth={2.5} />
        </Button>
      </form>
    </>
  );
}

/**
 * The phone and its screen, without the drawer around it. Exported so the
 * screen can be shown on its own page, not only as a slide-in panel.
 */
export function DayView({
  date,
  tasks,
  onClose,
  onToggleSubtask,
  onAddSubtask,
}: {
  date: number;
  tasks: Task[];
  onClose: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
}) {
  return (
    <PhoneFrame>
      <DayScreen
        date={date}
        tasks={tasks}
        onClose={onClose}
        onToggleSubtask={onToggleSubtask}
        onAddSubtask={onAddSubtask}
      />
    </PhoneFrame>
  );
}

/* ----------------------------------------------------------------- drawer */

export function DayViewDrawer({
  date,
  onClose,
  tasks,
  onToggleSubtask,
  onAddSubtask,
}: DayViewDrawerProps) {
  return (
    <Drawer.Root
      direction="right"
      open={date !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex items-center outline-none"
        >
          <Drawer.Title className="sr-only">Day view</Drawer.Title>

          <div className="p-4">
            {date !== null && (
              <DayView
                date={date}
                tasks={tasks}
                onClose={onClose}
                onToggleSubtask={onToggleSubtask}
                onAddSubtask={onAddSubtask}
              />
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default DayViewDrawer;
