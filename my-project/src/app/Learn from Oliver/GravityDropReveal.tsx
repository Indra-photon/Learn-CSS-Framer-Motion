"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import Lenis from "lenis";

const lines = ["Design", "Without", "Limits"];

function GravityDropReveal() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  return (
    <main ref={container} className="relative h-[300vh]">
      <Section1 scrollYProgress={scrollYProgress} />
      <Section2 scrollYProgress={scrollYProgress} />
    </main>
  );
}

export default GravityDropReveal;

function Section1({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollYProgress, [0.55, 0.7], [1, 0]);

  return (
    <motion.div
      style={{ opacity, perspective: "1200px" }}
      className="sticky top-0 flex h-screen flex-col items-center justify-center gap-2 overflow-hidden bg-[#0A0A0A]"
    >
      {lines.map((word, i) => (
        <Word
          key={word}
          word={word}
          index={i}
          total={lines.length}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </motion.div>
  );
}

function Word({
  word,
  index,
  total,
  scrollYProgress,
}: {
  word: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const offset = index / total;
  const start = offset * 0.2;
  const end = start + 0.25;

  const rotateX = useTransform(scrollYProgress, [start, end], [0, 90]);
  const opacity = useTransform(scrollYProgress, [start, end - 0.05], [1, 0]);
  const z = useTransform(scrollYProgress, [start, end], [0, 120]);

  return (
    <motion.p
      style={{
        rotateX,
        opacity,
        z,
        transformOrigin: "bottom center",
      }}
      className="text-[12vw] font-bold leading-none tracking-tight text-white"
    >
      {word}
    </motion.p>
  );
}

function Section2({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const y = useTransform(scrollYProgress, [0.5, 1], ["20%", "0%"]);
  const scale = useTransform(scrollYProgress, [0.5, 1], [0.88, 1]);
  const opacity = useTransform(scrollYProgress, [0.5, 0.72], [0, 1]);

  return (
    <div className="relative h-screen">
      <motion.div style={{ y, scale, opacity }} className="relative h-full w-full">
        <Image
          src="https://images.pexels.com/photos/7883809/pexels-photo-7883809.jpeg"
          alt="image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-end p-16">
          <p className="text-[4vw] font-semibold leading-tight text-white">
            The world <br /> awaits you.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
