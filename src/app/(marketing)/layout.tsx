import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisitorTracker from "@/components/analytics/VisitorTracker";
import BehavioralTrigger from "@/components/analytics/BehavioralTrigger";
import ClientChatbot from "@/components/ui/ClientChatbot";
import GoogleAdSense from "@/components/ads/GoogleAdSense";
import AdBanner from "@/components/shared/AdBanner";
import PopunderAd from "@/components/shared/PopunderAd";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GoogleAdSense />
      <VisitorTracker />
      <BehavioralTrigger />
      
      {/* Smartlink Popunder (triggers once per session on click) */}
      <PopunderAd url="https://stretchadjoiningperspective.com/ph44b72zz?key=26144d2accfe95891d2f0d1b4138ae76" />
      
      <Navbar />
      <main className="flex-grow">{children}</main>
      
      {/* Monetization Ad Banner injected at the bottom of every public page */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AdBanner />
      </div>

      <Footer />
      <ClientChatbot />
    </>
  );
}

