import { Expand, Pi, Profile } from "@hugeicons/core-free-icons";
import BottomFilterBar from "./components/learning02/BottomFilterBar";
import DetachableAccordion from "./components/learning02/DetachableAccordion";
import EbayCategoryTicker from "./components/learning02/EbayCategoryTicker";
import InlineOverflow from "./components/learning02/InlineOverflow";
import MorphingButton from "./components/learning02/MorphingButton";
import MusicPlayer from "./components/learning02/MusicPlayer";
import OnboardingStepIndicator from "./components/learning02/OnboardingStepIndicator";
import ProfileCard from "./components/learning02/ProfileCard";
import TravelCardBooking from "./components/learning02/TravelCardBooking";
import TravelCard from "./components/TravelCard";
import RAGPipelineSetup from "./Emil-course/RAGPipelineSetup";
import BuyMeaCoffeeButton from "./components/learning02/BuyMeaCoffeeButton";
import MotionValueBasics from "./Emil-course/hooks/MotionValueBasics";
import Accordion from "./UI-Component/Acoordion";
import PerspectiveScroll from "./Learn from Oliver/PerspectiveScroll";
import GravityDropReveal from "./Learn from Oliver/GravityDropReveal";
import TimeLineScroll from "./Learn from Oliver/TimeLineScroll";
import CarotShape from "./CSS Tips/CarotShape";
import AnimateBackdropBlur from "./CSS Tips/AnimateBackdropBlur";
import StudioTeamSection from "./Learn from Oliver/StudioTeamSection";
import PostImageMorph from "./Learn from Oliver/PostImageMorph";
import RippleInputDemo from "./components/ripple-input/RippleInputDemo";
import TeletypeClock from "./components/TeleType";
import ScrollTeletypeClock from "./components/teletype/ScrollTeletypeClock";
import PerspectiveTeletypeClock from "./components/teletype/PerspectiveTeletypeClock";
import EasingControlBar from "./components/teletype/EasingControlBar";
import { TransitionConfigProvider } from "./components/teletype/TransitionConfigContext";
import StageTransitionCard from "./components/StageTransitionCard";
import HotelStackFanCard from "./components/HotelStackFanCard";
import FrostedModal from "./components/FrostedModal";
import SimpleBlurNav from "./components/SimpleBlurNav";
import StickyFrostedNav from "./components/StickyFrostedNav";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Search01Icon,
  Compass01Icon,
  Notification01Icon,
  Message01Icon,
  Bookmark01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import {
  MarkerFilters,
  TranslucentHighlighter,
  WobblyHighlighter,
  ImperfectHighlighter,
  ScribbleFillHighlighter,
  WetInkHighlighter,
} from "./CSS Tips/SlantedHighlighter";
import PixelCard from "./CSS Tips/PixelCard";
import ThemeMorphMenu from "./components/learning02/ThemeMorphMenu";
import AlertDialogVariants from "./components/alert-dialog/AlertDialogVariants";
import ShareInteraction from "./components/ShareInteraction";
import DeleteButton from "./components/DeleteButton";
import ChatUI from "./components/learning02/ChatUI";
import ExpandingImageGallery from "./components/learning02/ExpandingImageGallery";
import FamilyDrawer from "./Emil-course/FamilyDrawer";
import AddTask from "./components/AddTask";

const DEMO_NAV_ITEMS = [
  { label: "Home", icon: Home01Icon },
  { label: "Search", icon: Search01Icon },
  { label: "Explore", icon: Compass01Icon },
  { label: "Notifications", icon: Notification01Icon },
  { label: "Messages", icon: Message01Icon },
  { label: "Saved", icon: Bookmark01Icon },
  { label: "Profile", icon: UserIcon },
];

export default function Home() {
  return (
    <div className="">
      <AddTask />
    </div>
  );
}
