import { IconX, IconCheck, IconBrandTwitter } from "@tabler/icons-react";

interface ColProps {
  label: string;
  muted?: boolean;
  icon: React.ReactNode;
  offset: number;
}

function Col({ label, muted = false, icon, offset }: ColProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      <span
        className="font-serif text-[22px] text-stone-900 underline decoration-stone-900 inline-flex items-center gap-2"
        style={{ textUnderlineOffset: `${offset}px` }}
      >
        Follow me on{" "}
        <IconBrandTwitter size={28} strokeWidth={1.5} aria-hidden className="inline-block align-middle" />
      </span>
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

export default function UnderlineOffsetDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2EE] px-6">
      <div className="bg-[#EDE9E3] border border-[#D4CEC5] rounded-sm px-16 py-12 flex items-center gap-20">

        <Col
          label="without underline-offset"
          muted
          icon={<IconX size={13} strokeWidth={1.5} aria-hidden />}
          offset={2}
        />

        <div className="w-px h-18 bg-[#E2DDD7]" />

        <Col
          label="with underline-offset"
          icon={<IconCheck size={13} strokeWidth={1.5} aria-hidden />}
          offset={8}
        />

      </div>
    </div>
  );
}