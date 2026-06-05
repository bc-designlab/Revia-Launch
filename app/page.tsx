import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Interaction from "@/components/Interaction";
import UseCases from "@/components/UseCases";
import ComingSoon from "@/components/ComingSoon";
import Footer from "@/components/Footer";
import Background from "@/components/Background";
import { WaitlistProvider } from "@/components/WaitlistContext";

export default function Page() {
  return (
    <WaitlistProvider>
      <main className="relative min-h-[100dvh] overflow-hidden">
        <Background />
        <Nav />
        <Hero />
        <Features />
        <Interaction />
        <UseCases />
        <ComingSoon />
        <Footer />
      </main>
    </WaitlistProvider>
  );
}
