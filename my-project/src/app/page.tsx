import InsightCard from "@/components/blocks/insight-card";
import WorkflowPipeline from "@/components/blocks/workflow-pipeline";

export default function Home() {
  return (
    <div>
      <WorkflowPipeline />
      {/* Cool neutral surround: the card's palette is entirely warm, so the
          canvas is where the temperature contrast comes from. oklch(0.86 0.008 250). */}
      <section
        className="flex justify-center px-6 py-20"
        style={{ background: "#CDD1D6" }}
      >
        <InsightCard />
      </section>
    </div>
  );
}
