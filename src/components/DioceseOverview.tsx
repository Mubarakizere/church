import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

interface OverviewStat {
  target: number;
  suffix?: string;
  label: string;
  detail: string;
  href?: string;
  linkText?: string;
}

const STATS: OverviewStat[] = [
  {
    target: 6,
    label: "Archdeaconries",
    detail: "Pastoral administration across Shyogwe, Gitarama, Hanika, Nyamagana, Ndiza, and Nyarugenge.",
    href: "/team",
    linkText: "View Archdeacons",
  },
  {
    target: 45,
    label: "Parishes",
    detail: "Local Anglican parishes and worship congregations serving families and Christians every Sunday.",
    href: "/services",
    linkText: "Parish Services",
  },
  {
    target: 38,
    label: "Diocesan Schools",
    detail: "Providing nursery, primary, secondary boarding, and technical vocational (TSS) education.",
    href: "/schools",
    linkText: "Explore Schools",
  },
  {
    target: 7,
    label: "Health Facilities",
    detail: "3 accredited Health Centers and 4 Health Posts delivering medical care to surrounding communities.",
    href: "/projects",
    linkText: "Health Facilities",
  },
  {
    target: 150,
    suffix: "+",
    label: "Communities Served",
    detail: "Rural and urban villages reached through clean water, agricultural support, and community development.",
    href: "/projects",
    linkText: "Diocesan Impact",
  },
];

const StatItem = ({
  stat,
  index,
  isVisible,
}: {
  stat: OverviewStat;
  index: number;
  isVisible: boolean;
}) => {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const duration = 1400 + index * 100;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth ease-out cubic curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.floor(easeOut * stat.target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayCount(stat.target);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible, stat.target, index]);

  return (
    <div
      style={{
        transitionDelay: `${index * 120}ms`,
      }}
      className={`flex flex-col justify-between pt-5 sm:pt-0 sm:border-l sm:border-church-cream/80 sm:pl-6 first:border-l-0 first:pl-0 transition-all duration-700 ease-out transform ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"
      }`}
    >
      <div>
        <div className="text-4xl sm:text-5xl font-extrabold text-church-navy tracking-tight font-serif tabular-nums flex items-baseline">
          <span>{displayCount}</span>
          {stat.suffix && (
            <span className="text-church-gold font-sans font-bold text-3xl sm:text-4xl ml-0.5">
              {stat.suffix}
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-church-navy mt-1.5 tracking-tight">
          {stat.label}
        </h3>
        <p className="text-xs text-church-charcoal/75 leading-relaxed mt-2">
          {stat.detail}
        </p>
      </div>

      {stat.href && (
        <div className="mt-4 pt-3 border-t border-church-cream/60">
          <Link
            to={stat.href}
            className="inline-flex items-center gap-1 text-xs font-semibold text-church-gold hover:text-church-navy transition-colors group"
          >
            <span>{stat.linkText}</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

const DioceseOverview = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-white border-b border-church-cream/90 py-12 lg:py-16 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header (Paragraph removed as requested) */}
        <div className="pb-6 mb-8 border-b border-church-cream/80">
          <span className="text-xs uppercase tracking-widest text-church-gold font-bold">
            The Diocese at a Glance
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-church-navy tracking-tight mt-1.5">
            Faith, Education & Community Healthcare
          </h2>
        </div>

        {/* Animated Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {STATS.map((stat, index) => (
            <StatItem
              key={stat.label}
              stat={stat}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DioceseOverview;
