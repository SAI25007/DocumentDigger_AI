import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, LogIn, Shield, Users, Zap, ArrowRight, Mail, FileText, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentQuote, setCurrentQuote] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");

  const quotes = [
    "AI-powered document intelligence at your fingertips",
    "Transform chaos into structured insights",
    "Process thousands of documents in seconds",
    "Enterprise-grade security meets AI innovation"
  ];

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSSOLogin = () => {
    window.location.href = "/api/login";
  };

  const handleEmailLogin = async () => {
    setLoginError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.message || "Login failed");
        return;
      }
      window.location.href = "/";
    } catch (e) {
      setLoginError("Login failed");
    }
  };

  if (isLoading) {
    return (
      <AnimatedBackground variant="minimal">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant="neural">
      <div className="min-h-screen flex">
        {/* Left Panel - Quote Section */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">DocFlow AI</span>
            </div>
            
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold text-white leading-tight">
                {quotes[currentQuote]}
              </h1>
              <p className="text-xl text-blue-200">
                Join thousands of enterprises automating their document workflows
              </p>
            </motion.div>
            
            <div className="flex space-x-8 text-blue-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>10M+ Documents Processed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>99.9% Accuracy</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <GlassCard variant="elevated" className="p-8">
              <div className="text-center space-y-4 mb-8">
                <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">DocFlow AI</span>
                </div>
                
                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                <p className="text-blue-200">Sign in to your account</p>
              </div>

              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10"
                    />
                    <Label htmlFor="remember" className="text-sm text-blue-200">
                      Remember me
                    </Label>
                  </div>
                  <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={handleEmailLogin}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
                {loginError && (
                  <div className="text-red-400 text-sm text-center mt-2">{loginError}</div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-blue-200">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleSSOLogin}
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Login with SSO
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Connect Mailbox
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <p className="text-xs text-blue-200">
                  New to DocFlow AI? Your account will be created automatically.
                </p>
              </div>
            </GlassCard>

            <div className="mt-6 text-center">
              <a 
                href="/" 
                className="inline-flex items-center text-sm text-blue-300 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4 mr-1 transform rotate-180" />
                Back to Launch
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  );
}