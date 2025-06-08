import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Layers, Workflow, Upload, Search, Target, Rocket } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>
      
      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 animate-slide-up">
            <div className="flex items-center">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                DocFlow AI
              </span>
            </div>
            <Button 
              onClick={handleLogin} 
              className="gradient-primary hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center animate-slide-up">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            AI-Powered Document
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Processing Platform
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-700 max-w-3xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
            Automatically ingest, extract, classify, and route documents at scale. 
            Reduce manual work, cut errors, and get full visibility on processing status.
          </p>
          <div className="mt-10 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="gradient-primary hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg px-8 py-4 animate-pulse-glow"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 animate-fade-scale border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Ingestion</h3>
              <p className="text-gray-600">
                Automatically process PDFs, Word docs, images, and emails with intelligent prioritization.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 animate-fade-scale border-0 bg-white/70 backdrop-blur-sm" style={{animationDelay: '0.1s'}}>
            <CardContent className="pt-6">
              <div className="w-16 h-16 gradient-success rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Extraction</h3>
              <p className="text-gray-600">
                Advanced OCR and NLP to extract text, entities, dates, and key information.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 animate-fade-scale border-0 bg-white/70 backdrop-blur-sm" style={{animationDelay: '0.2s'}}>
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Classification</h3>
              <p className="text-gray-600">
                Machine learning models identify document types with high confidence scores.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 animate-fade-scale border-0 bg-white/70 backdrop-blur-sm" style={{animationDelay: '0.3s'}}>
            <CardContent className="pt-6">
              <div className="w-16 h-16 gradient-warning rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <Workflow className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Routing</h3>
              <p className="text-gray-600">
                Automatically route documents to appropriate systems with fallback handling.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Processing Pipeline Preview */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              4-Stage Processing Pipeline
            </h2>
            <p className="text-xl text-gray-600">
              Watch your documents flow through our intelligent processing system
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { stage: 1, name: 'Ingested', icon: '📥', description: 'File received and metadata extracted' },
              { stage: 2, name: 'Extracted', icon: '🔍', description: 'Text and entities extracted using AI' },
              { stage: 3, name: 'Classified', icon: '🏷️', description: 'Document type identified with confidence' },
              { stage: 4, name: 'Routed', icon: '🚀', description: 'Delivered to target systems' }
            ].map((step) => (
              <Card key={step.stage} className="text-center p-6 border-2 border-dashed border-gray-200">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.stage}. {step.name}
                  </h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="max-w-4xl mx-auto p-8 bg-primary">
            <CardContent className="pt-6">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Document Workflow?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of enterprises using DocFlow AI to process millions of documents automatically.
              </p>
              <Button 
                onClick={handleLogin}
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4"
              >
                Start Processing Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
