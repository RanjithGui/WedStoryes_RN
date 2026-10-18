import { AureliaHero } from "@/components/ui/aurelia-hero-f";
import { assetUri } from "@/components/web/ui";
import { useRouter } from "expo-router";
import Head from "expo-router/head";
import { ArrowRight, X } from "lucide-react";
import React, { useEffect, useState } from "react";

const REEL = require("../assets/videos/bgvideo.mp4");

const STEPS = [
  {
    title: "Pick the occasion",
    body: "Start a wedding, engagement, birthday or any custom event — each one keeps its own quotation.",
  },
  {
    title: "Plan the coverage",
    body: "Add sub-events like Haldi or Reception with dates, photographers, videographers and add-ons.",
  },
  {
    title: "Client & pricing",
    body: "Enter your client's details, the package price and discount, and fine-tune your terms.",
  },
  {
    title: "Share the quotation",
    body: "Preview a branded, watermarked quotation and save it as a PDF in one click.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [reelOpen, setReelOpen] = useState(false);

  useEffect(() => {
    if (!reelOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setReelOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reelOpen]);

  // The hero renders plain <a href> links; turn same-site ones into
  // client-side navigations so the store and bundle aren't reloaded.
  const onClickCapture = (e: React.MouseEvent) => {
    const href = (e.target as HTMLElement).closest("a")?.getAttribute("href");
    if (!href?.startsWith("/")) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    router.navigate(href as "/homepage");
  };

  return (
    <div
      className="min-h-screen w-full bg-[#07070a] font-sans text-[#f3ece2]"
      onClickCapture={onClickCapture}
    >
      <Head>
        <title>WedStoryes · Capture your perfect moments</title>
      </Head>

      <AureliaHero
        brand="WedStoryes"
        titleStart="Capture your"
        titleEnd="perfect moments"
        tagline="Professional photography and videography for weddings, events and special occasions."
        paragraph="From haldi to reception, plan every sub-event, crew and add-on — then hand your clients a polished quotation in minutes."
        navLinks={[
          { label: "How it works", href: "#how" },
          { label: "Your events", href: "/homepage" },
        ]}
        ctaLabel="Create a quotation"
        ctaHref="/homepage"
        reelLabel="Watch the reel"
        reelMeta="WedStoryes · Showreel"
        onReelClick={() => setReelOpen(true)}
        frameCode="WED—001"
        coordinates="Weddings · Events · Films"
        studioNote="Photography & films for weddings and celebrations"
        exploreLabel="See how it works"
        exploreHref="#how"
      />

      <section
        id="how"
        aria-label="How it works"
        className="scroll-mt-8 border-t border-white/10 px-5 py-24 md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.35em] text-white/45">
            (02) — How it works
          </p>
          <h2 className="max-w-3xl font-serif text-[length:clamp(2rem,4.4vw,3.75rem)] leading-[1.05] tracking-[-0.02em]">
            Four steps from enquiry to{" "}
            <em className="text-[#ecd0ac]">signed quotation</em>.
          </h2>

          <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-3 bg-[#0b0a10] p-7">
                <span className="font-serif text-4xl text-[#c89b3c]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/55">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-20 flex flex-col items-start justify-between gap-8 rounded-2xl border border-[#c89b3c]/30 bg-gradient-to-br from-[#c89b3c]/15 via-transparent to-transparent p-8 md:flex-row md:items-center md:p-12">
            <div>
              <h3 className="font-serif text-3xl md:text-4xl">
                Ready to quote your next celebration?
              </h3>
              <p className="mt-2 text-white/60">
                Everything is saved in your browser — pick up where you left off.
              </p>
            </div>
            <a
              href="/homepage"
              className="group inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#c89b3c] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#b6882b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7a46c]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070a]"
            >
              Create a quotation
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-white/40 md:px-10">
        © {new Date().getFullYear()} The WedStoryes
      </footer>

      {reelOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Showreel"
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setReelOpen(false)}
        >
          <button
            type="button"
            aria-label="Close showreel"
            onClick={() => setReelOpen(false)}
            className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
          <video
            src={assetUri(REEL)}
            autoPlay
            controls
            playsInline
            className="max-h-[85vh] w-full max-w-5xl rounded-xl bg-black shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
