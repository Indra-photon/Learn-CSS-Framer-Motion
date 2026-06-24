"use client";

import React from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

function MotionValueBasics() {
  const SPRING = { mass: 0.1 };
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const opacity = useSpring(0);

  return (
    <div className="m-10 flex min-h-screen flex-col items-center justify-center bg-amber-100">
      <div
        onPointerMove={(e) => {
          const bounds = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - bounds.left - 24);
          y.set(e.clientY - bounds.top - 24);
        }}
        onMouseEnter={() => opacity.set(1)}
        onMouseLeave={() => opacity.set(0)}
        className="flex h-96 w-96 flex-col items-center justify-center bg-amber-200 p-10"
      >
        <motion.div
          style={{ x, y, opacity }}
          className="h-[48px] w-[48px] rounded-[12px] bg-amber-300"
        ></motion.div>
      </div>
    </div>
  );
}

export default MotionValueBasics;
