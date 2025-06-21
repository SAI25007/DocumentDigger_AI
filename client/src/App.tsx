import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Logout from "@/pages/Logout";
import ModernDashboard from "@/pages/ModernDashboard";
import Upload from "@/pages/Upload";
import IngestPage from "@/pages/IngestPage";
import ExtractPage from "@/pages/ExtractPage";
import ClassifyPage from "@/pages/ClassifyPage";
import RoutePage from "@/pages/RoutePage";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/logout" component={Logout} />
      
      {/* Protected/Landing routes */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={ModernDashboard} />
          <Route path="/dashboard" component={ModernDashboard} />
          <Route path="/upload" component={Upload} />
          <Route path="/ingest" component={IngestPage} />
          <Route path="/extract" component={ExtractPage} />
          <Route path="/classify" component={ClassifyPage} />
          <Route path="/route" component={RoutePage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="docflow-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
