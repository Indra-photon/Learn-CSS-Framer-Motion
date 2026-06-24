"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import useMeasure from "react-use-measure";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Loading01Icon,
  Tick01Icon,
  ConnectIcon,
  LockIcon,
  ZapIcon,
} from "@hugeicons/core-free-icons";
import "./DatabaseMigrationWizard.css";

// ─── Types ──────────────────────────────────────────────────────────────────

type DBEngine = "postgresql" | "mysql" | "mongodb" | "sqlite";
type ConflictStrategy = "skip" | "overwrite" | "abort";
type TableStatus = "pending" | "migrating" | "done";

interface DBConfig {
  engine: DBEngine;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
}

type ConnStatus = "idle" | "connecting" | "connected" | "error";

// ─── Constants ──────────────────────────────────────────────────────────────

const STEPS = ["Source", "Target", "Schema", "Settings", "Execute"];

const DB_ENGINES: { id: DBEngine; label: string; defaultPort: string }[] = [
  { id: "postgresql", label: "PostgreSQL", defaultPort: "5432" },
  { id: "mysql", label: "MySQL", defaultPort: "3306" },
  { id: "mongodb", label: "MongoDB", defaultPort: "27017" },
  { id: "sqlite", label: "SQLite", defaultPort: "" },
];

const MOCK_TABLES = [
  { name: "users", rows: 48291 },
  { name: "orders", rows: 124856 },
  { name: "products", rows: 3847 },
  { name: "sessions", rows: 891234 },
  { name: "audit_logs", rows: 67412 },
  { name: "payments", rows: 38901 },
];

const CONFLICT_OPTIONS: {
  id: ConflictStrategy;
  label: string;
  desc: string;
}[] = [
  { id: "skip", label: "Skip", desc: "Keep existing rows" },
  { id: "overwrite", label: "Overwrite", desc: "Replace on conflict" },
  { id: "abort", label: "Abort", desc: "Stop on first conflict" },
];

const DEFAULT_SOURCE: DBConfig = {
  engine: "postgresql",
  host: "db.prod.example.com",
  port: "5432",
  database: "production_db",
  username: "admin",
  password: "",
};

const DEFAULT_TARGET: DBConfig = {
  engine: "mysql",
  host: "db.staging.example.com",
  port: "3306",
  database: "staging_db",
  username: "migrate_user",
  password: "",
};

// ─── Animation variants ─────────────────────────────────────────────────────

const slideVariants = {
  initial: (dir: number) => ({ x: `${110 * dir}%`, opacity: 0 }),
  active: { x: "0%", opacity: 1 },
  exit: (dir: number) => ({ x: `${-110 * dir}%`, opacity: 0 }),
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const fadeBlurUp = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, duration: 0.4, bounce: 0 },
  },
};

const ICON_ANIM = {
  initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  transition: { type: "spring" as const, duration: 0.3, bounce: 0 },
};

// ─── CSS animation helpers ──────────────────────────────────────────────────

function swapText(el: HTMLElement, newText: string) {
  el.classList.add("is-exit");
  setTimeout(() => {
    el.textContent = newText;
    el.classList.remove("is-exit");
    el.classList.add("is-enter-start");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => el.classList.remove("is-enter-start")),
    );
  }, 150);
}

function shakeEl(el: HTMLElement) {
  el.classList.add("is-shaking");
  el.addEventListener("animationend", () => el.classList.remove("is-shaking"), {
    once: true,
  });
}

// ─── AnimatedNumber — CSS t-digit-group ─────────────────────────────────────

function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const groupRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (value === prevRef.current) return;
    prevRef.current = value;
    const el = groupRef.current;
    if (!el) return;
    el.classList.remove("is-animating");
    void el.offsetHeight;
    el.classList.add("is-animating");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => el.classList.remove("is-animating"),
      700,
    );
  }, [value]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const str = value.toLocaleString();
  return (
    <span
      ref={groupRef}
      className={`t-digit-group tabular-nums${className ? ` ${className}` : ""}`}
    >
      {str.split("").map((ch, i) => (
        <span key={i} className="t-digit" data-stagger={String(Math.min(i, 2))}>
          {ch}
        </span>
      ))}
    </span>
  );
}

// ─── ConnectionStep ──────────────────────────────────────────────────────────

function ConnectionStep({
  label,
  config,
  setConfig,
  status,
  onTest,
}: {
  label: string;
  config: DBConfig;
  setConfig: (c: DBConfig) => void;
  status: ConnStatus;
  onTest: () => void;
}) {
  const statusTextRef = useRef<HTMLSpanElement>(null);
  const hostWrapRef = useRef<HTMLDivElement>(null);
  const hostInputRef = useRef<HTMLInputElement>(null);
  const prevStatus = useRef<ConnStatus>("idle");

  useEffect(() => {
    if (status === prevStatus.current) return;
    prevStatus.current = status;
    const el = statusTextRef.current;
    if (!el) return;
    const map: Record<ConnStatus, string> = {
      idle: "Idle",
      connecting: "Connecting…",
      connected: "Connected ✓",
      error: "Failed — check credentials",
    };
    swapText(el, map[status]);
    if (status === "error") {
      if (hostInputRef.current) shakeEl(hostInputRef.current);
      hostWrapRef.current?.classList.add("is-error");
      setTimeout(() => hostWrapRef.current?.classList.remove("is-error"), 3200);
    }
  }, [status]);

  const inputCls = [
    "t-input w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5",
    "text-sm text-stone-800 placeholder-stone-400 outline-none",
    "transition-[border-color,background-color,box-shadow] duration-150",
    "focus:border-stone-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(28,25,23,0.06)]",
  ].join(" ");

  const statusColor =
    status === "connected"
      ? "text-emerald-600"
      : status === "error"
        ? "text-red-500"
        : status === "connecting"
          ? "text-amber-500"
          : "text-stone-500";

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Heading */}
      <motion.div variants={fadeBlurUp}>
        <h2 className="text-[15px] font-semibold text-balance text-stone-900">
          {label} Database
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Configure your {label.toLowerCase()} connection details.
        </p>
      </motion.div>

      {/* Engine pills */}
      <motion.div variants={fadeBlurUp} className="flex flex-wrap gap-1.5">
        {DB_ENGINES.map((eng) => (
          <button
            key={eng.id}
            onClick={() =>
              setConfig({ ...config, engine: eng.id, port: eng.defaultPort })
            }
            className={[
              "rounded-xl border px-3 py-1.5 text-xs font-medium",
              "transition-[background-color,border-color,color] duration-150",
              config.engine === eng.id
                ? "border-stone-400 bg-stone-900 text-stone-50"
                : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-white hover:text-stone-700",
            ].join(" ")}
          >
            {eng.label}
          </button>
        ))}
      </motion.div>

      {/* Fields */}
      <motion.div variants={fadeBlurUp} className="space-y-2">
        {/* Host + port row with error wrap */}
        <div ref={hostWrapRef} className="t-input-wrap space-y-1">
          <div className="grid grid-cols-[1fr_76px] gap-2">
            <input
              ref={hostInputRef}
              type="text"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="Host / IP address"
              className={inputCls}
            />
            <input
              type="text"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: e.target.value })}
              placeholder="Port"
              className={inputCls}
            />
          </div>
          <p className="t-error-msg pl-0.5 text-xs text-red-500">
            Cannot reach host. Check address and firewall settings.
          </p>
        </div>

        <input
          type="text"
          value={config.database}
          onChange={(e) => setConfig({ ...config, database: e.target.value })}
          placeholder="Database name"
          className={inputCls}
        />
        <input
          type="text"
          value={config.username}
          onChange={(e) => setConfig({ ...config, username: e.target.value })}
          placeholder="Username"
          className={inputCls}
        />
        <div className="relative">
          <input
            type="password"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            placeholder="Password"
            className={`${inputCls} pr-9`}
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-stone-400">
            <HugeiconsIcon
              icon={LockIcon}
              size={14}
              strokeWidth={2}
              color="currentColor"
            />
          </span>
        </div>
      </motion.div>

      {/* Test connection bar */}
      <motion.div
        variants={fadeBlurUp}
        className="flex items-center justify-between"
      >
        <span className="text-xs text-stone-500">
          Status:{" "}
          <span
            ref={statusTextRef}
            className={`t-text-swap font-medium ${statusColor}`}
          >
            Idle
          </span>
        </span>
        <button
          onClick={onTest}
          disabled={status === "connecting"}
          className={[
            "flex h-8 items-center gap-1.5 rounded-xl border px-3",
            "border-stone-200 bg-white text-xs font-medium text-stone-600",
            "transition-[background-color,border-color,color] duration-150",
            "hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === "connecting" ? (
              <motion.span
                key="spin"
                {...ICON_ANIM}
                className="flex items-center"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 0.85,
                  }}
                  className="flex items-center"
                >
                  <HugeiconsIcon
                    icon={Loading01Icon}
                    size={12}
                    strokeWidth={2.5}
                    color="currentColor"
                  />
                </motion.span>
              </motion.span>
            ) : (
              <motion.span
                key="icon"
                {...ICON_ANIM}
                className="flex items-center"
              >
                <HugeiconsIcon
                  icon={ConnectIcon}
                  size={12}
                  strokeWidth={2.5}
                  color="currentColor"
                />
              </motion.span>
            )}
          </AnimatePresence>
          Test Connection
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── SchemaStep ──────────────────────────────────────────────────────────────

function SchemaStep({
  selectedTables,
  toggleTable,
  conflict,
  setConflict,
}: {
  selectedTables: Set<string>;
  toggleTable: (name: string) => void;
  conflict: ConflictStrategy;
  setConflict: (c: ConflictStrategy) => void;
}) {
  const [digitsReady, setDigitsReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDigitsReady(true), 120);
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={fadeBlurUp}>
        <h2 className="text-[15px] font-semibold text-balance text-stone-900">
          Schema Mapping
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Select tables to migrate and set conflict resolution.
        </p>
      </motion.div>

      {/* Table list */}
      <motion.div variants={fadeBlurUp} className="space-y-1.5">
        {MOCK_TABLES.map((t) => {
          const checked = selectedTables.has(t.name);
          return (
            <button
              key={t.name}
              onClick={() => toggleTable(t.name)}
              className={[
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left",
                "transition-[background-color,border-color] duration-150",
                checked
                  ? "border-stone-300 bg-stone-50"
                  : "border-stone-100 bg-white hover:border-stone-200",
              ].join(" ")}
            >
              {/* Checkbox */}
              <motion.div
                animate={{
                  backgroundColor: checked ? "#1c1917" : "#fff",
                  borderColor: checked ? "#1c1917" : "#d6d3d1",
                }}
                transition={{ type: "spring", duration: 0.2, bounce: 0 }}
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
              >
                <AnimatePresence initial={false}>
                  {checked && (
                    <motion.span
                      key="chk"
                      {...ICON_ANIM}
                      className="flex items-center"
                    >
                      <HugeiconsIcon
                        icon={Tick01Icon}
                        size={9}
                        strokeWidth={3}
                        color="white"
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              <span className="flex-1 font-mono text-xs font-medium text-stone-700">
                {t.name}
              </span>

              {/* Animated row count */}
              <span className="text-xs text-stone-500">
                {digitsReady ? <AnimatedNumber value={t.rows} /> : "—"}{" "}
                <span className="text-stone-400">rows</span>
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Conflict strategy */}
      <motion.div variants={fadeBlurUp} className="space-y-2">
        <p className="text-xs font-medium text-stone-600">On conflict</p>
        <div className="flex gap-1.5">
          {CONFLICT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setConflict(opt.id)}
              className={[
                "flex flex-1 flex-col rounded-xl border px-2.5 py-2 text-left",
                "transition-[background-color,border-color] duration-150",
                conflict === opt.id
                  ? "border-stone-400 bg-stone-900 text-stone-50"
                  : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-white",
              ].join(" ")}
            >
              <span className="text-xs font-semibold">{opt.label}</span>
              <span
                className={`text-[10px] leading-snug ${conflict === opt.id ? "text-stone-400" : "text-stone-400"}`}
              >
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── SettingsStep ────────────────────────────────────────────────────────────

function SettingsStep({
  batchSize,
  setBatchSize,
  parallel,
  setParallel,
  dryRun,
  setDryRun,
  totalRows,
}: {
  batchSize: number;
  setBatchSize: (v: number) => void;
  parallel: number;
  setParallel: (v: number) => void;
  dryRun: boolean;
  setDryRun: (v: boolean) => void;
  totalRows: number;
}) {
  const estimatedBatches = Math.ceil(totalRows / batchSize);
  const estimatedSecs = Math.round((estimatedBatches / parallel) * 0.04);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={fadeBlurUp}>
        <h2 className="text-[15px] font-semibold text-balance text-stone-900">
          Migration Settings
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Tune performance and safety options.
        </p>
      </motion.div>

      {/* Batch size */}
      <motion.div variants={fadeBlurUp} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-stone-600">
            Batch size
          </label>
          <span className="text-xs font-semibold text-stone-800 tabular-nums">
            <AnimatedNumber value={batchSize} /> rows
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={10000}
          step={100}
          value={batchSize}
          onChange={(e) => setBatchSize(Number(e.target.value))}
          className="w-full accent-stone-800"
        />
        <div className="flex justify-between text-[10px] text-stone-500">
          <span>100</span>
          <span>10 000</span>
        </div>
      </motion.div>

      {/* Parallel connections */}
      <motion.div variants={fadeBlurUp} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-stone-600">
            Parallel connections
          </label>
          <span className="text-xs font-semibold text-stone-800 tabular-nums">
            <AnimatedNumber value={parallel} />
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={8}
          step={1}
          value={parallel}
          onChange={(e) => setParallel(Number(e.target.value))}
          className="w-full accent-stone-800"
        />
        <div className="flex justify-between text-[10px] text-stone-500">
          <span>1</span>
          <span>8</span>
        </div>
      </motion.div>

      {/* Dry run toggle */}
      <motion.div
        variants={fadeBlurUp}
        className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-4 py-3"
      >
        <div>
          <p className="text-xs font-medium text-stone-700">Dry run</p>
          <p className="text-[11px] text-stone-500">
            Validate without writing data
          </p>
        </div>
        <button
          onClick={() => setDryRun(!dryRun)}
          className={[
            "relative h-5 w-9 rounded-full transition-colors duration-200",
            dryRun ? "bg-stone-900" : "bg-stone-200",
          ].join(" ")}
        >
          <motion.span
            animate={{ x: dryRun ? 16 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
          />
        </button>
      </motion.div>

      {/* Estimates */}
      <motion.div
        variants={fadeBlurUp}
        className="rounded-xl border border-stone-100 bg-stone-50 p-4"
      >
        <p className="text-[11px] font-semibold tracking-widest text-stone-500 uppercase">
          Estimates
        </p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Total batches</span>
            <span className="text-xs font-semibold text-stone-700 tabular-nums">
              <AnimatedNumber value={estimatedBatches} />
            </span>
          </div>
          <div className="h-px bg-stone-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Estimated time</span>
            <span className="text-xs font-semibold text-stone-700 tabular-nums">
              ~<AnimatedNumber value={estimatedSecs} />s
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── ExecuteStep ─────────────────────────────────────────────────────────────

function ExecuteStep({
  source,
  target,
  selectedTables,
  totalRows,
  dryRun,
}: {
  source: DBConfig;
  target: DBConfig;
  selectedTables: Set<string>;
  totalRows: number;
  dryRun: boolean;
}) {
  const tables = MOCK_TABLES.filter((t) => selectedTables.has(t.name));
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [tableStatuses, setTableStatuses] = useState<
    Record<string, TableStatus>
  >(Object.fromEntries(tables.map((t) => [t.name, "pending"])));
  const [recordsMigrated, setRecordsMigrated] = useState(0);
  const activeTextRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const start = useCallback(() => {
    if (started) return;
    setStarted(true);

    let migrated = 0;
    let tableIdx = 0;

    const runTable = () => {
      if (tableIdx >= tables.length) {
        setDone(true);
        return;
      }
      const table = tables[tableIdx];
      setTableStatuses((prev) => ({ ...prev, [table.name]: "migrating" }));
      if (activeTextRef.current) swapText(activeTextRef.current, table.name);

      const tickMs = 420;
      const numTicks = 12;
      const tickRows = Math.ceil(table.rows / numTicks);
      let rowsLeft = table.rows;

      const tick = () => {
        const chunk = Math.min(tickRows, rowsLeft);
        rowsLeft -= chunk;
        migrated += chunk;
        setRecordsMigrated(migrated);

        if (rowsLeft > 0) {
          timerRef.current = setTimeout(tick, tickMs);
        } else {
          setTableStatuses((prev) => ({ ...prev, [table.name]: "done" }));
          tableIdx++;
          timerRef.current = setTimeout(runTable, 300);
        }
      };
      timerRef.current = setTimeout(tick, tickMs);
    };

    runTable();
  }, [started, tables]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={fadeBlurUp}>
        <h2 className="text-[15px] font-semibold text-balance text-stone-900">
          {done ? "Migration Complete" : "Execute Migration"}
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          {done
            ? "All selected tables have been migrated successfully."
            : dryRun
              ? "Dry run — no data will be written."
              : "Migrating data from source to target."}
        </p>
      </motion.div>

      {/* Summary card */}
      {!started && (
        <motion.div
          variants={fadeBlurUp}
          className="rounded-xl border border-stone-100 bg-stone-50 p-4"
        >
          <p className="text-[11px] font-semibold tracking-widest text-stone-500 uppercase">
            Summary
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-stone-500">Source</span>
              <span className="font-mono text-xs font-medium text-stone-700">
                {source.engine} · {source.database}
              </span>
            </div>
            <div className="h-px bg-stone-100" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-stone-500">Target</span>
              <span className="font-mono text-xs font-medium text-stone-700">
                {target.engine} · {target.database}
              </span>
            </div>
            <div className="h-px bg-stone-100" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-stone-500">Tables</span>
              <span className="text-xs font-medium text-stone-700 tabular-nums">
                {tables.length}
              </span>
            </div>
            <div className="h-px bg-stone-100" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-stone-500">Total rows</span>
              <span className="text-xs font-medium text-stone-700 tabular-nums">
                {totalRows.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress — shown after start */}
      {started && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0 }}
          className="space-y-3"
        >
          {/* Record counter */}
          <div className="flex items-baseline justify-between rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
            <span className="text-xs text-stone-500">Records migrated</span>
            <span className="text-sm font-bold text-stone-800">
              <AnimatedNumber value={recordsMigrated} />
              <span className="ml-1 text-xs font-normal text-stone-500">
                / {totalRows.toLocaleString()}
              </span>
            </span>
          </div>

          {/* Active table text swap */}
          {!done && (
            <div className="flex items-center gap-2 px-0.5">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  ease: "linear",
                  duration: 0.85,
                }}
                className="flex shrink-0 items-center text-stone-500"
              >
                <HugeiconsIcon
                  icon={Loading01Icon}
                  size={12}
                  strokeWidth={2.5}
                  color="currentColor"
                />
              </motion.span>
              <span className="text-xs text-stone-500">
                Migrating{" "}
                <span
                  ref={activeTextRef}
                  className="t-text-swap font-mono font-medium text-stone-700"
                >
                  —
                </span>
              </span>
            </div>
          )}

          {/* Per-table status list */}
          <div className="space-y-1">
            {tables.map((t) => {
              const st = tableStatuses[t.name];
              return (
                <div
                  key={t.name}
                  className="flex items-center gap-3 rounded-xl border border-stone-100 bg-white px-3 py-2"
                >
                  {/* t-icon-swap: pending(a) → done(b) */}
                  <span
                    className="t-icon-swap shrink-0"
                    data-state={st === "done" ? "b" : "a"}
                  >
                    <span
                      className="t-icon flex items-center text-stone-300"
                      data-icon="a"
                    >
                      {st === "migrating" ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 0.85,
                          }}
                          className="flex items-center text-amber-400"
                        >
                          <HugeiconsIcon
                            icon={Loading01Icon}
                            size={13}
                            strokeWidth={2.5}
                            color="currentColor"
                          />
                        </motion.span>
                      ) : (
                        <span className="h-3 w-3 rounded-full border-2 border-stone-200" />
                      )}
                    </span>
                    <span
                      className="t-icon flex items-center text-emerald-500"
                      data-icon="b"
                    >
                      <HugeiconsIcon
                        icon={Tick01Icon}
                        size={13}
                        strokeWidth={2.5}
                        color="currentColor"
                      />
                    </span>
                  </span>

                  <span
                    className={[
                      "flex-1 font-mono text-xs",
                      st === "done"
                        ? "text-stone-500 line-through"
                        : st === "migrating"
                          ? "font-semibold text-stone-800"
                          : "text-stone-500",
                    ].join(" ")}
                  >
                    {t.name}
                  </span>

                  <span className="text-[10px] text-stone-400 tabular-nums">
                    {t.rows.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Success check */}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0 }}
          className="flex flex-col items-center gap-3 py-2"
        >
          <span
            className="t-success-check"
            data-state="in"
            style={{ width: 40, height: 40 }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="#f0fdf4"
                stroke="#bbf7d0"
                strokeWidth="2"
              />
              <path
                d="M12 21l6 6 10-12"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="text-xs font-medium text-emerald-600">
            All tables migrated successfully
          </p>
        </motion.div>
      )}

      {/* Start button */}
      {!started && (
        <motion.div variants={fadeBlurUp}>
          <button
            onClick={start}
            className={[
              "flex h-9 w-full items-center justify-center gap-2 rounded-xl",
              "bg-stone-900 text-sm font-semibold text-stone-50",
              "transition-[background-color] duration-150 hover:bg-stone-800",
              "active:scale-[0.96]",
            ].join(" ")}
          >
            <HugeiconsIcon
              icon={ZapIcon}
              size={13}
              strokeWidth={2.5}
              color="currentColor"
            />
            {dryRun ? "Start Dry Run" : "Start Migration"}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ref, bounds] = useMeasure();

  // Step 1 & 2
  const [source, setSource] = useState<DBConfig>(DEFAULT_SOURCE);
  const [target, setTarget] = useState<DBConfig>(DEFAULT_TARGET);
  const [sourceStatus, setSourceStatus] = useState<ConnStatus>("idle");
  const [targetStatus, setTargetStatus] = useState<ConnStatus>("idle");

  // Step 3
  const [selectedTables, setSelectedTables] = useState<Set<string>>(
    new Set(MOCK_TABLES.map((t) => t.name)),
  );
  const [conflict, setConflict] = useState<ConflictStrategy>("skip");

  // Step 4
  const [batchSize, setBatchSize] = useState(1000);
  const [parallel, setParallel] = useState(2);
  const [dryRun, setDryRun] = useState(false);

  const totalRows = useMemo(
    () =>
      MOCK_TABLES.filter((t) => selectedTables.has(t.name)).reduce(
        (s, t) => s + t.rows,
        0,
      ),
    [selectedTables],
  );

  const toggleTable = useCallback((name: string) => {
    setSelectedTables((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }, []);

  const testConn = useCallback(async (isSource: boolean) => {
    const setStatus = isSource ? setSourceStatus : setTargetStatus;
    setStatus("connecting");
    await new Promise((r) => setTimeout(r, 1600));
    // Always succeed in this mock — toggle to "error" first time for demo feel
    setStatus("connected");
  }, []);

  const canProceed = useMemo(() => {
    if (currentStep === 0) return sourceStatus === "connected";
    if (currentStep === 1) return targetStatus === "connected";
    if (currentStep === 2) return selectedTables.size > 0;
    return true;
  }, [currentStep, sourceStatus, targetStatus, selectedTables]);

  const goNext = () => {
    setDirection(1);
    setCurrentStep((p) => p + 1);
  };
  const goBack = () => {
    setDirection(-1);
    setCurrentStep((p) => p - 1);
  };

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <ConnectionStep
            label="Source"
            config={source}
            setConfig={setSource}
            status={sourceStatus}
            onTest={() => testConn(true)}
          />
        );
      case 1:
        return (
          <ConnectionStep
            label="Target"
            config={target}
            setConfig={setTarget}
            status={targetStatus}
            onTest={() => testConn(false)}
          />
        );
      case 2:
        return (
          <SchemaStep
            selectedTables={selectedTables}
            toggleTable={toggleTable}
            conflict={conflict}
            setConflict={setConflict}
          />
        );
      case 3:
        return (
          <SettingsStep
            batchSize={batchSize}
            setBatchSize={setBatchSize}
            parallel={parallel}
            setParallel={setParallel}
            dryRun={dryRun}
            setDryRun={setDryRun}
            totalRows={totalRows}
          />
        );
      case 4:
        return (
          <ExecuteStep
            source={source}
            target={target}
            selectedTables={selectedTables}
            totalRows={totalRows}
            dryRun={dryRun}
          />
        );
    }
  }, [
    currentStep,
    source,
    target,
    sourceStatus,
    targetStatus,
    selectedTables,
    conflict,
    batchSize,
    parallel,
    dryRun,
    totalRows,
    toggleTable,
    testConn,
  ]);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-stone-100 p-4 antialiased">
      <MotionConfig transition={{ duration: 0.5, type: "spring", bounce: 0 }}>
        {/*
         * Concentric border radius:
         *   Outer rounded-3xl (24px) + p-2 (8px) → inner rounded-2xl (16px) ✓
         *   Footer p-4 (16px) → buttons rounded-xl (12px) ✓
         */}
        <div className="w-full max-w-[460px] overflow-hidden rounded-3xl bg-stone-200/60 p-2 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.06),0px_8px_20px_-4px_rgba(0,0,0,0.08)]">
          <motion.div
            animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
            className="overflow-hidden rounded-2xl bg-white"
          >
            <div ref={ref}>
              {/* ── Step progress bar ─────────────────────────────────────── */}
              {/* <div className="px-6 pt-6">
                <div className="flex items-center gap-1">
                  {STEPS.map((label, i) => {
                    const isDone = i < currentStep;
                    const isActive = i === currentStep;
                    return (
                      <div key={i} className="flex items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <motion.div
                            animate={{
                              backgroundColor:
                                isDone || isActive ? "#1c1917" : "#e7e5e4",
                            }}
                            transition={{ duration: 0.18 }}
                            className="flex size-[18px] items-center justify-center rounded-md"
                          >
                            <AnimatePresence initial={false} mode="popLayout">
                              {isDone ? (
                                <motion.span
                                  key="chk"
                                  {...ICON_ANIM}
                                  className="flex items-center justify-center"
                                >
                                  <HugeiconsIcon
                                    icon={Tick01Icon}
                                    size={10}
                                    strokeWidth={3}
                                    color="white"
                                  />
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="num"
                                  {...ICON_ANIM}
                                  className={`text-[10px] leading-none font-bold ${isActive ? "text-white" : "text-stone-400"}`}
                                >
                                  {i + 1}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          <span
                            className={[
                              "text-[11px] font-medium transition-colors duration-150",
                              isActive
                                ? "text-stone-800"
                                : isDone
                                  ? "text-stone-600"
                                  : "text-stone-500",
                            ].join(" ")}
                          >
                            {label}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className="relative h-px w-5 overflow-hidden rounded-full bg-stone-200">
                            <motion.div
                              animate={{ scaleX: isDone ? 1 : 0 }}
                              transition={{
                                type: "spring",
                                duration: 0.4,
                                bounce: 0,
                              }}
                              style={{ originX: 0 }}
                              className="absolute inset-0 bg-stone-600"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div> */}

              {/* ── Step content ──────────────────────────────────────────── */}
              <div className="relative overflow-hidden p-6">
                <AnimatePresence
                  mode="popLayout"
                  initial={false}
                  custom={direction}
                >
                  <motion.div
                    key={currentStep}
                    variants={slideVariants}
                    initial="initial"
                    animate="active"
                    exit="exit"
                    custom={direction}
                  >
                    {stepContent}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── Footer ────────────────────────────────────────────────── */}
              <div className="flex items-center justify-between rounded-b-2xl bg-stone-50 px-4 py-4">
                <motion.button
                  onClick={goBack}
                  disabled={currentStep === 0}
                  whileHover={{ scale: currentStep === 0 ? 1 : 1.02 }}
                  whileTap={{ scale: currentStep === 0 ? 1 : 0.96 }}
                  className={[
                    "flex h-9 items-center gap-1.5 rounded-xl px-4",
                    "border border-stone-200 bg-white text-sm font-medium text-stone-500",
                    "transition-[background-color,border-color,color] duration-150",
                    "hover:border-stone-300 hover:text-stone-800",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                  ].join(" ")}
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={13}
                    strokeWidth={2.5}
                    color="currentColor"
                  />
                  Back
                </motion.button>

                {/* Hide Continue/Submit on execute step */}
                {currentStep < 4 && (
                  <motion.button
                    onClick={goNext}
                    disabled={!canProceed}
                    whileHover={{ scale: canProceed ? 1.02 : 1 }}
                    whileTap={{ scale: canProceed ? 0.96 : 1 }}
                    className={[
                      "flex h-9 items-center gap-1.5 rounded-xl pr-3.5 pl-4",
                      "bg-stone-900 text-sm font-semibold text-stone-50",
                      "transition-[background-color,opacity] duration-150 hover:bg-stone-800",
                      "disabled:cursor-not-allowed disabled:opacity-40",
                    ].join(" ")}
                  >
                    Continue
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={13}
                      strokeWidth={2.5}
                      color="currentColor"
                    />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </MotionConfig>
    </div>
  );
}
