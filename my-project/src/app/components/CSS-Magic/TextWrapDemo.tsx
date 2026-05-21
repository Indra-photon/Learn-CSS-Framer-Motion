import { IconX, IconCheck } from "@tabler/icons-react";

interface ColProps {
  label: string;
  muted?: boolean;
  icon: React.ReactNode;
  balanced: boolean;
}

function Col({ label, muted = false, icon, balanced }: ColProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      <p
        className="text-[22px] text-stone-900 font-serif text-center leading-snug max-w-[200px]"
        style={{ textWrap: balanced ? "balance" : "initial" }}
      >
        Design is how it works, not how it looks
      </p>
      <span
        className={`flex items-center gap-2 text-[12px] tracking-tight select-none ${
          muted ? "text-stone-700" : "text-stone-900"
        }`}
      >
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            muted ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {icon}
        </span>
        <span className="ml-1">{label}</span>
      </span>
    </div>
  );
}

export default function TextWrapDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2EE] px-6">
      <div className="bg-[#EDE9E3] border border-[#D4CEC5] rounded-sm px-16 py-12 flex items-center gap-20">

        <Col
          label="without text-wrap"
          muted
          icon={<IconX size={13} strokeWidth={1.5} aria-hidden />}
          balanced={false}
        />

        <div className="w-px h-18 bg-[#E2DDD7]" />

        <Col
          label="with text-wrap: balance"
          icon={<IconCheck size={13} strokeWidth={1.5} aria-hidden />}
          balanced={true}
        />

      </div>
    </div>
  );
}