import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Church, 
  BookOpen, 
  HeartHandshake, 
  Compass, 
  ArrowRight,
  Target,
  Eye
} from "lucide-react";

interface ValueItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const VALUES: ValueItem[] = [
  {
    icon: Church,
    title: "Anglican Faith",
    description: "Firmly rooted in Christ through liturgical worship, Holy Scripture, and historic Anglican fellowship.",
  },
  {
    icon: HeartHandshake,
    title: "Vibrant Community",
    description: "Walking alongside families, youths, and congregations through pastoral care and mutual fellowship.",
  },
  {
    icon: BookOpen,
    title: "Biblical Teaching",
    description: "Equipping clergy and disciples with sound doctrine and practical Christian education.",
  },
  {
    icon: Compass,
    title: "Holistic Outreach",
    description: "Transforming lives through church-founded schools, medical centers, clean water, and community care.",
  },
];

const AboutSection = () => {
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
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="about" 
      className="py-16 lg:py-20 bg-gradient-to-b from-church-cream/30 via-white to-white overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div 
          className={`max-w-2xl mx-auto text-center mb-12 sm:mb-14 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <span className="text-xs uppercase tracking-widest text-church-gold font-bold">
            Who We Are
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-church-navy tracking-tight mt-1.5 mb-3">
            About Our Diocese
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-church-charcoal/75 leading-relaxed">
            The Anglican Church of Rwanda Shyogwe Diocese serves across the Southern Province, 
            with its diocesan headquarters in Muhanga District (Mucyakabiri).
          </p>
        </div>

        {/* 4 Core Pillar Cards (Luminous & Light - No heavy dark blocks) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {VALUES.map((val, idx) => (
            <div
              key={idx}
              style={{ transitionDelay: `${idx * 100}ms` }}
              className={`bg-white rounded-xl p-5 border border-church-cream shadow-xs hover:shadow-md hover:border-church-gold/40 transition-all duration-500 ease-out group hover:-translate-y-1 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {/* Luminous, light icon container */}
              <div className="w-11 h-11 rounded-lg bg-church-cream/80 text-church-navy flex items-center justify-center mb-3.5 group-hover:bg-church-gold group-hover:text-church-navy transition-colors duration-300">
                <val.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-church-navy tracking-tight mb-1.5 group-hover:text-church-gold transition-colors">
                {val.title}
              </h3>
              <p className="text-xs text-church-charcoal/70 leading-relaxed">
                {val.description}
              </p>
            </div>
          ))}
        </div>

        {/* History & Vision / Mission Combined Card */}
        <div 
          className={`bg-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-church-cream shadow-soft transition-all duration-700 delay-300 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left: Diocesan Story */}
            <div className="lg:col-span-7">
              <span className="text-xs font-semibold uppercase tracking-wider text-church-gold">
                Heritage & Witness
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-church-navy tracking-tight mt-1 mb-3.5">
                Our History & Ministry
              </h3>
              <p className="text-xs sm:text-sm text-church-charcoal/75 leading-relaxed mb-3">
                Since its establishment, the Shyogwe Diocese has stood as a pillar of faith, hope, and compassion throughout Muhanga, Kamonyi, Ruhango, and surrounding districts.
              </p>
              <p className="text-xs sm:text-sm text-church-charcoal/75 leading-relaxed mb-5">
                Generations of faithful Christians, clergy, and teachers have partnered to build churches, educate children, and care for the sick, leaving an enduring legacy of Christian discipleship.
              </p>

              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-church-gold hover:text-church-navy transition-colors group"
              >
                <span>Read Full Diocesan Story</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Right: Vision & Mission (Clean Light Aesthetic) */}
            <div className="lg:col-span-5 bg-church-cream/40 rounded-xl p-5 sm:p-6 border border-church-cream/80 space-y-4">
              {/* Vision */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-white text-church-gold flex items-center justify-center flex-shrink-0 shadow-xs border border-church-cream">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-church-navy">
                    Our Vision
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-church-charcoal/85 mt-0.5 italic">
                    "Holy Soul in a Healthy Body"
                  </p>
                </div>
              </div>

              <div className="border-t border-church-cream/80" />

              {/* Mission */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-md bg-white text-church-navy flex items-center justify-center flex-shrink-0 shadow-xs border border-church-cream">
                  <Target className="h-4 w-4 text-church-gold" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-church-navy">
                    Our Mission
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-church-charcoal/85 mt-0.5 italic">
                    "A self-reliant, self-replicating, and self-sustaining diocese."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;