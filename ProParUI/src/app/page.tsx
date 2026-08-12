import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { Features } from "@/components/sections/Features";
import { Workflow } from "@/components/sections/Workflow";
import { ProductPreview } from "@/components/sections/ProductPreview";
import { UseCases } from "@/components/sections/UseCases";
import { ExtensionDemo } from "@/components/sections/ExtensionDemo";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { Pricing } from "@/components/sections/Pricing";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <TrustedBy />
        <Problem />
        <Solution />
        <Features />
        <Workflow />
        <ProductPreview />
        <UseCases />
        <ExtensionDemo />
        <Testimonials />
        <FAQ />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
