import NotesCard from "@/components/designs/Notes/Note";
import Notes from "@/components/designs/Notes/Note";
import StackedTowerDials from "@/components/designs/StackedTower/StackedTowerDials";

export default function DesignsPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center gap-16 p-8">
      <StackedTowerDials className="w-full max-w-5xl bg-stone-400" />

      <NotesCard />
    </div>
  );
}
