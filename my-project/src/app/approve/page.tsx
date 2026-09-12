import ApproveSwitch from "@/components/blocks/ApproveSwitch";
import HeroRoster from "@/components/blocks/HeroRoster";
import FeedbackSwitch from "@/components/blocks/FeedbackSwitch";
import SubscribeBar from "@/components/blocks/SubscribeBar";
import ProfileGate from "@/components/blocks/ProfileGate";

/* Each interaction is bounded by its own panel rather than a viewport-sized
 * stage, so several can be read side by side and compared. */
function Panel({
  label,
  hint,
  className,
  bodyClassName,
  children,
}: {
  label: string;
  hint: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    /* Deliberately NOT a <section>: globals.css carries an unlayered
       `section { min-height: 100vh; display: grid; place-items: center }`
       left over from the CornerShape demo. Unlayered rules outrank Tailwind's
       @layer utilities, so a <section> here silently becomes a 100vh centred
       grid and every child shrink-wraps. <article> is the right semantics for
       a self-contained study anyway. */
    <article
      className={`overflow-hidden rounded-3xl border border-black/[0.07] bg-white ${className ?? ""}`}
    >
      <header className="flex items-baseline justify-between gap-4 border-b border-black/[0.06] px-5 py-3">
        <h2 className="text-body font-semibold tracking-tight text-[#0b0b0b]">{label}</h2>
        <p className="text-caption whitespace-nowrap text-[#0b0b0b]/45">{hint}</p>
      </header>
      <div className={`flex items-center justify-center ${bodyClassName ?? "min-h-[300px]"}`}>
        {children}
      </div>
    </article>
  );
}

export default function ApprovePage() {
  return (
    <div className="min-h-dvh bg-[#f6f5f3] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="text-title mb-6 tracking-tight text-balance text-[#0b0b0b]/70">
          Motion studies
        </h1>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Panel label="Approve / Reject" hint="layout morph · confetti">
            <ApproveSwitch />
          </Panel>

          <Panel label="Feedback" hint="layout morph · popLayout">
            <FeedbackSwitch />
          </Panel>

          <Panel
            label="Subscribe"
            hint="double morph · async · validation"
            className="lg:col-span-2"
          >
            <SubscribeBar />
          </Panel>

          <Panel
            label="Profile gate"
            hint="arc FLIP · PIN · handover"
            className="lg:col-span-2"
            bodyClassName="h-[700px]"
          >
            <ProfileGate />
          </Panel>

          <Panel
            label="Roster → Dossier"
            hint="layoutId · blur in flight"
            className="lg:col-span-2"
            bodyClassName="h-[420px]"
          >
            <HeroRoster />
          </Panel>
        </div>
      </div>
    </div>
  );
}
