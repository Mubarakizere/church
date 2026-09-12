import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, GraduationCap, Heart, Crown, MapPin } from "lucide-react";

interface LoadingStatsProps {
  onComplete: () => void;
}

const LoadingStats = ({ onComplete }: LoadingStatsProps) => {
  const [currentStat, setCurrentStat] = useState(0);
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [isComplete, setIsComplete] = useState(false);

  const stats = [
    {
      icon: Crown,
      label: "Bishop & Leadership",
      value: 1,
      color: "text-church-red",
      bgColor: "bg-church-red/10"
    },
    {
      icon: Building,
      label: "Archdeacons",
      value: 6,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: Users,
      label: "Parishes",
      value: 45,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: GraduationCap,
      label: "Schools",
      value: 12,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Heart,
      label: "Active Projects",
      value: 25,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      icon: MapPin,
      label: "Communities Served",
      value: 150,
      color: "text-teal-600",
      bgColor: "bg-teal-100"
    }
  ];

  useEffect(() => {
    const animateStats = () => {
      const duration = 800; // Animation duration per stat
      const steps = 50; // Number of animation steps
      const stepDuration = duration / steps;

      stats.forEach((stat, index) => {
        setTimeout(() => {
          setCurrentStat(index);
          
          let step = 0;
          const increment = stat.value / steps;
          
          const timer = setInterval(() => {
            step++;
            const currentValue = Math.min(Math.round(increment * step), stat.value);
            
            setAnimatedValues(prev => {
              const newValues = [...prev];
              newValues[index] = currentValue;
              return newValues;
            });

            if (step >= steps) {
              clearInterval(timer);
              
              // If this is the last stat, mark as complete
              if (index === stats.length - 1) {
                setTimeout(() => {
                  setIsComplete(true);
                  setTimeout(() => {
                    onComplete();
                  }, 1000);
                }, 500);
              }
            }
          }, stepDuration);
        }, index * (duration + 200)); // Stagger each stat animation
      });
    };

    // Start animation after a brief delay
    const startTimer = setTimeout(animateStats, 500);
    
    return () => clearTimeout(startTimer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-church-red/5 via-white to-church-red/10 flex items-center justify-center z-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6">
            <img 
              src="/logo for chuch.jpg" 
              alt="Anglican Church of Rwanda, Shyogwe Diocese" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-church-red mb-4">
            Anglican Church of Rwanda
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
            Shyogwe Diocese
          </h2>
          <p className="text-muted-foreground">
            Loading our ministry statistics...
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className={`shadow-soft transition-all duration-500 transform ${
                currentStat >= index ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
              } ${isComplete ? 'hover:shadow-elegant hover:scale-105' : ''}`}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${stat.bgColor} rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-bold ${stat.color} mb-2 transition-all duration-300`}>
                  {animatedValues[index]}
                  {stat.value > 50 && animatedValues[index] === stat.value ? '+' : ''}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {isComplete && (
          <div className="text-center mt-12 animate-fade-in">
            <div className="inline-flex items-center space-x-2 text-church-red">
              <div className="w-2 h-2 bg-church-red rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold">Welcome to our ministry</span>
              <div className="w-2 h-2 bg-church-red rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Loading Progress Bar */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-church-red h-2 rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${((currentStat + 1) / stats.length) * 100}%` 
              }}
            ></div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {isComplete ? 'Complete!' : `Loading... ${Math.round(((currentStat + 1) / stats.length) * 100)}%`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingStats;
