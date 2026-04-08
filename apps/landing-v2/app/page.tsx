import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Stats from "@/components/Stats";
import AppShowcase from "@/components/AppShowcase";
import Process from "@/components/Process";
import Download from "@/components/Download";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-ink text-white overflow-x-hidden">
      <Nav />
      <Hero />
      <Marquee />
      <Stats />
      <AppShowcase />
      <Process />
      <Download />
      <Footer />
    </main>
  );
}
