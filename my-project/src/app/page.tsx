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

export default function Home() {
  return (
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
        <ComparisonShowcase
            title="I rebuilt this interaction 3 times until it felt right"
            description="See the difference motion design makes in user experience"
            
            beforeComponent={<ShareInteractionBefore />}
            afterComponent={<ShareInteraction />}
            
            beforeHeading="without motion"
            afterHeading="with motion"

            beforeFooter=""
            afterFooter=""
        />

        <AddTask />
    </div>
  )
}
