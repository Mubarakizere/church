import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrls } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  Shield,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  Info,
  Laptop
} from "lucide-react";

const ChangePassword = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Live password strength calculation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passedCriteriaCount = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthMeta = () => {
    if (!password) return { label: "Not Entered", color: "bg-slate-200 text-slate-500", percent: 0, barColor: "bg-slate-300" };
    if (passedCriteriaCount <= 2) return { label: "Weak", color: "bg-red-50 text-red-700 border-red-200", percent: 25, barColor: "bg-red-500" };
    if (passedCriteriaCount === 3) return { label: "Moderate", color: "bg-amber-50 text-amber-700 border-amber-200", percent: 60, barColor: "bg-amber-500" };
    if (passedCriteriaCount === 4) return { label: "Good", color: "bg-blue-50 text-blue-700 border-blue-200", percent: 80, barColor: "bg-blue-600" };
    return { label: "Strong", color: "bg-emerald-50 text-emerald-700 border-emerald-200", percent: 100, barColor: "bg-emerald-500" };
  };

  const strength = getStrengthMeta();
  const passwordsMatch = password.length > 0 && password === passwordConfirmation;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast({
        title: "Required Field",
        description: "Please enter your current diocesan password.",
        variant: "destructive"
      });
      return;
    }

    if (!hasMinLength) {
      toast({
        title: "Security Policy Notice",
        description: "New password must be at least 8 characters in length.",
        variant: "destructive"
      });
      return;
    }

    if (password !== passwordConfirmation) {
      toast({
        title: "Mismatch Detected",
        description: "New password and confirmation do not match.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(apiUrls.admin.changePassword(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password: password,
          password_confirmation: passwordConfirmation
        })
      });

      if (res.ok) {
        toast({
          title: "Credentials Updated",
          description: "Your administrative password has been modified successfully."
        });
        setCurrentPassword("");
        setPassword("");
        setPasswordConfirmation("");
      } else {
        const err = await res.json().catch(() => null);
        toast({
          title: "Update Failed",
          description: err?.message || Object.values(err?.errors || {}).flat()[0] || "Failed to update password. Please check your current password.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Communication Error",
        description: "Unable to connect to the diocesan security gateway.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentPassword("");
    setPassword("");
    setPasswordConfirmation("");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Diocesan Unified Admin Sidebar */}
      <AdminSidebar currentPath="/admin/change-password" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Executive Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <span>Diocese of Shyogwe</span>
                <span>/</span>
                <span>Settings & Security</span>
                <span>/</span>
                <span className="text-[#0c1628] font-semibold">Change Password</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0c1628] text-[#d4af37] flex items-center justify-center shadow-xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Account Security & Credentials
                  </h1>
                  <p className="text-xs text-slate-500">
                    Maintain secure access credentials for the Shyogwe Diocesan Management Portal
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 max-w-6xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Account Profile & Security Status */}
            <div className="lg:col-span-5 space-y-6">
              {/* Profile Overview Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-full bg-slate-900 text-[#d4af37] flex items-center justify-center font-bold text-lg ring-4 ring-slate-100 shadow-inner">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-slate-900 truncate">
                      {user?.name || "Diocesan Administrator"}
                    </h2>
                    <p className="text-xs text-slate-500 truncate">{user?.email || "admin@earshyogwe.com"}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Executive Level
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                        Active Account
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      Assigned Role
                    </span>
                    <span className="font-semibold text-slate-800">
                      {user?.role ? user.role.toUpperCase() : "ADMINISTRATOR"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-slate-400" />
                      Session Integrity
                    </span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Authenticated (TLS 1.3)
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Diocesan Server Time
                    </span>
                    <span className="font-medium text-slate-700">
                      {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Directives Card */}
              <div className="bg-gradient-to-br from-[#0c1628] to-[#162744] text-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-[#d4af37]" />
                  <h3 className="text-sm font-semibold text-[#d4af37] tracking-wide">
                    Diocesan Security Policy
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  All administrative personnel must safeguard executive credentials. Passwords should be changed periodically and must never be shared across public communication channels.
                </p>

                <div className="space-y-2 text-xs text-slate-200">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 shrink-0" />
                    <span>Minimum 8 alphanumeric characters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 shrink-0" />
                    <span>Incorporate upper, lowercase, and special characters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 shrink-0" />
                    <span>Avoid common parish names or biographical dates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 shrink-0" />
                    <span>All authorization attempts are logged in the diocesan audit trail</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Change Password Form */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Update Password</h2>
                    <p className="text-xs text-slate-500">
                      Enter your current credential followed by your preferred new passphrase
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                  {/* Current Password Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your existing administrative password"
                        required
                        className="w-full text-sm px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        title={showCurrent ? "Hide password" : "Show password"}
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      {password && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${strength.color}`}>
                          Strength: {strength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter strong new passphrase"
                        required
                        className="w-full text-sm px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        title={showNew ? "Hide password" : "Show password"}
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Strength Progress Bar */}
                    {password && (
                      <div className="pt-2">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${strength.barColor}`}
                            style={{ width: `${strength.percent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Criteria Checklist */}
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                        {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                        {hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                        <span>At least one uppercase (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                        {hasLower ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                        <span>At least one lowercase (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber || hasSpecial ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                        {hasNumber || hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                        <span>Numbers or special characters</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      {passwordConfirmation && (
                        <span className={`text-[11px] font-medium ${passwordsMatch ? "text-emerald-700" : "text-red-600"}`}>
                          {passwordsMatch ? "Passwords match" : "Does not match"}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        placeholder="Re-enter new passphrase for verification"
                        required
                        className={`w-full text-sm px-3.5 py-2.5 pr-10 rounded-lg border transition-colors ${
                          passwordConfirmation && !passwordsMatch
                            ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        title={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Information Notice */}
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
                    <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span>
                        Updating your password will apply immediately to all active diocesan administrative services. You will maintain access within your current browser session.
                      </span>
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={submitting || (!currentPassword && !password && !passwordConfirmation)}
                      className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !currentPassword || !password || !passwordConfirmation}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0c1628] hover:bg-[#162744] rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating Credentials...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>Update Diocesan Credentials</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChangePassword;
