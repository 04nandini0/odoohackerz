"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("admin@assetflow.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in");
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
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-500">Sign in to manage your corporate assets</p>
          </div>
          
          {registered && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              Account created successfully. Please sign in.
            </motion.div>
          )}

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

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
                <button 
                  type="button" 
                  onClick={() => router.push('/forgot-password')} 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Secure Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <div className="text-center mt-4">
              <span className="text-slate-500 text-sm">Don't have an account? </span>
              <button 
                type="button" 
                onClick={() => router.push('/signup')} 
                className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
}