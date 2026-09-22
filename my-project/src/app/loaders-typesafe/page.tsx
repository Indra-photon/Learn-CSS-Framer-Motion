import LoaderGallery from "@/components/loader/LoaderGallery";
import { SIZES } from "@/components/loader/sizes";

export const metadata = { title: "Orbital loaders" };

/* `?theme=light&size=16` seeds the gallery controls so a state can be linked
 * or screenshotted without clicking. */
export default async function LoadersPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; size?: string }>;
}) {
  const { theme, size } = await searchParams;
  const n = Number(size);
  return (
    <LoaderGallery
      initialDark={theme !== "light"}
      initialSize={(SIZES as readonly number[]).includes(n) ? (n as (typeof SIZES)[number]) : 96}
    />
  );
}
