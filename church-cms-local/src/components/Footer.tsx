import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Youtube, Mail, ExternalLink } from "lucide-react";

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

const Footer = () => {
  return (
    <footer className="bg-church-red text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Church Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src="/logo for chuch.jpg"
                  alt="Anglican Church of Rwanda, Shyogwe Diocese Logo"
                  className="w-12 h-12 object-contain rounded-full"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">ANGLICAN CHURCH OF RWANDA</h3>
                <p className="text-sm opacity-80">SHYOGWE DIOCESE</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              A welcoming Anglican community committed to faith, fellowship, and service.
              Join us as we worship together and grow in Christ.
            </p>

            {/* Social Media Links */}
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Follow Us</h5>
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-auto text-white hover:bg-white/20"
                  onClick={() => window.open('https://twitter.com/SDiocese63071', '_blank')}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-auto text-white hover:bg-white/20"
                  onClick={() => window.open('https://instagram.com/dioceseshyogwe', '_blank')}
                >
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-auto text-white hover:bg-white/20"
                  onClick={() => window.open('https://facebook.com/EARShyogweDiocese', '_blank')}
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-auto text-white hover:bg-white/20"
                  onClick={() => window.open('https://tiktok.com/@ear.shyogwe.diocese', '_blank')}
                >
                  <TikTokIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button variant="outline" size="sm" className="text-black border-black hover:bg-church-red hover:text-white" onClick={() => window.location.href = '/admin'}>
              Admin Login
            </Button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <nav className="space-y-2">
              <a href="#home" className="block text-sm opacity-80 hover:opacity-100 hover:text-church-red transition-colors">
                Home
              </a>
              <a href="#about" className="block text-sm opacity-80 hover:opacity-100 hover:text-church-red transition-colors">
                About Us
              </a>
              <a href="#services" className="block text-sm opacity-80 hover:opacity-100 hover:text-church-red transition-colors">
                Services
              </a>
              <a href="#events" className="block text-sm opacity-80 hover:opacity-100 hover:text-church-red transition-colors">
                Events
              </a>
              <a href="#contact" className="block text-sm opacity-80 hover:opacity-100 hover:text-church-red transition-colors">
                Contact
              </a>
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Services</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Sunday Morning</p>
                <p className="text-xs opacity-80">9:00 AM - Holy Communion</p>
              </div>
              <div>
                <p className="text-sm font-medium">Sunday Evening</p>
                <p className="text-xs opacity-80">6:00 PM - Evening Prayer</p>
              </div>
              <div>
                <p className="text-sm font-medium">Wednesday</p>
                <p className="text-xs opacity-80">7:00 PM - Bible Study</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Address</p>
                <p className="opacity-80">
                  P.O BOX 27 GITARAMA<br />
                  MUHANGA DISTRICT<br />
                  SOUTHERN PROVINCE<br />
                  RWANDA
                </p>
              </div>
              <div>
                <p className="font-medium">Phone</p>
                <p className="opacity-80">+250788503392</p>
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="opacity-80">info@shyogwediocese.org</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-church-red/20 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm opacity-80">
            <p>&copy; 2024 ANGLICAN CHURCH OF RWANDA, SHYOGWE DIOCESE. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="opacity-80 hover:opacity-100 hover:text-church-red transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="opacity-80 hover:opacity-100 hover:text-church-red transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;