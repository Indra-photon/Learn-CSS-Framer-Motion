"use client";

import React from "react";
import { motion, AnimatePresence, LayoutGroup, MotionConfig } from "motion/react";
import useMeasure from "react-use-measure";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";

const SPRING = { type: "spring", duration: 0.45, bounce: 0.05 } as const;
const BG = "#f0f0f4";

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function getCalendarCells(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export default function CalendarTaskCard() {
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const [view, setView] = React.useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [taskInput, setTaskInput] = React.useState("");
  const [tasks, setTasks] = React.useState<Record<string, string[]>>({});
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [measureRef, bounds] = useMeasure();

  const { year, month } = view;
  const cells = getCalendarCells(year, month);

  const prevMonth = () =>
    setView(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  const nextMonth = () =>
    setView(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );

  const handleAddTask = () => {
    if (!selectedDate || !taskInput.trim()) return;
    setTasks((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] ?? []), taskInput.trim()],
    }));
    setTaskInput("");
    setSelectedDate(null);
  };

  const handleClose = () => {
    setTaskInput("");
    setSelectedDate(null);
  };

  const parsedSelected = selectedDate
    ? (() => {
        const [sy, sm, sd] = selectedDate.split("-").map(Number);
        const dateObj = new Date(sy, sm - 1, sd);
        return {
          day: sd,
          month: MONTHS[sm - 1],
          weekday: WEEKDAYS[dateObj.getDay()],
        };
      })()
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <MotionConfig transition={SPRING}>
        <LayoutGroup id="calendar-tasks">
          <motion.div
            animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
            style={{ background: BG, borderRadius: 24, width: 380, overflow: "hidden" }}
          >
            <div ref={measureRef} style={{ padding: 20 }}>

              {/* Month header */}
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[17px] font-semibold text-gray-900">
                  {MONTHS[month]} {year}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={prevMonth}
                    className="flex size-8 items-center justify-center rounded-xl bg-white/70 hover:bg-white transition-colors"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={14} color="#6b7280" strokeWidth={2} />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="flex size-8 items-center justify-center rounded-xl bg-white/70 hover:bg-white transition-colors"
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} color="#6b7280" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Content — grid or task form */}
              <AnimatePresence mode="popLayout" initial={false}>
                {selectedDate === null ? (
                  /* ── Calendar grid ─────────────────────── */
                  <motion.div key="grid">
                    <div className="mb-2 grid grid-cols-7">
                      {DAY_LABELS.map((d) => (
                        <div
                          key={d}
                          className="flex items-center justify-center py-1 text-[12px] font-medium text-gray-400"
                        >
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {cells.map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;

                        const date = toDateStr(year, month, day);
                        const isToday = date === todayStr;
                        const dayTasks = tasks[date] ?? [];

                        return (
                          <motion.div
                            key={`${date}-collapsed`}
                            layoutId={`day-${date}`}
                            style={{
                              borderRadius: 12,
                              background: isToday ? "#ede9fe" : "white",
                            }}
                            className="aspect-square flex cursor-pointer flex-col items-center justify-center hover:scale-[0.97] active:scale-95 transition-transform"
                            onClick={() => setSelectedDate(date)}
                          >
                            <motion.span
                              layoutId={`day-label-${date}`}
                              className={`text-[14px] leading-none ${
                                isToday
                                  ? "font-bold text-violet-700"
                                  : "font-medium text-gray-800"
                              }`}
                            >
                              {day}
                            </motion.span>
                            {dayTasks.length > 0 && (
                              <div className="mt-1 flex gap-0.5">
                                {dayTasks.slice(0, 3).map((_, i) => (
                                  <div key={i} className="size-1 rounded-full bg-violet-400" />
                                ))}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  /* ── Task form ──────────────────────────── */
                  <motion.div
                    key={`${selectedDate}-expanded`}
                    layoutId={`day-${selectedDate}`}
                    style={{ borderRadius: 20, background: "white" }}
                  >
                    {/* inner clip so contents don't bleed during morph */}
                    <div className="overflow-hidden rounded-[20px]">
                      {/* Form header */}
                      <div className="flex items-start justify-between px-5 pt-5 pb-4">
                        <div className="flex flex-col gap-0.5">
                          <motion.span
                            layoutId={`day-label-${selectedDate}`}
                            className="text-[40px] font-bold leading-none text-gray-900 tabular-nums"
                          >
                            {parsedSelected?.day}
                          </motion.span>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.15 } }}
                            exit={{ opacity: 0, transition: { duration: 0.05 } }}
                            className="text-[13px] font-medium text-gray-400"
                          >
                            {parsedSelected?.weekday}, {parsedSelected?.month}
                          </motion.span>
                        </div>
                        <button
                          onClick={handleClose}
                          className="mt-1 flex size-8 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <HugeiconsIcon icon={Cancel01Icon} size={14} color="#6b7280" strokeWidth={2} />
                        </button>
                      </div>

                      {/* Divider */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1, transition: { delay: 0.15, duration: 0.2 } }}
                        exit={{ scaleX: 0, transition: { duration: 0.05 } }}
                        style={{ originX: 0 }}
                        className="mx-5 h-px bg-gray-100"
                      />

                      {/* Existing tasks */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.15 } }}
                        exit={{ opacity: 0, transition: { duration: 0.05 } }}
                        className="px-5 pt-3"
                      >
                        {(tasks[selectedDate] ?? []).map((task, i) => (
                          <div key={i} className="flex items-center gap-2 py-1.5">
                            <div className="size-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                            <span className="text-[14px] text-gray-600">{task}</span>
                          </div>
                        ))}
                      </motion.div>

                      {/* Input row */}
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.22, duration: 0.15 } }}
                        exit={{ opacity: 0, transition: { duration: 0.05 } }}
                        className="flex items-center gap-2 px-5 pb-5 pt-3"
                      >
                        <input
                          ref={inputRef}
                          autoFocus
                          type="text"
                          placeholder="Add a task..."
                          value={taskInput}
                          onChange={(e) => setTaskInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                          className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none border border-gray-100 focus:border-violet-200 focus:bg-white transition-colors"
                        />
                        <button
                          onClick={handleAddTask}
                          className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 hover:bg-violet-200 transition-colors"
                        >
                          <HugeiconsIcon icon={Tick01Icon} size={16} color="#7c3aed" strokeWidth={2} />
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </LayoutGroup>
      </MotionConfig>
    </div>
  );
}
