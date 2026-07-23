import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import MarketSnapshot from "../components/landing/MarketSnapshot";
import ProductPreview from "../components/landing/ProductPreview";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />
      <MarketSnapshot />
      <ProductPreview />
    </main>
  );
}