import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiUrls } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  Church,
  HeartHandshake,
  BookOpen,
  Stethoscope,
  ExternalLink,
  ShieldCheck,
  Users,
  Compass,
  ArrowRight
} from "lucide-react";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  subject: string;
  message: string;
}

const DEPARTMENTS = [
  { id: "general", label: "General Secretariat & Information" },
  { id: "bishop", label: "Office of the Bishop & Appointments" },
  { id: "pastoral", label: "Pastoral Care & Prayer Requests" },
  { id: "registry", label: "Marriage, Baptism & Registry Archives" },
  { id: "education", label: "Education Directorate (38 Schools)" },
  { id: "health", label: "Healthcare & Medical Services" },
  { id: "projects", label: "Development Projects & Partnerships" }
];

const ARCHDEACONRIES = [
  {
    name: "Shyogwe Archdeaconry",
    seat: "Shyogwe Hill / Cathedral Parish",
    leader: "The Ven. Archdeacon of Shyogwe",
    coverage: "Historic mother parish, theological discipleship center, and local parishes across Shyogwe sector.",
    phone: "+250 788 522 174",
    email: "shyogwe.arch@earshyogwe.com"
  },
  {
    name: "Gitarama Archdeaconry",
    seat: "St. Peter's Parish, Muhanga Town",
    leader: "The Ven. Archdeacon of Gitarama",
    coverage: "Urban parish network, youth programs, and community outreach in Muhanga municipal center.",
    phone: "+250 788 503 392",
    email: "gitarama.arch@earshyogwe.com"
  },
  {
    name: "Hanika Archdeaconry",
    seat: "Hanika Parish Center",
    leader: "The Ven. Archdeacon of Hanika",
    coverage: "Hanika TSS, Hanika Health Center, and 12 rural parish congregations in southern sectors.",
    phone: "+250 788 352 144",
    email: "hanika.arch@earshyogwe.com"
  },
  {
    name: "Ndiza Archdeaconry",
    seat: "Ndiza Mountain Parish Center",
    leader: "The Ven. Archdeacon of Ndiza",
    coverage: "Rugged highland parish communities, water catchments, and community agriculture groups.",
    phone: "+250 788 471 205",
    email: "ndiza.arch@earshyogwe.com"
  },
  {
    name: "Nyarugenge Archdeaconry",
    seat: "Kigali Outreach Fellowship Center",
    leader: "The Ven. Archdeacon of Nyarugenge",
    coverage: "Connecting urban diaspora families, professionals, and university students in the capital.",
    phone: "+250 788 630 119",
    email: "nyarugenge.arch@earshyogwe.com"
  }
];

const FAQS = [
  {
    question: "How do I schedule an episcopal meeting or appointment with Bishop Jered Kalimba?",
    answer: "Formal appointment requests should be directed to the Bishop's Executive Assistant through the contact form, by emailing bishop@shyogwediocese.org, or by calling the Diocesan Secretariat at +250 788 522 174. Please specify the purpose of the meeting and proposed dates."
  },
  {
    question: "How can I obtain a certified baptismal, confirmation, or marriage certificate?",
    answer: "Parish records and canonical extracts are preserved at the Diocesan Registry Office in Muhanga. You may submit an inquiry with your full name, parish of origin, approximate year of sacrament, and parent details. Certified documents can be collected in person or dispatched by official registry mail."
  },
  {
    question: "What are the Sunday worship service times at the Diocesan Cathedral and local parishes?",
    answer: "Diocesan parishes hold Sunday worship services in Kinyarwanda and English. At the Cathedral Parish in Shyogwe, the early morning communion service begins at 7:30 AM, followed by the main family worship and youth service at 10:00 AM. Midweek prayer meetings take place every Wednesday at 5:00 PM."
  },
  {
    question: "How can international partners, organizations, or donors support diocesan development programs?",
    answer: "The Diocese of Shyogwe actively partners with mission agencies, NGOs, and individual benefactors worldwide in community health, clean water, village savings, and school infrastructure. Please contact the Planning & Development Directorate at development@shyogwediocese.org for strategic proposals and audited reports."
  },
  {
    question: "How can parents apply for admissions to diocesan boarding schools like GS Shyogwe or Hanika TSS?",
    answer: "Admissions to diocesan secondary boarding and technical schools follow the national placement framework of the Rwanda Basic Education Board (REB) alongside direct applications for technical programs at Hanika TSS. The Diocesan Education Board office can assist parents with enrollment guidance."
  }
];

export const Contact: React.FC = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "general",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: `[${formData.department.toUpperCase()}] ${formData.subject.trim()}`,
        message: formData.message.trim()
      };

      const response = await fetch(apiUrls.contact(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success !== false) {
        setSubmitStatus("success");
        toast({
          title: "Message Delivered",
          description: "Thank you. Your message has been sent to the Diocesan Secretariat."
        });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          department: "general",
          subject: "",
          message: ""
        });
      } else {
        const errorMsg =
          result?.message ||
          (result?.errors ? Object.values(result.errors).flat().join(" ") : null) ||
          "Failed to deliver message. Please contact us directly by phone or email.";
        setSubmitStatus("error");
        setErrorMessage(errorMsg);
        toast({
          title: "Submission Issue",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch {
      setSubmitStatus("error");
      const networkMsg =
        "Network connection error. Please call +250 788 522 174 or try again in a moment.";
      setErrorMessage(networkMsg);
      toast({
        title: "Network Notice",
        description: networkMsg,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* Page Header Banner with Background Image */}
        <section className="relative h-48 sm:h-56 md:h-64 flex items-center justify-center text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/01.jpg"
              alt="Shyogwe Diocese Secretariat & Administration"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-church-navy/80 backdrop-blur-[0.5px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              <Link to="/" className="hover:text-church-gold transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-church-gold">Contact & Inquiries</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              Contact & Diocesan Secretariat
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Quick Contact Pillars Ribbon */}
        <section className="py-10 bg-slate-50 border-b border-slate-200/90">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Postal & Physical Location */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm hover:border-church-gold/60 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-church-navy/5 text-church-navy flex items-center justify-center mb-3">
                  <MapPin className="h-5 w-5 text-church-navy" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Diocesan Headquarters
                </h3>
                <p className="text-sm font-semibold text-church-navy leading-snug">
                  P.O. Box 27, Gitarama
                </p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Shyogwe Sector, Muhanga District, Southern Province, Rwanda
                </p>
              </div>

              {/* Telephone Hotlines */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm hover:border-church-gold/60 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-church-navy/5 text-church-navy flex items-center justify-center mb-3">
                  <Phone className="h-5 w-5 text-church-navy" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Telephone Inquiries
                </h3>
                <a
                  href="tel:+250788522174"
                  className="text-sm font-semibold text-church-navy hover:text-church-red transition-colors block"
                >
                  +250 788 522 174
                </a>
                <p className="text-xs text-slate-600 mt-1">
                  Alt: +250 788 503 392 • +250 788 352 144
                </p>
              </div>

              {/* Official Emails */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm hover:border-church-gold/60 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-church-navy/5 text-church-navy flex items-center justify-center mb-3">
                  <Mail className="h-5 w-5 text-church-navy" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Official Email
                </h3>
                <a
                  href="mailto:shyogwe@gmail.com"
                  className="text-sm font-semibold text-church-navy hover:text-church-red transition-colors block truncate"
                >
                  shyogwe@gmail.com
                </a>
                <p className="text-xs text-slate-600 mt-1 truncate">
                  dioceseofshyogwe@yahoo.com
                </p>
              </div>

              {/* Office & Cathedral Hours */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm hover:border-church-gold/60 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-church-navy/5 text-church-navy flex items-center justify-center mb-3">
                  <Clock className="h-5 w-5 text-church-navy" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Working Hours
                </h3>
                <p className="text-sm font-semibold text-church-navy">
                  Mon – Fri: 8:00 AM – 5:00 PM
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Sunday Services: 7:30 AM & 10:00 AM
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Section: Interactive Form & Departments Directory */}
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Form */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                      Direct Communication
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                      Send a Message to the Secretariat
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      Please complete the form below. Inquiries are routed directly to the designated diocesan department for prompt response.
                    </p>
                  </div>

                  {submitStatus === "success" ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-serif font-bold text-church-navy mb-2">
                        Message Successfully Sent
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                        Thank you for reaching out to the Anglican Diocese of Shyogwe. Our secretariat team will review your message and respond through your provided contact information.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSubmitStatus("idle")}
                        className="text-xs font-semibold border-slate-300"
                      >
                        Send Another Inquiry
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Department Selector */}
                      <div className="space-y-1.5">
                        <Label htmlFor="department" className="text-xs font-semibold text-slate-700">
                          Select Recipient Department *
                        </Label>
                        <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-church-navy/20 focus:border-church-navy"
                          required
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Name Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="e.g. Emmanuel"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-church-navy/30"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700">
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="e.g. Mugisha"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-church-navy/30"
                          />
                        </div>
                      </div>

                      {/* Email and Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-church-navy/30"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                            Phone Number / WhatsApp
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+250 788 000 000"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-church-navy/30"
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-1.5">
                        <Label htmlFor="subject" className="text-xs font-semibold text-slate-700">
                          Subject *
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="Brief summary of your inquiry"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-church-navy/30"
                        />
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <Label htmlFor="message" className="text-xs font-semibold text-slate-700">
                          Message Details *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Please provide comprehensive details, references, or specific questions..."
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          className="text-xs sm:text-sm border-slate-200 focus-visible:ring-church-navy/30 leading-relaxed"
                        />
                      </div>

                      {/* Error state alert */}
                      {submitStatus === "error" && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
                          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {/* Submit button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 bg-church-navy hover:bg-church-navy/90 text-white font-semibold text-xs uppercase tracking-wider transition-all"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                            <span>Delivering Message...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="h-4 w-4 text-church-gold" />
                            <span>Transmit Inquiry to Secretariat</span>
                          </div>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              {/* Right Column: Key Directorate Contacts & Pastoral Hotline */}
              <div className="lg:col-span-5 space-y-6">
                {/* Emergency & Pastoral Care Box */}
                <div className="bg-church-navy text-white rounded-2xl p-6 shadow-sm border border-slate-800">
                  <div className="flex items-center gap-2 text-church-gold text-xs font-bold uppercase tracking-wider mb-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Pastoral Care & Emergencies</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white mb-2">
                    24/7 Pastoral Support
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    For hospital visitation requests, bereavement support, or urgent pastoral care, please call the diocesan pastoral chaplaincy helpline directly.
                  </p>
                  <a
                    href="tel:+250788503392"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold tracking-wide transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-church-gold" />
                    <span>Emergency Line: +250 788 503 392</span>
                  </a>
                </div>

                {/* Diocesan Directorates Directory */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-church-navy border-b border-slate-200 pb-2">
                    Diocesan Directorates
                  </h3>

                  <div className="space-y-4 text-xs">
                    {/* Bishop's Office */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <Church className="h-3.5 w-3.5 text-church-navy" />
                        <span>Office of the Bishop & Deanery</span>
                      </div>
                      <p className="text-slate-500 pl-5.5">
                        Executive Assistant to Bishop Jered Kalimba
                      </p>
                      <p className="text-slate-600 pl-5.5 font-medium">
                        Tel: +250 788 522 174 • bishop@shyogwediocese.org
                      </p>
                    </div>

                    {/* Education */}
                    <div className="space-y-1 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <BookOpen className="h-3.5 w-3.5 text-church-navy" />
                        <span>Education Directorate (38 Schools)</span>
                      </div>
                      <p className="text-slate-500 pl-5.5">
                        Coordinator for Primary, Secondary & Technical Colleges
                      </p>
                      <p className="text-slate-600 pl-5.5 font-medium">
                        Tel: +250 788 352 144 • education@shyogwediocese.org
                      </p>
                    </div>

                    {/* Healthcare */}
                    <div className="space-y-1 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <Stethoscope className="h-3.5 w-3.5 text-church-navy" />
                        <span>Medical Services (3 Centers, 4 Rural Posts)</span>
                      </div>
                      <p className="text-slate-500 pl-5.5">
                        Supervision of Shyogwe, Hanika, and Gikomero Facilities
                      </p>
                      <p className="text-slate-600 pl-5.5 font-medium">
                        Tel: +250 788 503 392 • health@shyogwediocese.org
                      </p>
                    </div>

                    {/* Development & Finance */}
                    <div className="space-y-1 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <HeartHandshake className="h-3.5 w-3.5 text-church-navy" />
                        <span>Planning, Finance & Development</span>
                      </div>
                      <p className="text-slate-500 pl-5.5">
                        VSLA Savings Groups, Water Initiatives & Donor Relations
                      </p>
                      <p className="text-slate-600 pl-5.5 font-medium">
                        Tel: +250 788 884 120 • development@shyogwediocese.org
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Archdeaconries Strategic Network */}
        <section className="py-12 bg-slate-50 border-t border-slate-200/90">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                Regional Pastoral Administration
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                Archdeaconry Contacts & Coverage
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Shyogwe Diocese administers pastoral ministries and community projects across five strategic Archdeaconries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ARCHDEACONRIES.map((arch) => (
                <div
                  key={arch.name}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-church-gold/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-church-navy">
                      <Compass className="h-4 w-4 text-church-gold shrink-0" />
                      <h3 className="font-serif font-bold text-base">{arch.name}</h3>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Seat: {arch.seat}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {arch.coverage}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <p className="font-medium text-church-navy">{arch.phone}</p>
                    <p className="text-slate-400 text-[11px] truncate">{arch.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location & Visiting Information */}
        <section className="py-14 bg-white border-t border-slate-200/90">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Map Information Left */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block">
                  Visiting Shyogwe
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy leading-tight">
                  How to Find Us in Muhanga
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The Diocesan Headquarters is situated on the historic Shyogwe Hill, approximately 4 kilometers south of Muhanga central commercial center, along the paved Shyogwe road near GS Shyogwe and the Shyogwe Health Center.
                </p>

                <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/90">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-church-navy shrink-0 mt-0.5" />
                    <span>
                      <strong>From Kigali:</strong> Follow the Kigali–Huye Highway (RN1) southwest for approximately 45 km to Muhanga (Gitarama), then take the southern Shyogwe hill turnoff.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-church-navy shrink-0 mt-0.5" />
                    <span>
                      <strong>Landmarks:</strong> Shyogwe Cathedral, GS Shyogwe Secondary Boarding School, and Shyogwe Health Center campus.
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() =>
                      window.open(
                        "https://www.google.com/maps/search/?api=1&query=Anglican+Church+of+Rwanda+Shyogwe+Diocese+Muhanga",
                        "_blank"
                      )
                    }
                    className="bg-church-navy hover:bg-church-navy/90 text-white text-xs font-semibold h-10 px-4"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-2 text-church-gold" />
                    Open Coordinates in Google Maps
                  </Button>
                </div>
              </div>

              {/* Map Iframe Right */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md h-80 sm:h-96 relative bg-slate-100">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15949.771963952136!2d29.74652!3d-2.08051!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca12a8e83f51f%3A0x639db5c57a7b8e5c!2sMuhanga%2C%20Rwanda!5e0!3m2!1sen!2srw!4v1700000000000!5m2!1sen!2srw"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Shyogwe Diocese Headquarters Map Location"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions Accordion */}
        <section className="py-14 bg-slate-50 border-t border-slate-200/90">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                Help & Guidelines
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl mx-auto">
                Quick answers regarding pastoral appointments, sacramental certificates, school admissions, and partnership programs.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-slate-200">
                    <AccordionTrigger className="text-left text-xs sm:text-sm font-semibold text-church-navy hover:text-church-red py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;