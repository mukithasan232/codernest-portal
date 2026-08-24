import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatbot from "@/components/ui/AIChatbot";
import VisitorTracker from "@/components/analytics/VisitorTracker";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <VisitorTracker />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <AIChatbot />
    </>
  );
}
