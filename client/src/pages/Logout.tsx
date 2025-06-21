import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, CheckCircle, ArrowRight } from "lucide-react";

export default function Logout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Auto-logout after a short delay to show the page
    const timer = setTimeout(() => {
      handleLogout();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // POST to logout endpoint and redirect to login
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const handleStaySignedIn = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              {isComplete ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <Brain className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent">
              {isComplete ? "Signed Out Successfully" : "Signing Out"}
            </CardTitle>
            <p className="text-gray-600 text-sm leading-relaxed">
              {isComplete 
                ? "You have been safely signed out of DocFlow AI"
                : isLoggingOut 
                ? "Please wait while we sign you out..."
                : "Are you sure you want to sign out?"
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isLoggingOut ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Signing you out securely...</p>
              </div>
            ) : isComplete ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">Thank you for using DocFlow AI!</p>
                </div>
                <Button 
                  onClick={() => window.location.href = "/"}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Return to Homepage
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  size="lg"
                  disabled={isLoggingOut}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Yes, Sign Me Out
                </Button>
                
                <Button 
                  onClick={handleStaySignedIn}
                  variant="outline"
                  className="w-full font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  Stay Signed In
                </Button>
              </div>
            )}

            {!isLoggingOut && !isComplete && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                  Your session data and uploaded documents will remain secure.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!isLoggingOut && (
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowRight className="w-4 h-4 mr-1 transform rotate-180" />
              Back to dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
}