import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiUrls } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
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
  Heart,
  CreditCard,
  Building2,
  Users,
  GraduationCap,
  Stethoscope,
  Droplets,
  Church,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileText,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Coins,
  Landmark,
  Smartphone,
  Sprout
} from "lucide-react";

interface DonationPledgeForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  amount: string;
  currency: "RWF" | "USD";
  donationType: string;
  paymentMethod: string;
  message: string;
}

const GIVING_PILLARS = [
  {
    id: "health",
    title: "Healthcare & Rural Medical Clinics",
    badge: "Community Care",
    icon: Stethoscope,
    description: "Subsidizing medical consultations, maternal care, and emergency medicines at Shyogwe, Hanika, and Gikomero Health Centers and 4 rural health posts.",
    impact: "Serving 45,000+ patient visits annually"
  },
  {
    id: "education",
    title: "Diocesan Schools & Student Scholarships",
    badge: "Next Generation",
    icon: GraduationCap,
    description: "Providing tuition assistance, classroom learning materials, school feeding, and technical vocational training tools at Hanika TSS and 38 diocesan schools.",
    impact: "Supporting over 14,000 students across the diocese"
  },
  {
    id: "water",
    title: "Clean Water, Sanitation & Green Diocese",
    badge: "Creation Care",
    icon: Droplets,
    description: "Constructing gravity-fed water supply catchments, protecting natural springs, and planting agro-forestry trees to mitigate climate vulnerabilities in rural parishes.",
    impact: "Over 35,000 residents accessing clean spring water"
  },
  {
    id: "vsla",
    title: "Community Savings & Women Empowerment",
    badge: "Economic Resilience",
    icon: Sprout,
    description: "Equipping rural village savings and loan associations (VSLAs) with financial literacy training, small-business capital, and emergency welfare seed funds.",
    impact: "150+ active savings groups empowering 4,500+ families"
  },
  {
    id: "evangelism",
    title: "Evangelism, Discipleship & Church Infrastructure",
    badge: "Gospel Mission",
    icon: Church,
    description: "Supporting catechist theological training, parish leadership workshops, youth retreats, and building dignified rural chapel facilities in expanding archdeaconries.",
    impact: "Active ministry across 5 Archdeaconries and dozens of parishes"
  },
  {
    id: "general",
    title: "Diocesan General Mission & Emergency Relief",
    badge: "Unrestricted",
    icon: Heart,
    description: "Enabling flexible allocation toward pastoral emergencies, family bereavement support, and administrative coordination of diocesan programs.",
    impact: "Immediate assistance wherever urgent pastoral need arises"
  }
];

const PRESET_AMOUNTS = {
  RWF: ["10,000", "25,000", "50,000", "100,000", "250,000"],
  USD: ["25", "50", "100", "250", "500"]
};

export const Donate: React.FC = () => {
  const { toast } = useToast();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pledgeForm, setPledgeForm] = useState<DonationPledgeForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    amount: "50,000",
    currency: "RWF",
    donationType: "Healthcare & Rural Medical Clinics",
    paymentMethod: "bank_transfer",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({
      title: "Copied to Clipboard",
      description: `${label}: ${text}`
    });
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const handleCurrencyChange = (newCurrency: "RWF" | "USD") => {
    const defaultAmount = newCurrency === "RWF" ? "50,000" : "50";
    setPledgeForm((prev) => ({
      ...prev,
      currency: newCurrency,
      amount: defaultAmount
    }));
  };

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanAmount = parseFloat(pledgeForm.amount.replace(/,/g, ""));
      if (isNaN(cleanAmount) || cleanAmount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid donation amount.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        firstName: pledgeForm.firstName.trim(),
        lastName: pledgeForm.lastName.trim(),
        email: pledgeForm.email.trim(),
        phone: pledgeForm.phone.trim() || undefined,
        amount: cleanAmount,
        currency: pledgeForm.currency,
        donationType: pledgeForm.donationType,
        paymentMethod: pledgeForm.paymentMethod,
        message: pledgeForm.message.trim() || undefined
      };

      const res = await fetch(apiUrls.donations(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success !== false) {
        setSubmitSuccess(true);
        toast({
          title: "Pledge Recorded",
          description: "Thank you for supporting Shyogwe Diocese. A confirmation has been registered."
        });
      } else {
        const errorMsg =
          data?.message ||
          (data?.errors ? Object.values(data.errors).flat().join(" ") : null) ||
          "Unable to record pledge online. Please proceed with direct bank transfer or contact our finance office.";
        toast({
          title: "Pledge Notice",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Connection Notice",
        description: "Network error recording online pledge. Please use our direct bank or mobile money transfer accounts below.",
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
              alt="Shyogwe Diocese Ministry Support & Giving"
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
              <span className="text-church-gold">Support Our Ministry</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white mb-2">
              Support Our Ministry & Giving
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 uppercase tracking-widest font-medium">
              Anglican Church of Rwanda • Shyogwe Diocese
            </p>
          </div>
        </section>

        {/* Scriptural & Stewardship Statement */}
        <section className="py-10 bg-slate-50 border-b border-slate-200/90">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
            <blockquote className="font-serif italic text-base sm:text-lg text-church-navy mb-3">
              "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
            </blockquote>
            <p className="text-xs font-bold uppercase tracking-widest text-church-gold mb-3">
              — 2 Corinthians 9:7
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Your charitable gifts directly empower gospel evangelism, health clinics serving rural mothers,
              quality education for over 14,000 school pupils, clean gravity-fed water networks, and vulnerable family empowerment across Southern Rwanda.
            </p>
          </div>
        </section>

        {/* Official Banking & Mobile Payment Channels */}
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                Official Banking Rails
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                Direct Bank Accounts & Mobile Giving
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Official accounts held with Bank of Kigali (BK) and verified Rwandan mobile money merchant lines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* RWF Bank Account */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-church-gold/60 transition-colors shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-church-navy text-white flex items-center justify-center">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      RWF Account
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-church-navy mb-1">
                    Bank of Kigali (BK)
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Local currency transfers within Rwanda
                  </p>

                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Account Name
                      </span>
                      <span className="font-semibold text-slate-800">
                        E.E.R DIOCESE SHYOGWE (FRW)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Account Number
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-bold text-sm text-church-navy">
                          100000981626
                        </span>
                        <button
                          onClick={() => handleCopy("100000981626", "rwf_acc", "RWF Account Number")}
                          className="text-xs text-slate-600 hover:text-church-navy p-1 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 transition-colors"
                          title="Copy account number"
                        >
                          {copiedKey === "rwf_acc" ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedKey === "rwf_acc" ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Branch & Location
                      </span>
                      <span className="text-slate-700">Muhanga (Gitarama) Branch, Rwanda</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Verified Diocesan Treasury Account</span>
                </div>
              </div>

              {/* USD Bank Account */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-church-gold/60 transition-colors shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-church-navy text-white flex items-center justify-center">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      USD / International
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-church-navy mb-1">
                    Bank of Kigali (BK)
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    International Wire / SWIFT Transfers
                  </p>

                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Account Name
                      </span>
                      <span className="font-semibold text-slate-800">
                        E.E.R DIOCESE SHYOGWE (USD)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Account Number
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-bold text-sm text-church-navy">
                          100000798694
                        </span>
                        <button
                          onClick={() => handleCopy("100000798694", "usd_acc", "USD Account Number")}
                          className="text-xs text-slate-600 hover:text-church-navy p-1 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 transition-colors"
                          title="Copy account number"
                        >
                          {copiedKey === "usd_acc" ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedKey === "usd_acc" ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        SWIFT / BIC Code
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-bold text-xs text-slate-800">
                          BKIGRWRW
                        </span>
                        <button
                          onClick={() => handleCopy("BKIGRWRW", "swift_code", "SWIFT Code")}
                          className="text-xs text-slate-600 hover:text-church-navy p-1 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 transition-colors"
                          title="Copy SWIFT code"
                        >
                          {copiedKey === "swift_code" ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedKey === "swift_code" ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Audited by External Certified Examiners</span>
                </div>
              </div>

              {/* Mobile Money Channels */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-church-gold/60 transition-colors shadow-sm md:col-span-2 lg:col-span-1">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-church-navy text-white flex items-center justify-center">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Mobile Giving
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-church-navy mb-1">
                    MTN MoMo & Airtel Money
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Quick phone transfer for Rwandan residents
                  </p>

                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        MTN Mobile Money Phone Line
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-bold text-xs text-church-navy">
                          +250 788 503 392
                        </span>
                        <button
                          onClick={() => handleCopy("+250788503392", "momo_tel", "MTN MoMo Number")}
                          className="text-xs text-slate-600 hover:text-church-navy p-1 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 transition-colors"
                        >
                          {copiedKey === "momo_tel" ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedKey === "momo_tel" ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500">Registered: EAR Shyogwe Diocese</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Direct MoMo Pay Merchant Code
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-bold text-sm text-church-navy">
                          *182*8*1*054321#
                        </span>
                        <button
                          onClick={() => handleCopy("054321", "momo_code", "MoMo Code")}
                          className="text-xs text-slate-600 hover:text-church-navy p-1 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 transition-colors"
                        >
                          {copiedKey === "momo_code" ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedKey === "momo_code" ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Airtel Money Line
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-700">
                        +250 738 522 174
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Instant SMS Confirmation & Official Receipt</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars of Diocesan Giving */}
        <section className="py-14 bg-slate-50 border-t border-slate-200/90">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                Where Your Gift Works
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                Designated Ministry Funds & Impact
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                You may designate your financial gift toward a specific priority or support our general mission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GIVING_PILLARS.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between hover:border-church-gold/60 transition-all shadow-sm group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-lg bg-church-navy/5 text-church-navy group-hover:bg-church-navy group-hover:text-white transition-colors flex items-center justify-center">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {pillar.badge}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-church-navy mb-2 group-hover:text-church-red transition-colors">
                        {pillar.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 text-[11px] font-semibold text-church-navy flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-church-gold shrink-0" />
                      <span>{pillar.impact}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Online Giving Pledge & Transfer Confirmation Form */}
        <section className="py-16 bg-white border-t border-slate-200/90">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                  Giving Intent & Confirmation
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                  Register Your Donation or Pledge
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Let our finance office know about your bank wire or mobile contribution so we can properly acknowledge your gift and issue an official tax/contribution receipt.
                </p>
              </div>

              {submitSuccess ? (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-church-navy mb-2">
                    Thank You for Your Generosity
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
                    Your giving intent has been safely recorded by the Diocesan Finance Office. If you transferred funds via bank wire or mobile money, our treasury officer will verify and issue an official acknowledgement receipt to your email address.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitSuccess(false);
                      setPledgeForm({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        amount: "50,000",
                        currency: "RWF",
                        donationType: "Healthcare & Rural Medical Clinics",
                        paymentMethod: "bank_transfer",
                        message: ""
                      });
                    }}
                    className="text-xs font-semibold"
                  >
                    Register Another Contribution
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePledgeSubmit} className="space-y-6">
                  {/* Currency and Amount Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">
                        Donation Currency & Amount *
                      </Label>
                      <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => handleCurrencyChange("RWF")}
                          className={`px-3 py-1 rounded font-bold transition-colors ${
                            pledgeForm.currency === "RWF"
                              ? "bg-white text-church-navy shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          RWF (Francs)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCurrencyChange("USD")}
                          className={`px-3 py-1 rounded font-bold transition-colors ${
                            pledgeForm.currency === "USD"
                              ? "bg-white text-church-navy shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          USD ($)
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_AMOUNTS[pledgeForm.currency].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() =>
                            setPledgeForm((prev) => ({ ...prev, amount: preset }))
                          }
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                            pledgeForm.amount === preset
                              ? "bg-church-navy text-white border-church-navy shadow-xs"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {pledgeForm.currency === "USD" ? `$${preset}` : `${preset}`}
                        </button>
                      ))}
                    </div>

                    {/* Custom Input */}
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">
                        {pledgeForm.currency}
                      </span>
                      <Input
                        type="text"
                        placeholder="Or enter custom amount"
                        value={pledgeForm.amount}
                        onChange={(e) =>
                          setPledgeForm((prev) => ({ ...prev, amount: e.target.value }))
                        }
                        required
                        className="pl-14 h-11 text-sm font-semibold border-slate-200 focus-visible:ring-church-navy/30"
                      />
                    </div>
                  </div>

                  {/* Designated Ministry Fund */}
                  <div className="space-y-1.5">
                    <Label htmlFor="donationType" className="text-xs font-semibold text-slate-700">
                      Designate My Contribution To *
                    </Label>
                    <select
                      id="donationType"
                      value={pledgeForm.donationType}
                      onChange={(e) =>
                        setPledgeForm((prev) => ({ ...prev, donationType: e.target.value }))
                      }
                      className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-church-navy/20 focus:border-church-navy"
                      required
                    >
                      {GIVING_PILLARS.map((p) => (
                        <option key={p.id} value={p.title}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Donor Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="e.g. Jean"
                        value={pledgeForm.firstName}
                        onChange={(e) =>
                          setPledgeForm((prev) => ({ ...prev, firstName: e.target.value }))
                        }
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
                        placeholder="e.g. Habimana"
                        value={pledgeForm.lastName}
                        onChange={(e) =>
                          setPledgeForm((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                        required
                        className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-church-navy/30"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={pledgeForm.email}
                        onChange={(e) =>
                          setPledgeForm((prev) => ({ ...prev, email: e.target.value }))
                        }
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
                        type="tel"
                        placeholder="+250 788 000 000"
                        value={pledgeForm.phone}
                        onChange={(e) =>
                          setPledgeForm((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="h-10 text-xs sm:text-sm border-slate-200 focus-visible:ring-church-navy/30"
                      />
                    </div>
                  </div>

                  {/* Payment Channel Used */}
                  <div className="space-y-1.5">
                    <Label htmlFor="paymentMethod" className="text-xs font-semibold text-slate-700">
                      Payment Channel Used or Intended *
                    </Label>
                    <select
                      id="paymentMethod"
                      value={pledgeForm.paymentMethod}
                      onChange={(e) =>
                        setPledgeForm((prev) => ({ ...prev, paymentMethod: e.target.value }))
                      }
                      className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-church-navy/20 focus:border-church-navy"
                    >
                      <option value="bank_transfer">Bank Transfer (Bank of Kigali FRW / USD)</option>
                      <option value="mobile_money">MTN Mobile Money / MoMo Pay</option>
                      <option value="airtel_money">Airtel Money</option>
                      <option value="in_person">In-Person at Diocesan Treasury or Local Parish</option>
                      <option value="wire_international">International Bank Wire / SWIFT</option>
                    </select>
                  </div>

                  {/* Optional Message */}
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs font-semibold text-slate-700">
                      Prayer Request or Dedication (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Share a word of prayer, dedication in memory of a loved one, or specific project guidance..."
                      value={pledgeForm.message}
                      onChange={(e) =>
                        setPledgeForm((prev) => ({ ...prev, message: e.target.value }))
                      }
                      rows={3}
                      className="text-xs sm:text-sm border-slate-200 focus-visible:ring-church-navy/30"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-church-navy hover:bg-church-navy/90 text-white font-semibold text-xs uppercase tracking-wider transition-all"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                        <span>Recording Contribution...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-church-gold" />
                        <span>Confirm Pledge & Request Receipt</span>
                      </div>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Accountability & Financial Governance FAQ */}
        <section className="py-14 bg-slate-50 border-t border-slate-200/90">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                Transparency & Governance
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy">
                Giving Assurance & Stewardship
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl mx-auto">
                Shyogwe Diocese maintains strict canonical and civil financial accountability standards.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-slate-200">
                  <AccordionTrigger className="text-left text-xs sm:text-sm font-semibold text-church-navy hover:text-church-red py-4">
                    How is financial accountability ensured for diocesan donations?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 pb-4">
                    The Diocese of Shyogwe operates under strict statutory financial guidelines established by the Diocesan Synod and Rwandan charity regulations. Our financial statements are audited annually by registered independent auditors and presented directly to the Diocesan Executive Committee and Synod Board.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-slate-200">
                  <AccordionTrigger className="text-left text-xs sm:text-sm font-semibold text-church-navy hover:text-church-red py-4">
                    Can I designate my gift to a specific parish, school, or health center?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 pb-4">
                    Yes. 100% of restricted and designated gifts are allocated directly to the designated facility (e.g. Hanika TSS, Shyogwe Health Center, or clean water spring construction). Simply indicate your designated cause in the pledge form or transfer narration.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-slate-200">
                  <AccordionTrigger className="text-left text-xs sm:text-sm font-semibold text-church-navy hover:text-church-red py-4">
                    Will I receive an official tax or contribution receipt?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 pb-4">
                    Yes. For both domestic and international transfers, the Diocesan Treasury issues seal-stamped official receipts and gift acknowledgment letters. If you require specialized documentation for tax exemption in your home country, please contact finance@shyogwediocese.org.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border-slate-200">
                  <AccordionTrigger className="text-left text-xs sm:text-sm font-semibold text-church-navy hover:text-church-red py-4">
                    How do international partners coordinate major project grants or equipment shipments?
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 pb-4">
                    International development partners and charitable foundations work directly with the Diocesan Planning & Development Directorate in Muhanga. We provide formal Memorandums of Understanding (MoUs), duty-free clearance facilitation with Rwandan customs, and periodic monitoring reports.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Treasury Contacts Callout */}
        <section className="py-12 bg-church-navy text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-church-gold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Diocesan Treasury & Stewardship Office</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">
                  Questions About Giving or Wire Confirmation?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Our Diocesan Treasurer and Finance team are available to verify wire receipts, assist with SWIFT routing, or discuss corporate and parish partnership grants.
                </p>
              </div>

              <div className="md:col-span-4 bg-white/5 border border-white/10 p-5 rounded-xl space-y-2.5 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-church-gold shrink-0" />
                  <span>+250 788 522 174 / +250 788 884 120</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-church-gold shrink-0" />
                  <span className="truncate">finance@shyogwediocese.org</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-church-gold shrink-0 mt-0.5" />
                  <span>Diocesan Headquarters, Shyogwe / Muhanga</span>
                </div>
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
