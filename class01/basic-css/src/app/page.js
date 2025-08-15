import Image from "next/image";
import Container from "./container";
import Navbar from "./Navbar";
import Hero from "./Hero";

export default function Home() {
  return (
    <div className="layout">
      <Container>
        <div className="left-line" />
        <Navbar />
        <Hero />
      </Container>
      <div className="hero-img-comtainer">
        <img src="/hero-ui-v5.webp" alt="Hero Image" className="hero-img" />
      </div>
    </div>
  );
}
