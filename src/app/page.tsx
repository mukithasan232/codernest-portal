import Hero from "@/components/sections/Hero";
import ServicesPreview from "@/components/sections/ServicesPreview";
import PortfolioPreview from "@/components/sections/PortfolioPreview";
import Testimonials from "@/components/sections/Testimonials";
import PricingPreview from "@/components/sections/PricingPreview";

export default function Home() {
  return (
    <div className="flex flex-col gap-0">
      <Hero />
      <ServicesPreview />
      <PortfolioPreview />
      <Testimonials />
      <PricingPreview />

      {/* Final CTA Section */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Ready to Build Something <br /> Extraordinary?
          </h2>
          <p className="text-blue-100 text-lg mb-12 max-w-2xl mx-auto">
            Join 50+ successful companies that have transformed their digital presence with CoderNest.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="px-10 py-5 rounded-2xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-all text-lg shadow-xl">
              Schedule a Free Consultation
            </button>
            <button className="text-white font-bold hover:underline text-lg">
              View Our Process
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
