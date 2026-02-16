import Hero from "./components/Hero";
import Feature from "./components/Feature";
import Card from "./components/Card";
import { Grid } from "./components/Grid";
import Component from "./components/Component";
import SVGComponent from "./components/SVGComponent";
import { SVGLine } from "./components/SVGLine";
import BentoGrid from "./components/BentoGrid";
import AnimatedCard from "./components/AnimatedCard";
import Dashboard from "./components/Dashboard";
import ProfileCard from "./components/ProfileCard";
import LayoutAnimation from "./components/LayoutAnimation";
import ProductCard from "./components/ProductCard";
import DeleteButton from "./components/DeleteButton";
import CartButton from "./components/CartButton";
import SVGRotation from "./components/SVGRotation";
import AnimatedProfileCards from "./components/AnimatedProfileCards";
import ImageGrid from "./components/ImageGrid";
import SearchButtonDemo from "./components/SearchButtonDemo";
import { Share } from "next/font/google";
import ShareInteraction, {ShareInteractionBefore} from "./components/ShareInteraction";
import ComparisonShowcase from "./components/ComparisonShowcase";
import AddTask from "./components/AddTask";
import InviteAnimation from "./components/InviteAnimation";
import FlowerMenu from "./components/FlowerMenu";
import DynamicIslandClock from "./components/Dynamic-Island/DynamicIslandClock";
import Link from "next/link";
import CounterAnimation from "./components/CounterAnimation";

export default function Home() {
  return (
    <div className="">
      <nav className="w-full p-4 flex justify-center bg-gray-800 text-white mb-8">
        <Link href="/" className="mx-4 hover:underline">Home</Link>
        <div className="relative group">
          <Link href="/Emil-course" className="mx-4 hover:underline">
            Emil's Course
          </Link>
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-40 bg-white text-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-auto group-hover:pointer-events-auto transition-opacity z-10">
            <ul>
              {["01", "02", "03"].map((item) => (
          <li key={item}>
            <Link href={`/Emil-course/${item}`} className="block px-4 py-2 hover:bg-gray-100">
              {item}
            </Link>
          </li>
              ))}
            </ul>
          </div>
        </div>
        <Link href="/contact" className="mx-4 hover:underline">Contact</Link>
      </nav>
      <div className=" min-h-screen w-screen mx-auto flex flex-col items-center justify-center">
       {/* <Hero /> */}
       {/* <Feature /> */}
       {/* <Card /> */}
        {/* <Grid /> */}
        {/* <Component /> */}
        {/* <SVGComponent /> */}
        {/* <SVGLine /> */}
        {/* <BentoGrid /> */}
        {/* <AnimatedCard /> */}
        {/* <Dashboard /> */}
        {/* <ProfileCard /> */}
        {/* <LayoutAnimation /> */}
        {/* <ProductCard /> */}
        {/* <DeleteButton /> */}
        {/* <CartButton /> */}
        {/* <SVGRotation /> */}
        {/* <AnimatedProfileCards /> */}
        {/* <ImageGrid /> */}
        {/* <SearchButtonDemo /> */}
        {/* <ShareInteraction /> */}
        {/* <ComparisonShowcase
            title="I rebuilt this interaction 3 times until it felt right"
            description="See the difference motion design makes in user experience"
            
            beforeComponent={<ShareInteractionBefore />}
            afterComponent={<ShareInteraction />}
            
            beforeHeading="without motion"
            afterHeading="with motion"

            beforeFooter=""
            afterFooter=""
        /> */}

        {/* <AddTask /> */}
        {/* <InviteAnimation /> */}
        {/* <FlowerMenu /> */}
        {/* <DynamicIslandClock /> */}
        <CounterAnimation />
      </div>
    </div>
  )
}
