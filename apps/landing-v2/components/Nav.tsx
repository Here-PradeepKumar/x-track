"use client";
import { useEffect, useState } from "react";

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? "bg-ink/95 backdrop-blur-xl border-b border-rule" : ""
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-6 xl:px-12 h-[68px] flex items-center justify-between">
        {/* Wordmark */}
        <a href="#" className="flex items-center gap-1 group select-none">
          <span className="font-display text-[22px] tracking-[0.12em] text-white group-hover:text-lime transition-colors duration-200">
            X—TRACK
          </span>
        </a>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-10">
          {[["Platform", "#platform"], ["How It Works", "#process"], ["Apps", "#apps"], ["Download", "#download"]].map(
            ([l, h]) => (
              <a
                key={l}
                href={h}
                className="text-[13px] font-body font-medium text-mist hover:text-white transition-colors duration-150 tracking-wide"
              >
                {l}
              </a>
            )
          )}
        </nav>

        {/* CTA */}
        <a
          href="#download"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-lime text-ink text-[13px] font-body font-bold rounded-full hover:bg-lime-dim active:scale-95 transition-all duration-150"
        >
          Get X-Track
        </a>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
          aria-label="Menu"
        >
          <span className={`w-5 h-[2px] bg-white rounded transition-all duration-250 origin-center ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`w-5 h-[2px] bg-white rounded transition-all duration-250 ${open ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`w-5 h-[2px] bg-white rounded transition-all duration-250 origin-center ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-ink-2 border-b border-rule ${open ? "max-h-64" : "max-h-0"}`}>
        <div className="px-6 py-5 flex flex-col gap-5">
          {[["Platform", "#platform"], ["How It Works", "#process"], ["Apps", "#apps"]].map(([l, h]) => (
            <a key={l} href={h} onClick={() => setOpen(false)} className="text-base font-body text-mist hover:text-white transition-colors">{l}</a>
          ))}
          <a href="#download" onClick={() => setOpen(false)} className="w-full text-center py-3 bg-lime text-ink font-body font-bold rounded-full text-sm">
            Get X-Track
          </a>
        </div>
      </div>
    </header>
  );
}
