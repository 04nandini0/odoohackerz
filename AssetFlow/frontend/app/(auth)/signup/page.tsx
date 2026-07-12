"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { UserPlus, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signup({ name, email, password, confirmPassword });
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
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
        <div className="glass-card p-8 shadow-float">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm shadow-primary-500/10">
              <UserPlus className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-500">Join AssetFlow to manage corporate assets</p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Full Name</label>
              <div className="relative group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all shadow-sm"
                  required
                  placeholder="At least 8 chars, 1 letter, 1 number"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Confirm Password</label>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <div className="text-center mt-4">
              <span className="text-slate-500 text-sm">Already have an account? </span>
              <button 
                type="button" 
                onClick={() => router.push('/login')} 
                className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}