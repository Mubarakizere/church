import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { apiUrls } from '@/config/api';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch(apiUrls.contact(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSubmitStatus('success');
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
          });
        } else {
          setSubmitStatus('error');
          setErrorMessage(result.message || 'Failed to send message');
        }
      } else {
        setSubmitStatus('error');
        setErrorMessage('Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-church-red mb-6">
            Contact Us
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you! Whether you have questions, need prayer, 
            or want to get involved, don't hesitate to reach out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <MapPin className="h-5 w-5 text-church-red mr-3" />
                  Visit Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  P.O BOX 27 GITARAMA<br />
                  MUHANGA DISTRICT<br />
                  SOUTHERN PROVINCE<br />
                  RWANDA
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.open('https://maps.app.goo.gl/FmkhLqRHLTdpGxXSA?g_st=iw', '_blank')}
                >
                  Get Directions
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Phone className="h-5 w-5 text-church-red mr-3" />
                  Call Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Church Office: +250788503392<br />
                  Emergency: +250788503392
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Office hours: Mon-Fri 8:00 AM - 4:00 PM
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Mail className="h-5 w-5 text-church-red mr-3" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  General: info@shyogwediocese.org<br />
                  Bishop: bishop@shyogwediocese.org<br />
                  Events: events@shyogwediocese.org
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Clock className="h-5 w-5 text-church-red mr-3" />
                  Office Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>9:00 AM - 1:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>After services</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>

          {/* Google Maps Section - Smaller on the right */}
          <div className="lg:col-span-1">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground text-lg">
                  <MapPin className="h-5 w-5 text-church-red mr-3" />
                  Find Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 rounded-lg overflow-hidden mb-4">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.1234567890123!2d29.12345678901234!3d-2.123456789012345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAnglican%20Church%20of%20Rwanda%2C%20Shyogwe%20Diocese!5e0!3m2!1sen!2srw!4v1234567890123!5m2!1sen!2srw"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Anglican Church of Rwanda, Shyogwe Diocese Location"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://maps.app.goo.gl/FmkhLqRHLTdpGxXSA?g_st=iw', '_blank')}
                  className="w-full bg-church-red text-white hover:bg-church-red/90 border-church-red"
                  size="sm"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Open in Google Maps
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Form - Full width below */}
        <div className="mt-12">
          <Card className="shadow-medium">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-foreground">Send us a Message</CardTitle>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Enter your first name" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Enter your last name" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input 
                    id="subject" 
                    placeholder="What is this regarding?" 
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Please share your message, prayer request, or question..."
                    className="min-h-[120px]"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span>Message sent successfully! We'll get back to you soon.</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                
                <Button 
                  type="submit"
                  variant="elegant" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Map Section removed as requested */}
      </div>
    </section>
  );
};

export default ContactSection;