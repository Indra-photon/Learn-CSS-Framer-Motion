'use client';

import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import {
  IconMapPin,
  IconClock,
  IconMountain,
  IconFlame,
} from "@tabler/icons-react";

interface Card {
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  image: string;
  logo: string;
  location: string;
  duration: string;
  difficulty: string;
  maxAltitude: string;
  bookedCount: number;
  price: number;
  tags: string[];
}

const TREKKING_CARDS = [
  {
    title: "Everest Base Camp",
    subtitle: "Gateway to the Roof of the World",
    description:
      "A legendary high-altitude trek to the foot of the world's highest peak.",
    longDescription:
      "A legendary high-altitude journey through Sherpa villages, ancient monasteries, and sweeping glacial valleys to the foot of the world's highest peak. Experience the raw beauty of the Himalayas as you trek through Sagarmatha National Park, crossing suspension bridges over roaring rivers and acclimatizing at iconic stops like Namche Bazaar and Dingboche.",
    image:
      "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=800",
    logo: "https://images.pexels.com/photos/2335126/pexels-photo-2335126.jpeg?auto=compress&cs=tinysrgb&w=100",
    location: "Nepal",
    duration: "14 days",
    difficulty: "Hard",
    maxAltitude: "5,364 m",
    bookedCount: 1248,
    price: 1490,
    tags: ["Alpine terrain", "Guided", "Teahouse stays"],
  },
  {
    title: "Torres del Paine",
    subtitle: "Wind, Granite & Patagonian Sky",
    description:
      "Trek the iconic W-route through South America's most celebrated national park.",
    longDescription:
      "Traverse the iconic W-route past turquoise lakes, hanging glaciers, and the dramatic granite towers of South America's most celebrated national park. Each day brings a new landscape — from the emerald waters of Lake Pehoé to the thundering Grey Glacier — all set beneath Patagonia's ever-shifting, cinematic sky.",
    image:
      "https://images.pexels.com/photos/1450363/pexels-photo-1450363.jpeg?auto=compress&cs=tinysrgb&w=800",
    logo: "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=100",
    location: "Patagonia, Chile",
    duration: "5 days",
    difficulty: "Moderate",
    maxAltitude: "1,200 m",
    bookedCount: 874,
    price: 680,
    tags: ["Camping", "Wildlife", "Refugio stops"],
  },
  {
    title: "Cinque Terre Path",
    subtitle: "Cliffside Villages & Mediterranean Sea",
    description:
      "A coastal trail connecting five pastel-painted fishing villages above the Ligurian Sea.",
    longDescription:
      "Wander a stunning coastal trail connecting five pastel-painted fishing villages perched above the Ligurian Sea, with vineyards, olive groves, and endless sea views at every turn. The path winds through terraced hillsides and hidden coves, rewarding you with fresh seafood, local wine, and golden-hour sunsets over the Mediterranean.",
    image:
      "https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=800",
    logo: "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=100",
    location: "Liguria, Italy",
    duration: "3 days",
    difficulty: "Easy",
    maxAltitude: "340 m",
    bookedCount: 2103,
    price: 290,
    tags: ["Coastal path", "Self-guided", "Village stays"],
  },
];

function TravelCardBooking() {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-gray-100">
      <AnimatePresence>
        {activeCard ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
            className="fixed inset-0 z-10 bg-black/20"
          />
        ) : null}
      </AnimatePresence>

      <div className="flex flex-row gap-4">
        {TREKKING_CARDS.map((card) => (
          <TravelCard
            key={card.title}
            card={card}
            setActiveCard={setActiveCard}
          />
        ))}
      </div>

      <AnimatePresence>
        {activeCard ? (
          <ActiveTravelCard
            key={activeCard.title}
            activeCard={activeCard}
            setActiveCard={setActiveCard}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default TravelCardBooking;

function TravelCard({
  card,
  setActiveCard,
}: {
  card: Card | null;
  setActiveCard: (card: Card | null) => void;
}) {
  if (!card) return null;

  return (
    <motion.div
      layoutId={`card-${card.title}`}
      onClick={() => setActiveCard(card)}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <div className="relative h-[370px] w-[380px] overflow-hidden rounded-[20px] bg-white p-2">
        <motion.div className="relative h-full overflow-hidden rounded-[12px]">
          <motion.img
            src={card.image}
            layoutId={`card-${card.image}`}
            alt=""
            className="h-full w-full object-cover"
          />

          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end rounded-b-[12px] px-4 pb-2 tracking-tighter text-white backdrop-blur-md"
            style={{
              background: "rgba(0, 0, 0, 0.25)",
              borderTop: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex flex-row justify-between">
              <div>
                <motion.h2
                  className="text-xl font-bold"
                  layoutId={`card-title-${card.title}`}
                >
                  {card.title}
                </motion.h2>
                <motion.h3
                  className="text-sm"
                  layoutId={`card-subtitle-${card.subtitle}`}
                >
                  {card.subtitle}
                </motion.h3>
              </div>

              <div className="flex items-center justify-center">
                <motion.button
                  layoutId={`card-button-${card.title}`}
                  className="rounded-3xl bg-white px-6 py-1 text-black"
                >
                  {" "}
                  Explore{" "}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          layoutId={`card-long-description-${card.title}`}
          style={{ position: "absolute", top: "100%", opacity: 0 }}
          className="px-4 py-3 text-sm text-neutral-700"
        >
          <p>{card.longDescription}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ActiveTravelCard({
  activeCard,
  setActiveCard,
}: {
  activeCard: Card | null;
  setActiveCard: (card: Card | null) => void;
}) {
  if (!activeCard) return null;

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: {
      delay,
      duration: 0.2,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  });

  return (
    <motion.div
      layoutId={`card-${activeCard.title}`}
      onClick={() => setActiveCard(null)}
      layout
      className="absolute inset-0 z-20 m-auto h-fit w-[380px]"
    >
      <div className="w-[380px] overflow-hidden rounded-[20px] bg-white">
        {/* Zone 1: Clean image */}
        <div className="relative h-[370px]">
          <motion.img
            src={activeCard.image}
            layoutId={`card-${activeCard.image}`}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        {/* Zone 2: Expanded content */}
        <div className="flex flex-col gap-3 px-4 py-4">
          {/* Title + subtitle morph down from glass bar */}
          <div>
            <motion.h2
              layoutId={`card-title-${activeCard.title}`}
              className="text-2xl font-bold tracking-tight text-neutral-900"
            >
              {activeCard.title}
            </motion.h2>
            <motion.h3
              layoutId={`card-subtitle-${activeCard.subtitle}`}
              className="mt-0.5 text-sm text-neutral-500"
            >
              {activeCard.subtitle}
            </motion.h3>
          </div>

          {/* Stats 2x2 grid */}
          <motion.div {...fade(0.18)} className="grid grid-cols-2 gap-2">
            <StatItem
              icon={<IconMapPin size={13} />}
              label="Location"
              value={activeCard.location}
            />
            <StatItem
              icon={<IconClock size={13} />}
              label="Duration"
              value={activeCard.duration}
            />
            <StatItem
              icon={<IconMountain size={13} />}
              label="Max Altitude"
              value={activeCard.maxAltitude}
            />
            <StatItem
              icon={<IconFlame size={13} />}
              label="Difficulty"
              value={activeCard.difficulty}
            />
          </motion.div>

          {/* Tags */}
          <motion.div {...fade(0.24)} className="flex flex-wrap gap-1.5">
            {activeCard.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Long description morphs in */}
          <motion.div
            layoutId={`card-long-description-${activeCard.title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.15,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            className="text-sm leading-relaxed text-neutral-500"
          >
            <p>{activeCard.longDescription}</p>
          </motion.div>

          {/* Footer: booked count + price + button */}
          <motion.div
            {...fade(0.3)}
            className="flex items-center justify-between border-t border-neutral-100 pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <span className="text-xs text-neutral-400">
                {activeCard.bookedCount.toLocaleString()} booked
              </span>
              <span className="text-xl font-bold text-neutral-900">
                ${activeCard.price.toLocaleString()}
              </span>
            </div>
            <motion.button
              layoutId={`card-button-${activeCard.title}`}
              className="rounded-3xl bg-neutral-900 px-6 py-2 text-sm font-semibold text-white"
            >
              Explore
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
      <span className="text-neutral-400">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] tracking-wide text-neutral-400 uppercase">
          {label}
        </span>
        <span className="text-xs font-semibold text-neutral-700">{value}</span>
      </div>
    </div>
  );
}
