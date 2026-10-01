import { useState, useEffect } from "react";

interface SiteLoaderProps {
  onLoaded?: () => void;
}

const SiteLoader = ({ onLoaded }: SiteLoaderProps) => {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Quick, smooth 0.7s load transition
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 650);

    const removeTimer = setTimeout(() => {
      setLoading(false);
      if (onLoaded) onLoaded();
    }, 1000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onLoaded]);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-church-cream transition-opacity duration-500 ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="text-center px-4">
        {/* Church Logo with gentle pulsing ring */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-church-gold animate-ping opacity-25"></div>
          <img
            src="/logo for chuch.jpg"
            alt="Anglican Church of Rwanda, Shyogwe Diocese Logo"
            className="w-full h-full object-contain rounded-full border-2 border-church-navy p-0.5 shadow-soft bg-white relative z-10"
          />
        </div>

        {/* Church Name & Diocese */}
        <h2 className="text-lg md:text-xl font-extrabold text-church-navy tracking-tight mb-1">
          ANGLICAN CHURCH OF RWANDA
        </h2>
        <p className="text-xs md:text-sm font-bold text-church-gold tracking-widest uppercase mb-6">
          Shyogwe Diocese
        </p>

        {/* Minimal Progress Bar */}
        <div className="w-36 h-1 bg-church-navy/15 rounded-full mx-auto overflow-hidden relative">
          <div className="h-full bg-church-gold rounded-full animate-loader-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default SiteLoader;
