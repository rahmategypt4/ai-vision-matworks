"use client";

import { Bike, Watch, Camera, Smartphone, Sofa, Guitar, ShoppingBag, Package } from "lucide-react";
import { useLanguage } from "@/components/language-context";

const COLLAGE_TILES: { icon: typeof Bike; bg: string; rotate: string }[] = [
  { icon: Bike, bg: "#FDE7C8", rotate: "-rotate-3" },
  { icon: Watch, bg: "#E8F1F8", rotate: "rotate-2" },
  { icon: Camera, bg: "#F4E4E8", rotate: "-rotate-2" },
  { icon: Smartphone, bg: "#E7F4EC", rotate: "rotate-3" },
  { icon: Sofa, bg: "#FBE9D9", rotate: "rotate-1" },
  { icon: Guitar, bg: "#E9E6F4", rotate: "-rotate-1" },
  { icon: ShoppingBag, bg: "#FEF3D6", rotate: "rotate-2" },
  { icon: Package, bg: "#E4F0F6", rotate: "-rotate-3" },
];

export function Hero() {
  const { t } = useLanguage();
  return (
    <section id="top" className="relative overflow-hidden" style={{ background: "var(--amz-hero-bg)" }}>
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14 grid md:grid-cols-2 gap-8 items-center">
        {/* Copy */}
        <div className="order-2 md:order-1">
          <p className="text-sm font-semibold tracking-wide uppercase mb-2" style={{ color: "var(--amz-accent)" }}>
            {t.hero.eyebrow}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {t.hero.title1}
            <br />
            {t.hero.title2}
          </h1>
          <p className="mt-3 text-sm md:text-base text-[#d5dbe1] max-w-md">
            {t.hero.subtitle}
          </p>
          <a
            href="#identify"
            className="inline-flex mt-5 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02]"
            style={{ background: "var(--amz-accent)", color: "var(--amz-navy)" }}
          >
            {t.hero.cta}
          </a>
        </div>

        {/* Collage */}
        <div className="order-1 md:order-2">
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {COLLAGE_TILES.map(({ icon: Icon, bg, rotate }, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center shadow-sm transition-transform hover:scale-105 ${rotate}`}
                style={{ background: bg }}
              >
                <Icon className="h-7 w-7 md:h-9 md:w-9" style={{ color: "var(--amz-navy-light)" }} strokeWidth={1.5} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-10"
        style={{
          background: "var(--amz-bg)",
          clipPath: "ellipse(60% 100% at 50% 100%)",
        }}
      />
    </section>
  );
}
