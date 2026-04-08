import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import TechStack from "@/components/TechStack";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import LiveRaceSection from "@/components/LiveRaceSection";

export default function Home() {
  return (
    <main className="bg-bg text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <LiveRaceSection />
      <TechStack />
      <CTA />
      <Footer />
    </main>
  );
}
