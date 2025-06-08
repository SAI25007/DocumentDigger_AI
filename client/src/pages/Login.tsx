import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, LogIn, Shield, Users, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to DocFlow AI
            </CardTitle>
            <p className="text-gray-600 text-sm leading-relaxed">
              Sign in to access your intelligent document processing dashboard
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In with Replit
            </Button>

            <div className="mt-8 space-y-4">
              <div className="text-center text-sm text-gray-500 mb-4">
                What you'll get access to:
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" />
                  <span>Secure document processing pipeline</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Zap className="w-4 h-4 text-purple-500 mr-3 flex-shrink-0" />
                  <span>Real-time processing status updates</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                  <span>Operator dashboard with manual overrides</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                New to DocFlow AI? Your account will be created automatically after signing in.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowRight className="w-4 h-4 mr-1 transform rotate-180" />
            Back to homepage
          </a>
        </div>
      </div>
    </div>
  );
}