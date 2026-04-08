"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg/90 backdrop-blur-md border-b border-outline/30"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <span className="text-2xl font-display font-black tracking-tight text-white group-hover:text-lime transition-colors duration-200">
            X<span className="text-lime">—</span>TRACK
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            ["Features", "#features"],
            ["How It Works", "#how-it-works"],
            ["For Athletes", "#athletes"],
            ["For Organizers", "#organizers"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-body font-medium text-on-surface-variant hover:text-white transition-colors duration-200 tracking-wide"
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#download"
            className="px-5 py-2 text-sm font-body font-semibold bg-lime text-bg rounded-full hover:bg-lime-dim transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Get the App
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-bg/95 backdrop-blur-md border-b border-outline/30 ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {[
            ["Features", "#features"],
            ["How It Works", "#how-it-works"],
            ["For Athletes", "#athletes"],
            ["For Organizers", "#organizers"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-body font-medium text-on-surface-variant hover:text-white transition-colors py-1"
            >
              {label}
            </a>
          ))}
          <a
            href="#download"
            onClick={() => setMenuOpen(false)}
            className="mt-2 w-full text-center px-5 py-3 text-sm font-body font-semibold bg-lime text-bg rounded-full"
          >
            Get the App
          </a>
        </div>
      </div>
    </header>
  );
}
