"use client";

import React, { useRef, useEffect, useState } from "react";

const MAIN_SRC =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=90";
const THUMB_SRC =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=20&q=10";

function AnimateBackdropBlur() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <>
      {/* Must stay in <style> — @property and backdrop-filter transition can't be expressed in Tailwind */}
      <style>{`
        @property --b {
          syntax: "<length>";
          inherits: false;
          initial-value: 24px;
        }
        .blur-overlay {
          position: absolute;
          inset: 0;
          -webkit-backdrop-filter: blur(var(--b));
          backdrop-filter: blur(var(--b));
          transition: --b 1s cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        .blur-overlay[data-loaded="true"] {
          --b: 0px;
        }
      `}</style>

      <div className="flex min-h-screen items-center justify-center bg-white p-10">
        <div className="relative h-[500px] w-full max-w-[800px] overflow-hidden rounded-[20px] bg-[#1c1c1e]">
          {/* Layer 1 — tiny thumbnail: backgroundImage is dynamic so must be inline */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${THUMB_SRC})` }}
          />

          {/* Layer 2 — blur overlay driven by @property */}
          <div
            className="blur-overlay"
            data-loaded={loaded ? "true" : "false"}
          />

          {/* Layer 3 — real image */}
          <img
            ref={imgRef}
            src={MAIN_SRC}
            alt=""
            onLoad={() => setLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
    </>
  );
}

export default AnimateBackdropBlur;
