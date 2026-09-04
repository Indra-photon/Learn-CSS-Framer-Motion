import WellnessCompany from "@/components/sections/Wellness-Company/Hero/Wellnesscompany";
import MeetMotion from "@/components/sections/Wellness-Company/Hero/Meetmotion";
import NodeQ from "@/components/sections/Wellness-Company/Hero/NodeQ";
import Conduit from "@/components/sections/Wellness-Company/Hero/Condult";
import Vesper from "@/components/sections/Wellness-Company/Hero/Vesper";

export default function LandingPage() {
  return (
    <main className="w-full">
      <section id="wellness" className="min-h-screen w-full">
        <WellnessCompany />
      </section>
      <section id="motion" className="min-h-screen w-full">
        <MeetMotion />
      </section>
      <section id="nodeq" className="min-h-screen w-full">
        <NodeQ />
      </section>
      <section id="conduit" className="min-h-screen w-full">
        <Conduit />
      </section>
      <section id="vesper" className="min-h-screen w-full">
        <Vesper />
      </section>
    </main>
  );
}
