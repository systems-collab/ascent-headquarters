import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AboutAscent } from "@/components/landing/about-ascent";
import { Footer } from "@/components/layout/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <AboutAscent />
      <Footer />
    </>
  );
}
