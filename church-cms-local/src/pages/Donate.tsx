import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, CreditCard, Building, Users, GraduationCap, Home, Wrench, Phone, Mail } from "lucide-react";

const Donate = () => {

  const donationCategories = [
    {
      icon: Heart,
      title: "General Fund",
      description: "Support the overall ministry and operations of our diocese",
      color: "bg-church-red"
    },
    {
      icon: Building,
      title: "Church Building & Infrastructure",
      description: "Help build and maintain church facilities across our diocese",
      color: "bg-blue-500"
    },
    {
      icon: GraduationCap,
      title: "Education Support",
      description: "Support our schools and educational programs",
      color: "bg-green-500"
    },
    {
      icon: Users,
      title: "Community Development",
      description: "Fund community development projects and social programs",
      color: "bg-purple-500"
    },
    {
      icon: Home,
      title: "Family Life Ministry",
      description: "Support marriage counseling and family programs",
      color: "bg-orange-500"
    },
    {
      icon: Wrench,
      title: "Technical & Maintenance",
      description: "Maintain and upgrade technical infrastructure",
      color: "bg-gray-500"
    }
  ];


  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-section py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-church-red mb-6">
              Support Our Ministry
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your generous giving helps us spread the Gospel, serve our communities, 
              and build God's kingdom throughout Shyogwe Diocese.
            </p>
          </div>
        </section>

        {/* Donation Categories */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-church-red mb-4">
                Ways to Give
              </h2>
              <p className="text-xl text-muted-foreground">
                Choose how you'd like to support our ministry
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {donationCategories.map((category, index) => (
                <Card key={index} className="shadow-soft hover:shadow-elegant transition-all duration-300 cursor-pointer hover-scale">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${category.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                      <category.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{category.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>


        {/* Bank Account Details */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-church-red mb-4">
                Bank Account Details
              </h2>
              <p className="text-xl text-muted-foreground">
                Transfer directly to our official bank accounts
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              <Card className="shadow-soft border-2 border-church-red/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-church-red mb-4">USD Account</h3>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground">Account Number</p>
                    <p className="text-2xl font-bold text-church-red">100000798694</p>
                    <p className="text-lg font-semibold text-foreground">Account Name</p>
                    <p className="text-church-red font-semibold">E.E.R DIOCESE SHYOGWE (USD)</p>
                    <p className="text-lg font-semibold text-foreground">Bank</p>
                    <p className="text-church-red font-semibold">Bank of Kigali (BK)</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft border-2 border-church-red/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-church-red mb-4">FRW Account</h3>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground">Account Number</p>
                    <p className="text-2xl font-bold text-church-red">100000981626</p>
                    <p className="text-lg font-semibold text-foreground">Account Name</p>
                    <p className="text-church-red font-semibold">E.E.R DIOCESE SHYOGWE (FRW)</p>
                    <p className="text-lg font-semibold text-foreground">Bank</p>
                    <p className="text-church-red font-semibold">Bank of Kigali (BK)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>


        {/* Impact Section */}
        <section className="py-20 bg-gradient-section">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-church-red mb-8">
              Your Impact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6">
                <div className="text-4xl font-bold text-church-red mb-2">15</div>
                <p className="text-muted-foreground">New Churches Built</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-church-red mb-2">500+</div>
                <p className="text-muted-foreground">Students Supported</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-church-red mb-2">1000+</div>
                <p className="text-muted-foreground">Families Helped</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information for Donations */}
        <section className="py-20 bg-gradient-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-church-red mb-4">
                  How to Make a Donation
                </h2>
                <p className="text-xl text-muted-foreground">
                  We appreciate your generous support. Here's how you can contribute to our ministry.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-xl text-church-red flex items-center">
                      <Phone className="h-6 w-6 mr-3" />
                      Contact Us Directly
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Phone</h4>
                      <p className="text-muted-foreground">+250788503392</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Email</h4>
                      <p className="text-muted-foreground">admin@local.com</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Office Location</h4>
                      <p className="text-muted-foreground">Shyogwe Diocese Office, Muhanga</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Office Hours</h4>
                      <p className="text-muted-foreground">Monday - Friday: 8:00 AM - 4:00 PM</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Donation Information */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="text-xl text-church-red flex items-center">
                      <Heart className="h-6 w-6 mr-3" />
                      Donation Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Bank Details</h4>
                      <p className="text-muted-foreground">Contact us for bank account information</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Mobile Money</h4>
                      <p className="text-muted-foreground">MTN, Airtel, and other mobile payment options available</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Cash Donations</h4>
                      <p className="text-muted-foreground">Visit our office or during church services</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Donation Receipt</h4>
                      <p className="text-muted-foreground">Official receipts provided for all donations</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              <div className="text-center mt-12">
                <Button 
                  size="lg"
                  className="bg-church-red hover:bg-church-red/90 text-lg px-8 py-4"
                  onClick={() => window.open('mailto:admin@local.com?subject=Donation Inquiry', '_blank')}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Email Us About Your Donation
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Donate;
