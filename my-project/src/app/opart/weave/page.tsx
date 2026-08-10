import WeaveGrid from "../../components/opart/WeaveGrid";

export default function WeavePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-8">
      <div className="w-full max-w-[640px]">
        <WeaveGrid />
      </div>
    </main>
  );
}
