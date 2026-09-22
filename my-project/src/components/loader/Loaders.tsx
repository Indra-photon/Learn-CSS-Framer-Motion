/* Twelve orbital loaders, each a small 3D scene. All motion and geometry
 * live in loader.css; these components only compose the parts (plane →
 * orbit → carrier → sphere) and hand each repeated piece its index via
 * `--_i` / `--_j`, so CSS derives delay, angle, radius and hue from one
 * number. Every loader takes `size` (px), `accent` (the sun colour),
 * `className` and `label`, and announces itself as a status region. */

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SwarmLoader, NebulaDustLoader } from "./CanvasLoaders";

export type LoaderProps = {
  size?: number;
  accent?: string;
  className?: string;
  label?: string;
};

type Vars = CSSProperties & Record<`--${string}`, string | number>;

function Root({
  variant,
  size,
  accent,
  className,
  label = "Loading",
  children,
}: LoaderProps & { variant: string; children: ReactNode }) {
  const style: Vars = {};
  if (size) style["--ldr-size"] = `${size}px`;
  if (accent) style["--ldr-sun"] = accent;
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("ldr", `ldr--${variant}`, className)}
      style={style}
    >
      {children}
    </span>
  );
}

const idx = (i: number, j?: number): Vars =>
  (j === undefined ? { "--_i": i } : { "--_i": i, "--_j": j }) as Vars;

function times(n: number, render: (i: number) => ReactNode) {
  return Array.from({ length: n }, (_, i) => render(i));
}

/* A body parked at the centre of the current plane, facing the camera. */
const Sun = ({ className }: { className?: string }) => (
  <span className="ldr__carrier">
    <span className={cn("ldr__sun", className)} />
  </span>
);

/* A spinning orbit with an optional trail and one sphere at radius --r. */
const Orbit = ({
  kepler,
  trail = true,
  style,
}: {
  kepler?: boolean;
  trail?: boolean;
  style?: Vars;
}) => (
  <span className={cn("ldr__orbit", kepler && "ldr__orbit--kepler")} style={style}>
    {trail && <span className="ldr__trail" />}
    <span className="ldr__carrier">
      <span className="ldr__sphere" />
    </span>
  </span>
);

export function OrbitLoader(p: LoaderProps) {
  return (
    <Root variant="orbit" {...p}>
      <span className="ldr__plane">
        <Sun className="ldr__sun--pulse" />
        <Orbit kepler />
      </span>
    </Root>
  );
}

export function SolarLoader(p: LoaderProps) {
  return (
    <Root variant="solar" {...p}>
      <span className="ldr__plane">
        <Sun className="ldr__sun--pulse" />
        <Orbit kepler />
        <Orbit />
        <Orbit />
      </span>
    </Root>
  );
}

export function EllipseLoader(p: LoaderProps) {
  return (
    <Root variant="ellipse" {...p}>
      <span className="ldr__plane">
        <span className="ldr__guide" />
        <span className="ldr__focus">
          <span className="ldr__sun ldr__sun--pulse" />
        </span>
        {times(4, (i) => (
          <span key={i} className="ldr__path" style={idx(i)}>
            <span className="ldr__sphere" />
          </span>
        ))}
      </span>
    </Root>
  );
}

export function CometLoader(p: LoaderProps) {
  return (
    <Root variant="comet" {...p}>
      <span className="ldr__plane">
        <Sun />
        {times(5, (i) => (
          <Orbit key={i} kepler trail={i === 0} style={idx(i)} />
        ))}
      </span>
    </Root>
  );
}

export function BinaryLoader(p: LoaderProps) {
  return (
    <Root variant="binary" {...p}>
      <span className="ldr__plane">
        <span className="ldr__ring" />
        {times(2, (i) => (
          <span key={i} className="ldr__orbit">
            <span className="ldr__trail" />
            <span className="ldr__carrier">
              <span className="ldr__sun" />
            </span>
          </span>
        ))}
      </span>
    </Root>
  );
}

export function DiffuseLoader(p: LoaderProps) {
  return (
    <Root variant="diffuse" {...p}>
      <span className="ldr__plane">
        <span className="ldr__ring" />
        <Sun className="ldr__sun--pulse" />
        {times(10, (i) => (
          <span key={i} className="ldr__carrier ldr__carrier--arm" style={idx(i)}>
            <span className="ldr__sphere" />
          </span>
        ))}
      </span>
    </Root>
  );
}

export function NebulaLoader(p: LoaderProps) {
  return (
    <Root variant="nebula" {...p}>
      <span className="ldr__plane">
        {times(3, (i) => (
          <span key={i} className="ldr__ring" style={idx(i)} />
        ))}
        <Sun className="ldr__sun--pulse" />
      </span>
    </Root>
  );
}

export function AtomLoader(p: LoaderProps) {
  return (
    <Root variant="atom" {...p}>
      {times(3, (i) => (
        <span key={i} className="ldr__plane" style={idx(i)}>
          <span className="ldr__ring" />
          {i === 0 && <Sun className="ldr__sun--pulse" />}
          <Orbit />
        </span>
      ))}
    </Root>
  );
}

export function SaturnLoader(p: LoaderProps) {
  return (
    <Root variant="saturn" {...p}>
      <span className="ldr__plane">
        <span className="ldr__band" />
        <span className="ldr__carrier">
          <span className="ldr__sphere ldr__body" />
        </span>
        {times(8, (i) => (
          <Orbit key={i} trail={false} style={idx(i)} />
        ))}
      </span>
    </Root>
  );
}

export function MeteorLoader(p: LoaderProps) {
  return (
    <Root variant="meteor" {...p}>
      <span className="ldr__sky">
        {times(11, (i) => (
          <span key={i} className="ldr__carrier ldr__carrier--arm" style={idx(i)}>
            <span className="ldr__streak" />
          </span>
        ))}
      </span>
    </Root>
  );
}

export function EclipseLoader(p: LoaderProps) {
  return (
    <Root variant="eclipse" {...p}>
      <span className="ldr__corona" />
      <span className="ldr__plane">
        <Sun className="ldr__sun--pulse" />
        <Orbit trail={false} />
      </span>
    </Root>
  );
}

export function GalaxyLoader(p: LoaderProps) {
  return (
    <Root variant="galaxy" {...p}>
      <span className="ldr__plane">
        <span className="ldr__bulge" />
        <span className="ldr__orbit">
          {times(4, (i) => (
            <span key={i} className="ldr__arm" style={idx(i)}>
              {times(3, (j) => (
                <span key={j} className="ldr__carrier" style={idx(i, j)}>
                  <span className="ldr__sphere" />
                </span>
              ))}
            </span>
          ))}
        </span>
      </span>
    </Root>
  );
}

/* Registry for galleries and pickers. Order is roughly calm → busy; the two
 * canvas fields come last. */
export const LOADERS = [
  { id: "orbit", name: "Orbit", note: "One planet on a tilted plane, trailing light. Passes behind the sun for real.", Component: OrbitLoader },
  { id: "solar", name: "Solar system", note: "Three coplanar orbits at Kepler periods, each body its own hue.", Component: SolarLoader },
  { id: "ellipse", name: "Ellipse", note: "Eccentric orbit with the sun at one focus — fast at perihelion, slow out wide.", Component: EllipseLoader },
  { id: "comet", name: "Comet", note: "A hot head, a long light trail, and sparks shed behind it.", Component: CometLoader },
  { id: "binary", name: "Binary", note: "Two suns of different colours sharing one orbit.", Component: BinaryLoader },
  { id: "diffuse", name: "Diffuse", note: "Particles born at the core and thrown out across the plane.", Component: DiffuseLoader },
  { id: "nebula", name: "Nebula", note: "Gradient rings breathing outward while slowly turning.", Component: NebulaLoader },
  { id: "atom", name: "Atom", note: "Three shells on different axes, an electron on each.", Component: AtomLoader },
  { id: "saturn", name: "Saturn", note: "A banded ring turning around a gradient body that occludes it.", Component: SaturnLoader },
  { id: "meteor", name: "Meteor", note: "A starfield rushing at the camera.", Component: MeteorLoader },
  { id: "eclipse", name: "Eclipse", note: "A moon crossing the face of a glowing sun.", Component: EclipseLoader },
  { id: "galaxy", name: "Galaxy", note: "Spiral arms of particles falling toward a bright bulge.", Component: GalaxyLoader },
  { id: "swarm", name: "Swarm belt", note: "Seventy asteroid-like particles on a flattened ellipse. Canvas.", Component: SwarmLoader },
  { id: "nebula-dust", name: "Nebula dust", note: "A soft particle cloud condensing toward the centre. Canvas.", Component: NebulaDustLoader },
] as const;
