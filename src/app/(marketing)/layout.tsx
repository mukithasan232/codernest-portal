import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisitorTracker from "@/components/analytics/VisitorTracker";
import BehavioralTrigger from "@/components/analytics/BehavioralTrigger";
import ClientChatbot from "@/components/ui/ClientChatbot";
import GoogleAdSense from "@/components/ads/GoogleAdSense";

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
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ClientChatbot />
    </>
  );
}

