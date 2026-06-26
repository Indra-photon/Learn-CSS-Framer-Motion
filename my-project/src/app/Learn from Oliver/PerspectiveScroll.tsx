"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import Lenis from "lenis";

function PerspectiveScroll() {
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
    <div>
      <main ref={container} className="relative h-[200vh]">
        <Section1 scrollYProgress={scrollYProgress} />

        <Section2 scrollYProgress={scrollYProgress} />
      </main>
    </div>
  );
}

export default PerspectiveScroll;

function Section1({ scrollYProgress }: { scrollYProgress: any }) {
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -5]);

  return (
    <motion.div
      style={{ scale, rotate }}
      className="sticky top-0 flex h-screen flex-col items-center justify-center bg-[#C72626] pb-[10vh] text-[3.5vw] text-white"
    >
      <p>Scroll Perspective</p>

      <div className="flex gap-4">
        <p>Section</p>

        <div className="relative w-[12.5vw]">
          <Image
            src="https://images.pexels.com/photos/7883809/pexels-photo-7883809.jpeg"
            alt="image"
            fill
          />
        </div>

        <p>Transition</p>
      </div>
    </motion.div>
  );
}

function Section2({ scrollYProgress }: { scrollYProgress: any }) {
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0]);
  return (
    <div className="relative h-screen">
      <motion.div style={{ scale, rotate }} className="relative h-full w-full">
        <Image
          src="https://images.pexels.com/photos/7883809/pexels-photo-7883809.jpeg"
          alt="image"
          fill
        />
      </motion.div>
    </div>
  );
}
