import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import TrustedBy from "@/components/sections/TrustedBy";
import WhyCommunicationFails from "@/components/sections/WhyCommunicationFails";
import HowProParThinks from "@/components/sections/HowProParThinks";
import InteractiveWorkflow from "@/components/sections/InteractiveWorkflow";
import ProductPreview from "@/components/sections/ProductPreview";
import CrossPlatform from "@/components/sections/CrossPlatform";
import ChromeExtensionDemo from "@/components/sections/ChromeExtensionDemo";
import PrivacyFirst from "@/components/sections/PrivacyFirst";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Pricing from "@/components/sections/Pricing";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <TrustedBy />
        <WhyCommunicationFails />
        <HowProParThinks />
        <InteractiveWorkflow />
        <ProductPreview />
        <CrossPlatform />
        <ChromeExtensionDemo />
        <PrivacyFirst />
        <Testimonials />
        <FAQ />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
