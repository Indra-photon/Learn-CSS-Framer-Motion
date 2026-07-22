"use client";

import React, { useState } from "react";

const SIZE = 14; // grid resolution of the pixel dissolve
const REVEAL_STEP = 0.045; // seconds between each group vanishing

type Slide = {
  brand: string;
  image: string;
  heading: string;
  copy: string;
  footer: string;
};

const SLIDES: Slide[] = [
  {
    brand: "Tribe Capital",
    image:
      "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=900&auto=format&fit=crop",
    heading:
      "A moment where care flows freely between beings. An experience you are familiar with, but perhaps forgotten.",
    copy: "Everything long extinct and everything not yet existing. When Earth was nothing and nothing was Earth. No one was there, but we remember when we were one.",
    footer:
      "We put our money where our mouth (and keyboard) is. Not Boring Capital backs the founders building the future and helps them tell their stories.",
  },
  {
    brand: "Tribe Capital",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=900&auto=format&fit=crop",
    heading:
      "A quiet signal beneath the noise. The shape of an idea before it has learned to speak its own name.",
    copy: "Somewhere between the question and the answer there is a pause. We live inside that pause, listening for the founders who hear it too and refuse to look away.",
    footer:
      "We invest early, stay close, and treat conviction as a craft. The best stories are written long before anyone is watching.",
  },
  {
    brand: "Tribe Capital",
    image:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=900&auto=format&fit=crop",
    heading:
      "Motion is memory in disguise. Every pixel that fades was once certain of its place in the whole.",
    copy: "What dissolves is not lost, only rearranged into the next thing worth building. We fund the rearrangers, the patient ones turning static into signal.",
    footer:
      "From first cheque to lasting company, we back the people who make the future feel inevitable in hindsight.",
  },
];

type Tile = { x: number; y: number; delay: number };

function shuffle<T>(list: T[]): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Exactly `size` cells per group, then randomize positions.
function buildTiles(size: number): Tile[] {
  const groups: number[] = [];
  for (let g = 0; g < size; g++) for (let i = 0; i < size; i++) groups.push(g);
  const shuffled = shuffle(groups);

  // random order in which groups disappear -> per-group delay
  const order = shuffle(Array.from({ length: size }, (_, k) => k));
  const delayOf = new Map<number, number>();
  order.forEach((g, idx) => delayOf.set(g, idx * REVEAL_STEP));

  const tiles: Tile[] = [];
  let i = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      tiles.push({ x, y, delay: delayOf.get(shuffled[i++])! });
    }
  }
  return tiles;
}

const TOTAL_MS = (SIZE * REVEAL_STEP + 0.4) * 1000;

function PixelCard() {
  const [index, setIndex] = useState(0);
  // the outgoing image that dissolves away; null when idle
  const [outgoing, setOutgoing] = useState<{
    image: string;
    tiles: Tile[];
  } | null>(null);

  const slide = SLIDES[index];

  const next = () => {
    if (outgoing) return; // ignore clicks mid-transition
    const from = SLIDES[index];
    setOutgoing({ image: from.image, tiles: buildTiles(SIZE) });
    setIndex((i) => (i + 1) % SLIDES.length);
    window.setTimeout(() => setOutgoing(null), TOTAL_MS);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#e9e8e6] p-8">
      <div
        onClick={next}
        className="h-[550px] w-full max-w-[380px] cursor-pointer overflow-hidden rounded-[22px] bg-[#fbfbfa] font-sans shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] transition-transform duration-150 select-none active:scale-[0.98]"
      >
        {/* media / pixel dissolve area */}
        <div
          className="relative h-80 overflow-hidden"
          style={{ ["--size" as string]: SIZE }}
        >
          {/* incoming (new) image sits underneath */}
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={slide.image}
            alt=""
          />

          {/* outgoing image, sliced into tiles that fade out */}
          {outgoing && (
            <div
              key={index}
              className="absolute inset-0 z-[1] grid grid-cols-[repeat(var(--size),1fr)] grid-rows-[repeat(var(--size),1fr)]"
            >
              {outgoing.tiles.map((t) => (
                <div
                  key={`${t.x}-${t.y}`}
                  className="animate-pixcard-out scale-[1.02] bg-[length:calc(var(--size)*100%)_calc(var(--size)*100%)] bg-no-repeat motion-reduce:animate-none"
                  style={{
                    backgroundImage: `url("${outgoing.image}")`,
                    backgroundPosition: `${(t.x / (SIZE - 1)) * 100}% ${
                      (t.y / (SIZE - 1)) * 100
                    }%`,
                    animationDelay: `${t.delay}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* body */}
        <div className="flex flex-col px-[26px] pt-7 pb-[22px]">
          <div
            key={index}
            className="animate-pixcard-textin motion-reduce:animate-none"
          >
            <h2 className="text-[27px] leading-[1.08] font-semibold tracking-[-0.02em] text-[#131313]">
              {slide.heading}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PixelCard;
