import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

// Custom TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z"/>
  </svg>
);

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Custom Instagram icon component
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// Custom Facebook icon component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const SocialMediaSection = () => {
  const socialMediaLinks = [
    {
      platform: "X (Twitter)",
      handle: "@SDiocese63071",
      url: "https://twitter.com/SDiocese63071",
      icon: XIcon,
      color: "bg-black hover:bg-gray-800",
      description: "Follow us for daily updates and inspirational messages"
    },
    {
      platform: "Instagram", 
      handle: "dioceseshyogwe",
      url: "https://instagram.com/dioceseshyogwe",
      icon: InstagramIcon,
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      description: "See our community in action through photos and stories"
    },
    {
      platform: "Facebook",
      handle: "EAR Shyogwe Diocese (Page)",
      url: "https://facebook.com/EARShyogweDiocese",
      icon: FacebookIcon,
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Join our community discussions and events"
    },
    {
      platform: "TikTok",
      handle: "@ear.shyogwe.diocese",
      url: "https://tiktok.com/@ear.shyogwe.diocese",
      icon: TikTokIcon,
      color: "bg-black hover:bg-gray-800",
      description: "Watch our creative content and ministry moments"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-church-red mb-4">
            Connect With Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay connected with our diocese community through social media. 
            Follow us for updates, inspiration, and fellowship.
          </p>
        </div>

        {/* Social Media Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {socialMediaLinks.map((social, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${social.color} rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110`}>
                  <social.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {social.platform}
                </h3>
                <p className="text-sm text-church-red font-medium mb-3">
                  {social.handle}
                </p>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  {social.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-church-red group-hover:text-white group-hover:border-church-red transition-all duration-300"
                  onClick={() => window.open(social.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Follow
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Join Our Digital Community
            </h3>
            <p className="text-muted-foreground mb-6">
              Be part of our growing online family. Share your faith journey, 
              connect with fellow believers, and stay updated with all our activities.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {socialMediaLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="hover:bg-church-red hover:text-white hover:border-church-red transition-all duration-300"
                  onClick={() => window.open(social.url, '_blank')}
                >
                  <social.icon className="h-4 w-4 mr-2" />
                  {social.platform}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaSection;
