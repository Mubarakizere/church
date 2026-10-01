import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Church,
  ArrowLeft,
  AlertCircle,
  Phone,
  Info,
  KeyRound,
  GraduationCap,
  Stethoscope,
  Building2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState({
    email: "admin@shyogwe.org",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(credentials.email, credentials.password);
      if (success) {
        navigate("/admin/dashboard");
      } else {
        setError("Invalid email address or administrative password. Please check your credentials.");
      }
    } catch {
      setError("Unable to connect to the diocesan authentication service. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdminCredentials = () => {
    setCredentials({
      email: "admin@shyogwe.org",
      password: "admin123"
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans selection:bg-church-gold selection:text-church-navy">
      {/* Left Column: Authentic Picture & Concise Editorial Narrative */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[52%] relative overflow-hidden bg-church-navy text-white flex-col justify-between p-12 xl:p-16">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/01.jpg"
            alt="Anglican Diocese of Shyogwe"
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-church-navy/95 via-church-navy/85 to-church-navy/65" />
        </div>

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-church-gold tracking-wide">
            <Church className="h-3.5 w-3.5" />
            <span>Anglican Church of Rwanda • Shyogwe Diocese</span>
          </div>

          <span className="text-xs text-slate-300 font-medium">
            Est. 1992
          </span>
        </div>

        {/* Center Narrative & Few Concrete Data Points */}
        <div className="relative z-10 max-w-lg my-auto py-10">
          <span className="text-xs font-bold uppercase tracking-widest text-church-gold block mb-2">
            Diocesan Administration
          </span>

          <h2 className="text-3xl xl:text-4xl font-serif font-bold text-white tracking-tight leading-tight mb-4">
            Faith, Fellowship & Service Across Southern Rwanda.
          </h2>

          <p className="text-sm text-slate-200 leading-relaxed mb-8">
            Coordinating pastoral ministry, community health, education, and development across 5 Archdeaconries in Muhanga, Kamonyi, Ruhango, and Nyanza.
          </p>

          {/* Minimal, Concrete Data Counters */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3.5 rounded-xl">
              <GraduationCap className="h-4 w-4 text-church-gold mb-1.5" />
              <p className="font-serif font-bold text-base text-white">38</p>
              <p className="text-[11px] text-slate-300">Schools</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3.5 rounded-xl">
              <Stethoscope className="h-4 w-4 text-church-gold mb-1.5" />
              <p className="font-serif font-bold text-base text-white">7</p>
              <p className="text-[11px] text-slate-300">Health Facilities</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3.5 rounded-xl">
              <Building2 className="h-4 w-4 text-church-gold mb-1.5" />
              <p className="font-serif font-bold text-base text-white">5</p>
              <p className="text-[11px] text-slate-300">Archdeaconries</p>
            </div>
          </div>
        </div>

        {/* Bottom Episcopal Quote */}
        <div className="relative z-10 pt-6 border-t border-white/15">
          <blockquote className="text-xs xl:text-sm text-slate-200 italic leading-relaxed mb-1.5">
            "Serving with compassion to transform souls, minds, and community livelihoods."
          </blockquote>
          <p className="text-xs font-bold text-white">
            Rt. Rev. Dr. Jered Kalimba
          </p>
          <p className="text-[11px] text-church-gold">
            Bishop of Shyogwe Diocese
          </p>
        </div>
      </div>

      {/* Right Column: Clean, Polished Authentication Form */}
      <div className="w-full lg:w-[50%] xl:w-[48%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-white border-l border-slate-200">
        <div>
          {/* Top navigation row */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-church-navy transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-church-navy" />
              <span>Back to Public Website</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Portal
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/logo%20for%20chuch.jpg"
                alt="Shyogwe Diocese Logo"
                className="h-11 w-auto object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-church-gold">
                  Diocesan Secretariat
                </p>
                <h1 className="font-serif font-bold text-lg text-church-navy">
                  Staff Administration Sign In
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Sign in with your authorized diocesan credentials to access administration tools and records.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Staff Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@shyogwe.org"
                  className="pl-10 h-11 text-xs sm:text-sm border-slate-200 focus-visible:ring-church-navy/30 rounded-lg bg-white"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Password *
                </Label>
                <button
                  type="button"
                  onClick={() => setHelpDialogOpen(true)}
                  className="text-[11px] font-medium text-church-navy hover:text-church-red transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11 text-xs sm:text-sm border-slate-200 focus-visible:ring-church-navy/30 rounded-lg bg-white"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2 pt-0.5">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
              />
              <label
                htmlFor="remember"
                className="text-xs text-slate-600 font-medium cursor-pointer select-none"
              >
                Keep me signed in on this workstation
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-church-navy hover:bg-church-navy/90 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </Button>
          </form>

          {/* Admin Credentials Helper Box */}
          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-church-navy" />
                Administrator Login Credentials
              </span>
              <button
                type="button"
                onClick={handleFillAdminCredentials}
                className="text-[11px] font-bold text-church-navy hover:text-church-red underline"
              >
                Auto-fill
              </button>
            </div>
            <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
              <p>Email: <span className="text-slate-900 font-semibold">admin@shyogwe.org</span></p>
              <p>Password: <span className="text-slate-900 font-semibold">admin123</span></p>
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Diocese of Shyogwe • Muhanga, Rwanda</span>
          <button
            onClick={() => setHelpDialogOpen(true)}
            className="text-church-navy hover:underline text-left sm:text-right"
          >
            IT Secretariat Support
          </button>
        </div>
      </div>

      {/* IT Support Dialog */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-lg text-church-navy">
              Diocesan IT & Credential Support
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              For administrative accounts and password resets, contact the Diocesan IT Secretariat.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900 text-sm">
                Diocesan IT Secretariat
              </p>
              <p className="text-slate-600">
                Diocesan Headquarters, Shyogwe / Gitarama, Muhanga District
              </p>
              <div className="pt-2 border-t border-slate-200/80 space-y-1 text-slate-800">
                <p>
                  <strong>Telephone:</strong> +250 788 522 174
                </p>
                <p>
                  <strong>Email:</strong> it@shyogwediocese.org / shyogwe@gmail.com
                </p>
                <p>
                  <strong>Office Hours:</strong> Monday – Friday, 8:00 AM – 5:00 PM
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHelpDialogOpen(false)}
              className="text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLogin;
