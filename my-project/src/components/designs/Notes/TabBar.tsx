/**
 * TabBar — the screen's navigation, as a floating pill.
 *
 * `px-1` is not a loose choice: a tab carries its own `px-3`, so 4 + 12 puts
 * the icon box on the same 16 the row marks sit on. Change either number and
 * the footer leaves the column — see the table in Note.tsx.
 *
 * It sits inside the card, at the bottom, as the counterpart to the header.
 * It used to float on the screen background below the card as its own pill,
 * which made the navigation a separate object from the thing it navigates —
 * and left a band of grey between them that belonged to neither.
 *
 * Padding is 4 + 12, the same split the card uses, so the selected tab's icon
 * starts on the 16px column the header icon and the status marks are already
 * on. It was 8 + 12, which put the nav 4px off that line — the one element on
 * the screen not sharing the edge. The border went with it: 1px is enough to
 * push the whole row off again, and the shadow already separates the bar from
 * the screen behind it.
 *
 * Every tab is named. The selected one keeps the 15px semibold it wears
 * inside its filled pill; the other three take `body` — 13px, the size their
 * colour already puts them at.
 *
 * The four only fit because the unselected tabs drop to `px-2`. At `px-3`
 * across the board the row measures ~360px against the ~350px it has, and the
 * tabs would touch. The asymmetry is not a fudge: the selected tab is a filled
 * pill and needs the inset to keep its label off its own edge, while an
 * unselected tab is bare text where the padding is only spacing. The first tab
 * is the selected one, so its `px-3` is what holds the icon column — that
 * number cannot move.
 *
 * Server component: no hooks, no client directives.
 */

import {
  Calendar01Icon,
  CheckListIcon,
  InboxIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import Icon from "./icon";

import { t } from "./tokens";

const TABS = [
  { label: "Tasks", icon: CheckListIcon },
  { label: "Calendar", icon: Calendar01Icon },
  { label: "Inbox", icon: InboxIcon },
  { label: "Profile", icon: UserIcon },
];

export default function TabBar({ className = "" }: { className?: string }) {
  return (
    <nav
      // Inside the card now, so it is a footer, not an object: no fill of its
      // own, no elevation, no radius. What it keeps is a divider — the same
      // 1px line the header draws, mirrored to point up — so the screen reads
      // as chrome / content / chrome instead of a list with a lid at one end.
      // `px-4` puts the first tab's icon on the same column as the header icon
      // and the row marks once its own `px-3` is added.
      className={`flex shrink-0 items-center justify-between gap-1 px-2 py-2 shadow-[0_-1px_0_0_oklch(93%_0.004_264)] ${className}`}
    >
      {TABS.map(({ label, icon }, i) => {
        const selected = i === 0;
        return (
          <button
            key={label}
            type="button"
            aria-label={label}
            className={`${t.shadowMove} flex items-center justify-center gap-1.5 ${t.radiusInner} py-2 ${
              selected
                ? `${t.solid} px-3 text-[15px] font-semibold`
                : "px-2 text-[13px] font-normal text-[oklch(62%_0.012_264)] hover:bg-[oklch(97%_0.003_264)]"
            }`}
          >
            <Icon icon={icon} size={20} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
