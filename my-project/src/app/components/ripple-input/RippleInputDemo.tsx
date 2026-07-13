"use client";

import { useRef, useState } from "react";
import { RippleOtp, RippleOtpHandle } from "./RippleOtp";

const OTP_CODE = "123456";

export default function RippleInputDemo() {
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState(
    "Enter the 6-digit code — try 123456",
  );

  const otpRef = useRef<RippleOtpHandle>(null);
  const verifying = useRef(false);

  const handleOtpComplete = (code: string) => {
    if (verifying.current) return;
    verifying.current = true;
    setOtpStatus("Verifying…");
    setTimeout(() => {
      verifying.current = false;
      if (code === OTP_CODE) {
        otpRef.current?.notifyResult("valid");
        setOtpStatus("Verified ✓");
      } else {
        otpRef.current?.notifyResult("invalid");
        setOtpStatus("Wrong code — try again");
      }
    }, 700);
  };

  return (
    <div className="border-border bg-card text-card-foreground mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-8 rounded-2xl border p-8">
      <div>
        <h2 className="text-lg font-semibold">Ripple feedback inputs</h2>
        <p className="text-muted-foreground text-sm">
          Validation state told through motion and color, not just red borders.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-foreground/80 text-sm font-medium">
          Verification code
        </label>
        <RippleOtp
          ref={otpRef}
          length={6}
          value={otp}
          onChange={(next) => {
            setOtp(next);
            if (next.length < 6)
              setOtpStatus("Enter the 6-digit code — try 123456");
          }}
          onComplete={handleOtpComplete}
        />
        <p className="text-muted-foreground text-xs">{otpStatus}</p>
      </div>
    </div>
  );
}
