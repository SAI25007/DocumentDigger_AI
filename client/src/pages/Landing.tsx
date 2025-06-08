import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Shield, BarChart3 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">DocFlow AI</span>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            AI-Powered Document
            <span className="text-primary block">Processing Platform</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Automatically ingest, extract, classify, and route documents at scale. 
            Reduce manual work, cut errors, and get full visibility on processing status.
          </p>
          <div className="mt-10">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-primary hover:bg-blue-700 text-lg px-8 py-4"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Ingestion</h3>
              <p className="text-gray-600">
                Automatically process PDFs, Word docs, images, and emails with intelligent prioritization.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Extraction</h3>
              <p className="text-gray-600">
                Advanced OCR and NLP to extract text, entities, dates, and key information.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Classification</h3>
              <p className="text-gray-600">
                Machine learning models identify document types with high confidence scores.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600" />
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
