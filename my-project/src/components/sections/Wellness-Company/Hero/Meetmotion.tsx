/**
 * Meet Motion — poetic minimal design-studio hero
 * React + TailwindCSS
 *
 * A huge thin/heavy display headline on a faint gridded canvas, with a floating
 * wildflower-meadow island below and portfolio-style corner labels.
 *
 * SETUP:
 *  - Place the island image at:  /Images/motion-island.png
 *    (image has a white background; it's blended into the near-white canvas)
 *  - Font: Inter
 */
export default function MeetMotion() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#fbfbfb] p-10 font-sans antialiased">
      {/* faint engineering grid, masked to a soft vignette */}
      <div
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(120%_90%_at_50%_45%,#000_55%,transparent_90%)] opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(#e9e9e9 1px,transparent 1px),linear-gradient(90deg,#e9e9e9 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* corner labels */}
      <div className="absolute top-10 left-11 text-[13px] leading-snug font-medium text-[#8a8a8a]">
        Minimal
        <br />
        Design
        <br />
        Practice
      </div>
      <div className="absolute top-10 right-11 text-[13px] font-medium text-[#b4b4b4] italic">
        Meet Motion
      </div>

      {/* center stage */}
      <div className="relative z-[2] mx-auto max-w-[620px] pt-[clamp(60px,12vh,130px)] text-center">
        <div className="relative inline-block text-[clamp(20px,3vw,30px)] font-medium text-[#9a9a9a]">
          Let&rsquo;s finish
          <span className="absolute top-0.5 -right-4 h-[9px] w-[9px] rounded-full bg-[#2f6bff] shadow-[0_0_0_4px_rgba(47,107,255,0.18)]" />
        </div>
        <h1 className="leading-[0.92] tracking-tight">
          <span className="block text-[clamp(30px,4.4vw,48px)] font-light text-[#8f8f8f]">
            the
          </span>
          <span className="block text-[clamp(52px,9vw,104px)] font-extrabold text-[#141414]">
            unfinished
          </span>
          <span className="block text-[clamp(52px,9vw,104px)] font-extrabold text-[#141414]">
            task.
          </span>
        </h1>

        {/* hand-drawn arrow bridging headline -> island */}
        <svg
          className="absolute top-1/2 right-[16%] z-[3] h-[120px] w-[130px]"
          viewBox="0 0 140 130"
          fill="none"
        >
          <path
            d="M120 8 C 128 46, 96 84, 58 108"
            stroke="#2b2b2b"
            strokeWidth="2"
            strokeDasharray="4 7"
            strokeLinecap="round"
          />
          <path d="M66 98 L52 112 L70 116 Z" fill="#2b2b2b" />
        </svg>

        {/* floating meadow island (transparent PNG) */}
        <img
          src="/Images/motion-island.png"
          alt="A floating island of wildflower meadow"
          className="mx-auto mt-6 w-[min(600px,82vw)]"
        />
      </div>

      {/* footer corners */}
      <div className="absolute bottom-12 left-11 text-[15px] leading-tight font-semibold text-[#3a3a3a]">
        Strategy
        <br />
        Design
        <br />
        Technology
      </div>
      <div className="absolute bottom-12 left-[34%] text-[12.5px] leading-normal">
        <div className="font-semibold text-[#3a3a3a]">Whatsapp me</div>
        <div className="text-[#8a8a8a]">hello@meetmotion.studio</div>
        <div className="text-[#8a8a8a]">+1 000 000 0000</div>
      </div>
      <div className="absolute right-11 bottom-12 text-[13px] font-medium text-[#3a3a3a]">
        &#9707; Save for later
      </div>
    </div>
  );
}
