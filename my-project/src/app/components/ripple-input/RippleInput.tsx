"use client";

import { useEffect, useRef, useState } from "react";
import { RippleBorder, RippleBorderHandle } from "./RippleBorder";
import { shakeEl } from "./shakeEl";
import "./ripple-input.css";

export type FieldState = "idle" | "typing" | "pending" | "valid" | "invalid";
export type ValidateResult = "valid" | "invalid" | "pending" | undefined;

interface RippleInputProps {
  type: "email" | "password";
  value: string;
  onChange: (value: string) => void;
  validate?: (value: string) => ValidateResult | Promise<ValidateResult>;
  label: string;
  errorMessage?: string;
  successMessage?: string;
  className?: string;
}

const TYPING_NUDGE = 3;
const VALIDATE_DEBOUNCE_MS = 400;

export function RippleInput({
  type,
  value,
  onChange,
  validate,
  label,
  errorMessage = "This doesn't look right.",
  successMessage = "Looks good.",
  className = "",
}: RippleInputProps) {
  const [fieldState, setFieldState] = useState<FieldState>("idle");
  const lineRef = useRef<RippleBorderHandle>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);
  const prevLength = useRef(0);

  const applyState = (state: FieldState) => {
    setFieldState(state);
    const line = lineRef.current;
    if (!line) return;

    if (state === "pending") {
      line.setColorState("pending");
      line.startIdle();
      return;
    }
    line.stopIdle();

    if (state === "valid") {
      line.setColorState("success");
      line.pulse({ from: 0, to: 1, magnitude: 9 });
    } else if (state === "invalid") {
      line.setColorState("destructive");
      line.pulseDouble({ from: 0.5, to: 0.5, magnitude: 10 });
      if (wrapRef.current) shakeEl(wrapRef.current);
    } else if (state === "typing") {
      line.setColorState("primary");
    } else {
      line.setColorState("idle");
    }
  };

  const runValidate = (next: string) => {
    if (!validate) return;
    const id = ++requestId.current;
    const result = validate(next);
    const applyResult = (r: ValidateResult) => {
      if (id !== requestId.current) return;
      if (r === "valid" || r === "invalid" || r === "pending") applyState(r);
      else applyState("typing");
    };
    if (result instanceof Promise) {
      applyState("pending");
      result.then(applyResult);
    } else {
      applyResult(result);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    onChange(next);
    applyState("typing");
    lineRef.current?.nudge(next.length >= prevLength.current ? TYPING_NUDGE : -TYPING_NUDGE);
    prevLength.current = next.length;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runValidate(next), VALIDATE_DEBOUNCE_MS);
  };

  const handleBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value) runValidate(value);
    else applyState("idle");
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      <div ref={wrapRef} className="ri-field relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => fieldState === "idle" && applyState("typing")}
          aria-invalid={fieldState === "invalid"}
          className={[
            "w-full rounded-xl border border-transparent bg-input/30 px-3 py-2.5",
            "text-sm text-foreground placeholder-muted-foreground outline-none",
            "transition-shadow duration-150",
            "focus-visible:ring-[3px] focus-visible:ring-ring/50",
          ].join(" ")}
        />
        <RippleBorder ref={lineRef} radius={14} />
      </div>
      <span
        role="status"
        aria-live={fieldState === "invalid" ? "assertive" : "polite"}
        className="sr-only"
      >
        {fieldState === "valid"
          ? successMessage
          : fieldState === "invalid"
            ? errorMessage
            : ""}
      </span>
      {fieldState === "invalid" && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
