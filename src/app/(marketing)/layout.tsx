import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatbot from "@/components/ui/AIChatbot";
import VisitorTracker from "@/components/analytics/VisitorTracker";
import BehavioralTrigger from "@/components/analytics/BehavioralTrigger";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <VisitorTracker />
      <BehavioralTrigger />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <AIChatbot />
    </>
  );
}

