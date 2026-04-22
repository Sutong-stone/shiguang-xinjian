import Navigation from "@/components/custom/Navigation";
import HeroSection from "@/sections/HeroSection";
import GallerySection from "@/sections/GallerySection";
import MessagesSection from "@/sections/MessagesSection";
import TimelineSection from "@/sections/TimelineSection";
import FooterSection from "@/sections/FooterSection";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#FFF8F0" }}>
      <Navigation />
      <main>
        <HeroSection />
        <GallerySection />
        <TimelineSection />
        <MessagesSection />
        <FooterSection />
      </main>
    </div>
  );
}
