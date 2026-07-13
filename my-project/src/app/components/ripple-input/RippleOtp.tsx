"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { RippleBorder, RippleBorderHandle } from "./RippleBorder";
import "./ripple-input.css";

export interface RippleOtpHandle {
  notifyResult: (result: "valid" | "invalid") => void;
  reset: () => void;
}

interface RippleOtpProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  className?: string;
}

const STAGGER_MS = 70;

export const RippleOtp = forwardRef<RippleOtpHandle, RippleOtpProps>(
  function RippleOtp(
    { length = 6, value, onChange, onComplete, className = "" },
    ref,
  ) {
    const lineRefs = useRef<(RippleBorderHandle | null)[]>([]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const staggerTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

    const digits = Array.from({ length }, (_, i) => value[i] ?? "");

    const clearStagger = () => {
      staggerTimers.current.forEach(clearTimeout);
      staggerTimers.current = [];
    };

    useEffect(() => clearStagger, []);

    useImperativeHandle(ref, () => ({
      notifyResult: (result) => {
        clearStagger();
        if (result === "valid") {
          lineRefs.current.forEach((line, i) => {
            const t = setTimeout(() => {
              line?.setColorState("success");
              line?.pulse({ from: 0, to: 1, magnitude: 9 });
            }, i * STAGGER_MS);
            staggerTimers.current.push(t);
          });
        } else {
          lineRefs.current.forEach((line) => {
            line?.setColorState("destructive");
            line?.pulseDouble({ from: 0.5, to: 0.5, magnitude: 10 });
          });
        }
      },
      reset: () => {
        clearStagger();
        lineRefs.current.forEach((line) => line?.setColorState("idle"));
      },
    }));

    const setDigit = (index: number, digit: string) => {
      const chars = digits.slice();
      chars[index] = digit;
      const next = chars.join("").slice(0, length);
      onChange(next);
      if (next.length === length) onComplete?.(next);
    };

    const handleChange = (
      index: number,
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      const digit = raw.slice(-1);
      lineRefs.current[index]?.setColorState("primary");
      lineRefs.current[index]?.nudge(digit ? 3 : -3);
      setDigit(index, digit);

      if (digit && index < length - 1) {
        // ripple travels toward the box's right edge, handing off to the next box
        lineRefs.current[index]?.pulse({ from: 0.05, to: 0.5, magnitude: 5 });
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const code = digits.join("");
        if (code.length === length) onComplete?.(code);
      }
    };

    return (
      <div ref={containerRef} className={`ri-field flex gap-2 ${className}`}>
        {digits.map((digit, i) => (
          <div key={i} className="relative w-11">
            <input
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={[
                "bg-input/30 w-11 rounded-xl border border-transparent px-0 py-2.5 text-center",
                "text-foreground text-lg font-medium outline-none",
                "transition-shadow duration-150",
                "focus-visible:ring-ring/50 focus-visible:ring-[1px]",
              ].join(" ")}
            />
            <RippleBorder
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              radius={14}
            />
          </div>
        ))}
      </div>
    );
  },
);
