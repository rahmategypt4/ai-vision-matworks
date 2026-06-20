import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { PageContent } from "@/components/page-content";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <PageContent />
    </div>
  );
}
