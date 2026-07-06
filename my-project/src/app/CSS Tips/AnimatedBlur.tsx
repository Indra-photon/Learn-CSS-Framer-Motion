"use client";

import React, { useRef, useEffect, useState } from "react";

const logos = [
  { id: 1, src: "https://www.logggos.club/logos/urban.svg" },
  { id: 2, src: "https://www.logggos.club/logos/reform-collective.svg" },
  { id: 3, src: "https://www.logggos.club/logos/lucid.svg" },
  { id: 4, src: "https://www.logggos.club/logos/tempo-fit.svg" },
  {
    id: 5,
    src: "https://www.logggos.club/_next/image?url=%2Flogos%2Fsnabbgross.jpg&w=640&q=75",
  },
];

function LogoCard({ src, index }: { src: string; index: number }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [delayPassed, setDelayPassed] = useState(false);

  const staggerDelay = index * 150;

  // Gate 1: stagger timer
  useEffect(() => {
    const t = setTimeout(() => setDelayPassed(true), staggerDelay);
    return () => clearTimeout(t);
  }, [staggerDelay]);

  // Gate 2: if image was already cached, mark it loaded
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  const revealed = loaded && delayPassed;

  return (
    <div
      style={{
        background: "#fafaf9",
        border: "1px solid #e7e5e4",
        borderRadius: 20,
        padding: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 120,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Stone shimmer placeholder */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #e7e5e4, #d6d3d1)",
          borderRadius: 20,
          opacity: revealed ? 0 : 1,
          transition: "opacity 0.5s ease-out",
        }}
      />

      <img
        ref={imgRef}
        src={src}
        alt=""
        onLoad={() => setLoaded(true)}
        style={{
          maxWidth: "100%",
          maxHeight: 64,
          objectFit: "contain",
          display: "block",
          filter: revealed ? "blur(0px)" : "blur(14px)",
          opacity: revealed ? 1 : 0,
          transform: revealed ? "scale(1)" : "scale(1.06)",
          transition:
            "filter 0.8s cubic-bezier(0.215, 0.61, 0.355, 1), opacity 0.6s ease-out, transform 0.8s cubic-bezier(0.215, 0.61, 0.355, 1)",
        }}
      />
    </div>
  );
}

function AnimateBlur() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {logos.map((logo, i) => (
          <LogoCard key={logo.id} src={logo.src} index={i} />
        ))}
      </div>
    </div>
  );
}

export default AnimateBlur;
