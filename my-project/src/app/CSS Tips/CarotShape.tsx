"use client";

import React, { useState } from "react";

type CaretShape = "bar" | "block" | "underscore";

const options: CaretShape[] = ["bar", "block", "underscore"];

function CarotShape() {
  const [email, setEmail] = useState("");
  const [caretShape, setCaretShape] = useState<CaretShape>("bar");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-start gap-2">
        <p className="text-lg font-medium text-stone-800">
          Your email
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ caretColor: "#3B82F6", caretShape }}
          className="w-72 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none transition-shadow duration-150 ease-out focus:border-blue-500 focus:[box-shadow:0_0_8px_rgba(59,130,246,0.25)]"
        />
        <div className="flex gap-5">
          {options.map((shape) => (
            <label key={shape} className="flex cursor-pointer items-center gap-1.5 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={caretShape === shape}
                onChange={() => setCaretShape(shape)}
                className="accent-blue-500"
              />
              {shape}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CarotShape;
