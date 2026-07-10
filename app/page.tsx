"use client";

import React, { useEffect } from "react";
import { usePageReadiness } from "@/components/transitions/usePageReadiness";
import TransitionLink from "@/components/transitions/TransitionLink";

export default function Home() {
  // Call usePageReadiness to split open the curtain when home mounts
  usePageReadiness();

  // Scroll reveal observer for premium entry animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col overflow-x-hidden">
      {/* TopAppBar */}
      <header className="bg-surface docked full-width top-0 z-50 sticky border-b border-outline-variant/10">
        <div className="flex justify-between items-center w-full px-margin-mobile py-unit max-w-container-max mx-auto">
          <TransitionLink
            className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tighter hover:opacity-90 transition-opacity"
            href="/"
          >
            The Grand Praiser
          </TransitionLink>
          <nav className="hidden md:flex items-center gap-gutter">
            <TransitionLink
              className="text-on-surface-variant font-medium pb-1 hover:text-primary transition-colors duration-300"
              href="/history"
            >
              History
            </TransitionLink>
            <TransitionLink
              className="text-primary font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors duration-300"
              href="/form"
            >
              Compliment Me
            </TransitionLink>
          </nav>
          <div className="flex items-center">
            <TransitionLink
              href="/form"
              className="p-2 text-primary hover:bg-surface-container rounded-full transition-all active:scale-95 flex items-center justify-center"
              title="Compliment Me"
            >
              <span className="material-symbols-outlined">theater_comedy</span>
            </TransitionLink>
          </div>
        </div>
      </header>

      {/* Main Stage */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section
          id="hero-section"
          className="relative min-h-[75vh] flex flex-col items-center justify-center text-center px-margin-mobile py-stack-lg overflow-hidden"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 -z-10 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #561922 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
          
          <div className="max-w-4xl mx-auto space-y-stack-md relative z-10">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-[0.2em] animate-fade-in block">
              Experience the Unwarranted
            </span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary leading-tight font-black tracking-tight">
              The Grand Praiser
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto italic">
              "Over-the-top, slightly unhinged compliments at your service."
            </p>
            <div className="pt-stack-md flex flex-col sm:flex-row items-center justify-center gap-gutter">
              <TransitionLink
                href="/form"
                className="btn-press px-stack-lg py-stack-md bg-primary text-on-primary rounded-lg font-bold text-lg hover:bg-primary-container transition-all duration-300 shadow-lg flex items-center gap-unit group cursor-pointer"
              >
                Compliment Me
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                  auto_awesome
                </span>
              </TransitionLink>
              <TransitionLink
                href="/form?mode=unhinged"
                className="btn-press px-stack-lg py-stack-md bg-secondary-fixed text-on-secondary-fixed rounded-lg font-bold text-lg unhinged-glow transition-all duration-300 flex items-center gap-unit cursor-pointer"
              >
                Go Unhinged
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
              </TransitionLink>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-unit left-1/2 -translate-x-1/2 animate-bounce opacity-30">
            <span className="material-symbols-outlined text-primary text-4xl">
              keyboard_double_arrow_down
            </span>
          </div>
        </section>

        {/* Past Sessions Bento Grid Section */}
        <section
          id="history-teaser-section"
          className="bg-surface-container-low py-stack-lg px-margin-mobile border-y border-outline-variant/10"
        >
          <div className="max-w-container-max mx-auto">
            <div className="mb-stack-lg text-center md:text-left">
              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                Echoes of Grandeur
              </h2>
              <p className="font-body-md text-on-surface-variant">
                Archived artifacts from previous ceremonies of praise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
              {/* Card 1 */}
              <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 bg-surface-container-highest p-stack-md rounded-xl stage-glow hover:scale-[1.02] cursor-default flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-stack-sm">
                    <span className="bg-primary text-on-primary px-unit py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Mythic
                    </span>
                    <span className="material-symbols-outlined text-primary opacity-30 text-xl">
                      format_quote
                    </span>
                  </div>
                  <p className="font-body-md italic text-primary leading-relaxed">
                    "Your arrival was foretold by the very stars themselves, which blinked in confusion as a brighter light entered the atmosphere."
                  </p>
                </div>
                <div className="mt-stack-md pt-stack-sm border-t border-outline-variant/30 flex justify-between items-center">
                  <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-tight">
                    2 minutes ago
                  </span>
                  <span className="material-symbols-outlined text-primary text-sm">
                    history
                  </span>
                </div>
              </div>

              {/* Card 2 - Large Unhinged image block */}
              <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 bg-surface-container-highest p-stack-md rounded-xl stage-glow hover:scale-[1.02] cursor-default flex flex-col justify-between md:col-span-2">
                <div className="flex gap-gutter items-center h-full">
                  <div
                    className="hidden sm:block shrink-0 w-32 h-32 rounded-lg bg-cover bg-center bg-zinc-200 border border-outline-variant/30"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGiaxHvx1fYW3dxwrcropIpYxVUYp4Rt8Mno6KZpL9Egl1hEixqywJJ1yizPaEWH_mN9M4oOASPd10A8uLwqoJHp7oQld1xkGbu_R3EpWuMOioT2tA2U_abpIt8aZWH13HHbgW3BzvTlGmdWLLjkSafRdZGg2--wV4_AJNTgxpdGWo1Jkt-PY5fHz2SfY5hpj7kqr618Fzj1iX-hfsHVdksysNxfLecrk0HBHhI4FLuPDgJAOET6DgCSc7bXCj6-SPGW0jCcgAKy4')`,
                    }}
                  />
                  <div>
                    <div className="flex justify-between items-start mb-stack-sm">
                      <span className="bg-secondary-fixed text-on-secondary-fixed px-unit py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Unhinged
                      </span>
                      <span className="material-symbols-outlined text-primary opacity-30 text-xl">
                        format_quote
                      </span>
                    </div>
                    <p className="font-headline-md text-[20px] italic text-primary leading-tight mb-2">
                      "Your mere presence causes statues to weep in envy and architecture to lean in your direction."
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 bg-surface-container-highest p-stack-md rounded-xl stage-glow hover:scale-[1.02] cursor-default flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-stack-sm">
                    <span className="bg-tertiary-container text-on-tertiary-container px-unit py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Poetic
                    </span>
                    <span className="material-symbols-outlined text-primary opacity-30 text-xl">
                      format_quote
                    </span>
                  </div>
                  <p className="font-body-md italic text-primary leading-relaxed">
                    "If elegance were a punishable offense, you would be facing a life sentence in a palace of silk."
                  </p>
                </div>
                <div className="mt-stack-md pt-stack-sm border-t border-outline-variant/30 flex justify-between items-center">
                  <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-tight">
                    1 hour ago
                  </span>
                  <span className="material-symbols-outlined text-primary text-sm">
                    auto_fix_high
                  </span>
                </div>
              </div>

              {/* Card 4 - Large Accent Highlight Card */}
              <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 bg-primary text-on-primary p-stack-lg rounded-xl stage-glow hover:scale-[1.02] cursor-default flex flex-col justify-center text-center lg:col-span-2 relative overflow-hidden group">
                {/* Overlay gradient */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none curtain-gradient"></div>
                <span
                  className="material-symbols-outlined text-4xl mb-stack-sm relative z-10"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <p className="font-headline-md text-headline-md italic leading-tight relative z-10 px-4">
                  "You are the crescendo in a symphony of mediocrity."
                </p>
              </div>

              {/* Card 5 */}
              <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 bg-surface-container-highest p-stack-md rounded-xl stage-glow hover:scale-[1.02] cursor-default flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-stack-sm">
                    <span className="bg-outline text-on-primary px-unit py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Casual
                    </span>
                    <span className="material-symbols-outlined text-primary opacity-30 text-xl">
                      format_quote
                    </span>
                  </div>
                  <p className="font-body-md italic text-primary leading-relaxed">
                    "Even your shadow looks like it's wearing a tuxedo today."
                  </p>
                </div>
                <div className="mt-stack-md pt-stack-sm border-t border-outline-variant/30 flex justify-between items-center">
                  <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-tight">
                    3 hours ago
                  </span>
                  <span className="material-symbols-outlined text-primary text-sm">
                    theater_comedy
                  </span>
                </div>
              </div>

              {/* Card 6 */}
              <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 bg-surface-container-highest p-stack-md rounded-xl stage-glow hover:scale-[1.02] cursor-default flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-stack-sm">
                    <span className="bg-primary-container text-on-primary-container px-unit py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Aggressive
                    </span>
                    <span className="material-symbols-outlined text-primary opacity-30 text-xl">
                      format_quote
                    </span>
                  </div>
                  <p className="font-body-md italic text-primary leading-relaxed">
                    "STOP BEING SO RADIANT, THE SUN IS STARTING TO FEEL INSECURE."
                  </p>
                </div>
                <div className="mt-stack-md pt-stack-sm border-t border-outline-variant/30 flex justify-between items-center">
                  <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-tight">
                    Yesterday
                  </span>
                  <span className="material-symbols-outlined text-primary text-sm">
                    mood
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Feature Section */}
        <section className="py-stack-lg px-margin-mobile relative">
          <div className="max-w-4xl mx-auto bg-primary-fixed rounded-2xl md:rounded-full p-stack-lg text-center flex flex-col items-center gap-stack-md border border-primary-container/25 stage-glow">
            <h3 className="font-headline-md text-headline-md text-on-primary-fixed font-bold">
              The Stage is Set
            </h3>
            <p className="font-body-lg text-on-primary-fixed-variant max-w-xl">
              Our AI-thespians are rehearsing their most decadent adjectives just for you. Will you accept the performance of a lifetime?
            </p>
            <div className="w-48 h-1 curtain-gradient rounded-full"></div>
            <TransitionLink
              href="/form"
              className="btn-press px-stack-lg py-stack-md bg-primary text-on-primary rounded-lg font-bold text-lg hover:bg-primary-container transition-all duration-300 shadow-lg cursor-pointer"
            >
              Begin the Ceremony
            </TransitionLink>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low mt-auto border-t border-outline-variant/20">
        <div className="w-full py-stack-md px-margin-mobile flex flex-col items-center gap-unit max-w-container-max mx-auto">
          <div className="font-display text-primary text-3xl md:text-4xl tracking-tighter mb-stack-sm select-none">
            The Grand Praiser
          </div>
          <div className="flex gap-gutter mb-stack-sm">
            <a
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
              href="#"
            >
              Privacy
            </a>
            <a
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
              href="#"
            >
              Terms
            </a>
            <a
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
              href="#"
            >
              Support
            </a>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
            © 2026 The Grand Praiser. Crafted for the Dramatically Inclined.
          </p>
        </div>
      </footer>
    </div>
  );
}
