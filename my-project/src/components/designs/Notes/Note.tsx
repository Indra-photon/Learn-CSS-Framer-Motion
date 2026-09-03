/**
 * Notes — a task list card: header with a completion count and a primary
 * action, a filter row, and date-grouped task rows carrying completion,
 * status, counts and collaborator faces.
 *
 * Every size, weight, radius and colour comes from ./tokens — see that file
 * for the constraints this component is built to hold.
 *
 * Sizing is deliberately *not* declared here: the root is `w-full` and the
 * caller owns the width. Standalone that means a `max-w-*` wrapper; inside
 * MobileFrame it means the screen width. Baking a max-width in would make the
 * card fight the device shell, and Tailwind gives no reliable way for a
 * `className` prop to win that fight afterwards.
 *
 * The card also sizes to its *content* height rather than stretching. It used
 * to be handed `h-full`, which left roughly 280px of empty white below the
 * last row — the largest single shape in the composition was a void. The
 * screen now spends that space on a tab bar, and what is left over shows
 * through as screen background between the two — a deliberate gap rather than
 * an unfinished card.
 *
 * Server component: no hooks, no client directives.
 */

import Image from "next/image";
import {
  Add01Icon,
  Attachment01Icon,
  CheckListIcon,
  CheckmarkCircle02Icon,
  CircleIcon,
  Clock01Icon,
  Delete02Icon,
  File01Icon,
  Message01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { type IconSvgElement } from "@hugeicons/react";

import Icon, { STROKE } from "./icon";

import TabBar from "./TabBar";
import { avatar, t, tone, type Tone } from "./tokens";

/* -------------------------------------------------------------------- data */

type Task = {
  title: string;
  description?: string;
  status: { label: string; tone: Tone };
  due?: string;
  /** [done, total] subtasks. Omitted on a task with no breakdown. */
  progress?: [number, number];
  comments?: number;
  files?: number;
  collaborators: string[];
  done?: boolean;
  /** Renders the row mid-swipe, revealing the action behind it. */
  swiped?: boolean;
};

/**
 * Faces, keyed by name. A photo says "a person" at 24px in a way an initial
 * never does — the initials were three letters the eye had to decode before it
 * could count heads, which is the only thing this cluster is ever asked.
 *
 * Cropped square at 2x and served at the size they are drawn: an avatar
 * downscaled from a full-resolution photo is the usual reason a mock looks
 * soft next to the type around it. Host is already allow-listed in
 * next.config.ts, so these go through next/image rather than a bare <img>.
 */
const PHOTO = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop&dpr=2`;

const PEOPLE: Record<string, string> = {
  Miguel: PHOTO(2379004),
  Angel: PHOTO(774909),
  Hane: PHOTO(415829),
  John: PHOTO(936119),
};

const DONE = 3;
const TOTAL = 8;

/**
 * Grouped by date rather than tagged with it. The old rows carried a time chip
 * ("Today", "Yesterday") next to a status chip ("Ongoing", "Past") — same
 * shape, same size, adjacent — so two unrelated dimensions were sharing one
 * visual channel and the eye could not tell which chip was which. A group
 * header states the date once for the whole cluster and the chip is freed to
 * mean exactly one thing.
 */
const GROUPS: { label: string; tasks: Task[] }[] = [
  {
    label: "Today",
    tasks: [
      {
        title: "Design System V.2",
        description: "Component inventory, tokens and usage rules.",
        status: { label: "Ongoing", tone: "blue" },
        due: "2:30 PM",
        progress: [4, 7],
        comments: 3,
        files: 2,
        collaborators: ["Miguel", "Angel", "Hane"],
      },
      {
        title: "User Interface",
        description: "New design elements and styles.",
        status: { label: "Incoming", tone: "green" },
        due: "5:00 PM",
        progress: [1, 5],
        comments: 1,
        files: 4,
        // Sara has no photo — the tinted-initial fallback, shown on purpose.
        collaborators: ["Miguel", "John", "Sara"],
      },
      {
        // Third task, and the only one wearing `amber` — the tone existed in
        // the palette with nothing spending it, which is how a colour drifts
        // out of a design system without anyone deciding to drop it.
        title: "Motion Guidelines",
        description: "Easing curves, durations and reduced-motion rules.",
        status: { label: "Review", tone: "amber" },
        due: "6:15 PM",
        progress: [2, 4],
        comments: 5,
        files: 1,
        collaborators: ["Angel", "Hane"],
      },
    ],
  },
  {
    label: "Yesterday",
    tasks: [
      {
        title: "Typography Styles",
        status: { label: "Done", tone: "grey" },
        collaborators: ["John", "Hane"],
        done: true,
        swiped: true,
      },
    ],
  },
];

/* --------------------------------------------------------------- fragments */

function Tag({ label, tone: k }: { label: string; tone: Tone }) {
  return (
    <span
      className={`${tone[k]} ${t.rail} flex h-5 items-center justify-center overflow-hidden rounded-full px-2 pb-[1px] text-[13px] leading-4 font-normal`}
    >
      {/* `text-box: trim-both cap alphabetic` — the fix for a label that will
          not sit in the middle no matter what padding it is given.
       *
       * Padding centres the *line box*, and the line box is not what the eye
       * judges. Figtree reserves 0.95em above the baseline and 0.25em below
       * (next/font states both on its fallback face), so at 13px the box
       * carries 12.35px of ascent over a cap that is only ~9.1px tall. The
       * leftover 3px is empty and sits entirely on top of the letters, which
       * is why every padding value is either a pixel high or a pixel low —
       * there is no value that centres the ink, because the ink is not
       * centred in the thing being moved.
       *
       * `trim-both` throws that reserved space away and shrinks the box to
       * exactly cap-height-to-baseline, so `items-center` then centres the
       * letters themselves. Same rule as Figma's "Vertical trim: Cap height".
       *
       * `justify-center` is doing the horizontal half now that `text-center`
       * is gone, and `overflow-hidden` sits on this outer box rather than the
       * inner one on purpose: on the inner box it would clip at the trimmed
       * edge and take the descender off the "g".
       *
       * Chrome 133+ and Safari 18.4+. Where it is not supported the flex
       * centring still runs and the label lands where `pt-0.5` put it, which
       * is the better of the two guesses. */}
      <span className="whitespace-nowrap [text-box:trim-both_cap_alphabetic]">
        {label}
      </span>
    </span>
  );
}

/** An icon and a number — attachments, comments. Body-sized like everything. */
function Count({
  icon,
  value,
}: {
  icon: IconSvgElement;
  value: number | string;
}) {
  return (
    <span className={`${t.body} flex items-center gap-1 tabular-nums`}>
      <Icon icon={icon} size={14} />
      {value}
    </span>
  );
}

/**
 * Overlapping initials. `-space-x-2` does the stacking; the ring is painted in
 * the row's own background via `--row`, so each circle cuts a clean bite out
 * of the one behind it — a real border would read as a drawn stroke instead,
 * and a hardcoded colour would stop matching the moment the row hovers.
 */
function Collaborators({ names }: { names: string[] }) {
  return (
    <div className="flex -space-x-2">
      {names.map((name, i) => {
        const photo = PEOPLE[name];
        return (
          <span
            key={name}
            className={`${photo ? "" : avatar[i % avatar.length]} ${t.ringRow} flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[13px] font-normal ring-2`}
          >
            {/* The tinted initial is the fallback, not the default — a real
                roster always has someone who has not uploaded a photo, and a
                design that only draws the happy path hides that from you. */}
            {photo ? (
              <Image
                src={photo}
                alt={name}
                width={48}
                height={48}
                className="size-full object-cover outline-1 -outline-offset-1 outline-black/10"
              />
            ) : (
              name[0]
            )}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Every leading mark occupies this one slot, so the marks, the header icon and
 * the group labels all sit in the same 24px column.
 *
 * No vertical nudge. The mark used to carry a `-mt-0.5` guessed against an
 * assumed 20px line box, which is why the title sat a pixel or two low — the
 * font's actual line box is whatever the browser resolves `normal` to, not a
 * number this file gets to pick. The title row is now declared `h-6` and
 * centres its own text, so the mark and the heading are two 24px boxes
 * starting at the same y and the alignment is exact rather than tuned.
 */
const MARK = "size-6 shrink-0";

/**
 * The leading mark: a ring that fills as a wedge, in proportion to subtasks
 * done. It replaces an empty circle that said the same nothing on every row.
 *
 * A wedge and not an arc. At 20px a stroked arc has to be ~2px wide to be
 * visible at all, which puts it optically level with the ring it sits inside
 * and the two read as one thick smudge; a filled sector separated from the
 * ring by a gap reads its own fraction at a glance. Geometry starts at twelve
 * o'clock and sweeps clockwise, which is the only direction a viewer will
 * read a clock-shaped thing.
 *
 * The exact count still lives in the meta row. These are two different jobs:
 * the wedge is glanceable and approximate, the count is precise and requires
 * stopping to read. Neither one makes the other redundant.
 *
 * Drawn on Hugeicons' grid, not on one of its own: a 24 viewBox, `r=10`, and
 * the same `STROKE` every icon on the screen uses. Those are `CircleIcon`'s
 * exact numbers, so the empty ring, the green check and this one are the same
 * circle — and its outer ink starts at 1.25 units like theirs, which is what
 * keeps it on the 16px column. Anything sharing a column with an icon set has
 * to be drawn to that set's metrics, not to round numbers of its own. This is
 * the second time these have moved; they were Tabler's `r=9` / 2-unit stroke
 * before the set was swapped.
 */
function ProgressMark({ done, total }: { done: number; total: number }) {
  const fraction = Math.min(Math.max(done / total, 0), 1);

  const C = 12; // centre, on Hugeicons' 24 grid
  const R = 10; // ring radius — Hugeicons' own CircleIcon
  const r = 7; // wedge radius, leaving a 2.25 gap inside the ring

  const angle = fraction * 2 * Math.PI;
  const x = C + r * Math.sin(angle);
  const y = C - r * Math.cos(angle);

  return (
    <svg viewBox="0 0 24 24" className={MARK}>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        strokeWidth={STROKE}
        className={t.markTrack}
      />
      {fraction >= 1 ? (
        <circle cx={C} cy={C} r={r} className={t.markFill} />
      ) : (
        fraction > 0 && (
          // Sector: centre → twelve o'clock → arc → close.
          <path
            d={`M ${C} ${C} L ${C} ${C - r} A ${r} ${r} 0 ${fraction > 0.5 ? 1 : 0} 1 ${x} ${y} Z`}
            className={t.markFill}
          />
        )
      )}
    </svg>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    // The swiped row shrinks to make room for its action rather than sliding
    // out from under a clip. Translating it was right in principle — that is
    // what the gesture does — but at rest it just ate the first letter of the
    // title, which reads as a broken layout rather than as a swipe. The
    // settled width is the state worth drawing.
    // The action ends where the wells end. It was briefly inset 12px so its
    // centre would land on the same column the badges and face clusters use,
    // but that traded a shared centre line for a broken right edge — and the
    // right edge is the one the eye actually checks, because every row above
    // draws it. A surface in a list of surfaces matches their bounds first.
    <div className="flex items-stretch gap-2">
      {/* `pt-[15px] pb-4` — 15 and 16, not 16 and 16.
          The row's topmost ink is the status mark and its bottommost is the
          avatar cluster, and those two do not sit in their boxes the same way.
          CircleIcon is r=10 on a 24 grid, so with a 1.5 stroke its outer edge
          stops 1.25 short of its own box; an avatar is a filled 24px circle
          that fills its box exactly. Equal padding therefore renders 17.25
          above the visible mark and 16 below the visible faces. Taking that
          1.25 off the top is what makes the two gaps match on screen rather
          than in the box model. */}
      <button
        type="button"
        className={`${t.radiusInner} ${t.well} ${t.wellHover} ${t.insetRing} ${t.insetRingHover} ${t.shadowMove} group flex min-w-0 flex-1 items-start gap-2 px-2 pt-[15px] pb-4 text-left`}
      >
        {task.done ? (
          <Icon
            icon={CheckmarkCircle02Icon}
            size={24}
            className={`${MARK} text-[oklch(52%_0.115_155)]`}
          />
        ) : task.progress ? (
          <ProgressMark done={task.progress[0]} total={task.progress[1]} />
        ) : (
          // No subtasks to measure — the empty ring is the honest mark.
          <Icon
            icon={CircleIcon}
            size={24}
            className={`${MARK} text-[oklch(75%_0.010_264)]`}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* `h-6` matches the mark exactly, so both are 24px boxes starting at
              the same y and the heading centres itself inside one. */}
          <div className="flex h-6 items-center gap-2">
            <span
              className={`${t.name} truncate ${
                task.done ? "text-[oklch(62%_0.012_264)] line-through" : ""
              }`}
            >
              {task.title}
            </span>
            {/* Status closes the row on the right, where the due time used to
                sit. It is the one field worth reading before deciding whether
                to read the row at all, so it earns the second alignment edge;
                the time is a detail and moved down with the other details. */}
            <span className="ml-auto shrink-0">
              <Tag {...task.status} />
            </span>
          </div>

          {/* 2px. The title's own line box already leaves ~3px under the text
              inside `h-6`, so a 6px gap on top of that read as a gulf between a
              heading and its own subtext. */}
          {task.description && (
            <p
              className={`${t.body} mt-0.5 line-clamp-2 max-w-4/5 text-pretty`}
            >
              {task.description}
            </p>
          )}

          {/* Details left, faces right. The collaborator sentence that used to
              live here repeated the same three names in every row and was the
              only line that wrapped — the avatars already said it. */}
          <div className="mt-5 flex items-center gap-2">
            {/* Subtask completion, as a third count rather than a fourth line.
                It had a full-width track under the row, which drew a heavy
                horizontal rule across every task and read as structure the
                list does not have. The number was always the part being
                read; the bar was the part being ignored. */}
            {task.progress && (
              <Count
                icon={CheckListIcon}
                value={`${task.progress[0]}/${task.progress[1]}`}
              />
            )}

            {task.files !== undefined && (
              <Count icon={Attachment01Icon} value={task.files} />
            )}
            {task.comments !== undefined && (
              <Count icon={Message01Icon} value={task.comments} />
            )}
            {task.due && <Count icon={Clock01Icon} value={task.due} />}

            {/* Centred in the rail, not flushed to its right edge — the
                cluster is a different width in every row, and only its centre
                can line up with the badge sitting above it. */}
            <div className={`${t.rail} ml-auto flex justify-center`}>
              <Collaborators names={task.collaborators} />
            </div>
          </div>
        </div>
      </button>

      {task.swiped && (
        <div
          className={`${t.radiusInner} ${tone.red} ${t.rail} flex shrink-0 flex-col items-center justify-center gap-1`}
        >
          <Icon icon={Delete02Icon} size={18} />
          <span className="text-[13px] font-normal">Delete</span>
        </div>
      )}
    </div>
  );
}

/**
 * Segmented control. The inner radius is the outer radius minus the container
 * padding — the same nested-corner arithmetic MobileFrame does for the bezel,
 * and the reason the selected pill sits concentric inside the track instead of
 * looking pasted on.
 */
const TABS = ["All", "Today", "Done"];

function Segmented() {
  return (
    <div
      className={`${t.radiusInner} ${t.well} ${t.insetRing} flex items-center p-1`}
    >
      {TABS.map((tab, i) => (
        <button
          key={tab}
          type="button"
          className={`${t.radiusTight} px-3 py-1.5 text-[13px] font-normal transition-colors ${
            i === 0
              ? `${t.card} ${t.shadowBorder} font-semibold text-[oklch(23%_0.015_264)]`
              : "text-[oklch(62%_0.012_264)]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- component */

export default function Notes({ className = "" }: { className?: string }) {
  return (
    // Deliberately a <div>, not a <section>. globals.css carries a bare
    // `section { min-height: 100vh; display: grid; place-items: center }`
    // rule from the CornerShape02 demo, which would force this card to
    // viewport height and centre every child inside it — that rule is global
    // and unscoped, so any <section> here silently inherits it.
    <div
      className={`${t.radius} ${t.card} ${t.shadowBorder} flex w-full flex-col overflow-hidden ${className}`}
    >
      {/* The one divider in the component: chrome above, content below. */}
      <header
        // Asymmetric on purpose: `pl-4` keeps the logo on the 16 column the
        // status marks use, while `pr-2` lets the Add button close on 8 — the
        // wells' own outer edge — rather than stopping short at their content
        // edge. The left of the header answers to the list's contents, the
        // right of it answers to the list's bounds.
        className={`${t.hairline} flex shrink-0 items-center justify-between gap-3 py-3 pr-2 pl-4`}
      >
        {/* `gap-2`, matching the row's. The wordmark and the row titles are
            both "the 24px mark, then a gap", so the gap has to be the same
            number in both places or they stop sharing a column. */}
        <div className={`${t.name} flex items-center gap-2`}>
          {/* Optical, and transform-only so nothing else moves. Both glyphs
              sit in a 24px box, but Tabler draws the document 5 units in from
              its edge and the circle only 3 — box-aligned, the logo's ink
              starts 2px right of every mark below it. `-translate-x-0.5`
              spends exactly that 2px, and because it is a transform the
              wordmark stays where it is. */}
          <Icon
            icon={File01Icon}
            size={24}
            className="shrink-0 -translate-x-0.5"
          />
          {/* The wordmark and its count stay on the tighter 8px gap — the 12
              belongs to the icon column, not to the words. */}
          <span className="flex items-center gap-2">Notes</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Filled, not outlined. It used to wear the same border, radius,
              padding and hover as the three filter chips beside it — the one
              thing worth pressing was dressed as passive chrome. */}
          <button
            type="button"
            // `icon-side padding = text-side padding - 2px`. An icon does not
            // fill its box the way a letter fills its line, so equal padding
            // reads as a button pushed left: the plus sits in 18px of slack
            // while "note" ends flush on its own stem. The 2px comes off the
            // icon side, not onto the text side, so the button keeps its width
            // and its right edge stays on the wells' outer edge.
            className={`${t.radiusInner} ${t.solid} ${t.solidHover} flex items-center gap-1.5 py-2 pr-3.5 pl-3 text-[15px] font-semibold transition-colors`}
          >
            <Icon icon={Add01Icon} size={18} />
            Add note
          </button>
        </div>
      </header>

      {/* ONE CONTENT COLUMN AT 16px.
          Nothing here sets 16 directly. Every left edge is a *sum* of the
          paddings above it, which is why changing any single one silently
          drags one element off the column while the others stay put:

            row marks   body `p-2` (8)   + row `px-2` (8)   = 16
            header      `px-4` (16)                          = 16
            footer      nav `px-1` (4)   + tab `px-3` (12)  = 16

          The right edge closes the same way: the header's `px-4` and the
          footer's 4 + 12 both stop 16 short of the card, which is where the
          wells' own content stops too.

          Two glyph nudges sit on top of that, because a box on the column is
          not the same as ink on the column. Tabler insets the document 4px
          from its box and the circle only 2, so the logo carries
          `-translate-x-0.5` to give back the difference. The nav's list icon
          is drawn at 20px, not 24, which lands it within a fraction of the
          circle's 2px — close enough to leave alone. */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-2">
        <div className="flex items-end justify-end gap-2">
          <Segmented />
        </div>

        {GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            {group.tasks.map((task) => (
              <TaskRow key={task.title} task={task} />
            ))}
          </div>
        ))}
      </div>

      <TabBar />
    </div>
  );
}
