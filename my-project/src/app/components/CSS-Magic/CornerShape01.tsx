import React from "react";

function CornerShape01() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 font-sans">
      <div className="corner-round mb-2 w-fit rounded-[16px] bg-amber-200 p-2 text-lg text-gray-500">
        <code>corner-shape: round</code> (the default value)
      </div>
      <div className="corner-scoop mb-2 w-fit rounded-[16px] bg-amber-200 p-4 text-lg text-gray-500">
        <code>corner-shape: scoop</code> (rounded but inverted)
      </div>
      <div className="corner-bevel mb-2 w-fit rounded-[16px] bg-amber-200 p-4 text-lg text-gray-500">
        <code>corner-shape: bevel</code> (snipped/<em>not</em> rounded)
      </div>
      <div className="corner-notch mb-2 w-fit rounded-[16px] bg-amber-200 p-5 text-lg text-gray-500">
        <code>corner-shape: notch</code> (snipped once)
      </div>
      <div className="corner-squircle mb-2 w-fit rounded-[16px] bg-amber-200 p-2 text-lg text-gray-500">
        <code>corner-shape: squircle</code> (snipped twice)
      </div>

      <div className="sale-button">Sale</div>
    </div>
  );
}

export default CornerShape01;
