import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Search01Icon,
  Compass01Icon,
  Notification01Icon,
  Message01Icon,
  Bookmark01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

const NAV_ITEMS = [
  { label: "Home", icon: Home01Icon },
  { label: "Search", icon: Search01Icon },
  { label: "Explore", icon: Compass01Icon },
  { label: "Notifications", icon: Notification01Icon },
  { label: "Messages", icon: Message01Icon },
  { label: "Saved", icon: Bookmark01Icon },
  { label: "Profile", icon: UserIcon },
];

export default function SimpleBlurNav() {
  return (
    <div className="h-28 w-64 overflow-y-auto">
      {/* Just a plain sticky header with backdrop-blur — no mask-image
          fade and no edge-highlight layer, for comparison. */}
      <header className="sticky top-0 z-2 w-full p-4 backdrop-blur-[3px]" />

      <nav className="flex flex-col gap-0.5 px-2 pb-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-black/80"
          >
            <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.8} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
