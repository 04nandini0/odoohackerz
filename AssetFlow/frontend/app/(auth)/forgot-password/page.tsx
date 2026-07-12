"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ArrowRight, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1 State
  const [email, setEmail] = useState("");
  
  // Step 2 State
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Global State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      await requestPasswordReset(email);
      setStep(2);
      setSuccess("OTP has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(otp, newPassword);
      setSuccess("Password has been reset successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Premium subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary-100 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 shadow-float min-h-[400px]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm shadow-primary-500/10">
              <KeyRound className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Reset Password</h1>
            <p className="text-slate-500">
              {step === 1 ? "Enter your email to receive a One-Time Password (OTP)" : "Enter the OTP sent to your email and a new password"}
            </p>
          </div>
          
          <AnimatePresence mode="wait">
            {success && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {success}
              </motion.div>
            )}

            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRequestOTP} 
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">Email address</label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-4 py-3 font-medium flex items-center justify-center gap-2 transition-all mt-4",
                  loading ? "opacity-70 cursor-not-allowed" : "shadow-lg shadow-primary-900/20 hover:shadow-primary-600/30"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Send OTP</span>
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword} 
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">6-Digit OTP</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 font-mono text-center tracking-widest text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all shadow-sm"
                    required
                    placeholder="------"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">New Password</label>
                <div className="relative group">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all shadow-sm"
                    required
                    placeholder="At least 8 chars, 1 letter, 1 number"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">Confirm New Password</label>
                <div className="relative group">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-4 py-3 font-medium flex items-center justify-center gap-2 transition-all mt-6",
                  loading ? "opacity-70 cursor-not-allowed" : "shadow-lg shadow-primary-900/20 hover:shadow-primary-600/30"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Reset</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.form>
          )}

          <div className="text-center mt-6">
            <button 
              type="button" 
              onClick={() => router.push('/login')} 
              className="text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
