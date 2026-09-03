import MobileFrame from "@/components/designs/Notes/MobileFrame";
import Notes from "@/components/designs/Notes/Note";
import StackedTowerDials from "@/components/designs/StackedTower/StackedTowerDials";

export default function DesignsPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center gap-16 p-8">
      <StackedTowerDials className="w-full max-w-5xl bg-stone-400" />

      <MobileFrame>
        {/* The card fills the screen and carries its own footer, so there is
            no longer a band of screen background between the list and the
            navigation. */}
        <Notes className="min-h-0 flex-1" />
      </MobileFrame>
    </div>
  );
}
