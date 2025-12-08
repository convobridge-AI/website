import { useState, useEffect } from "react";
import { Upload, Globe, Loader2, Check, AlertCircle, Trash2, FileText, Link2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface ContextSource {
  fileName?: string;
  url?: string;
  content: string;
  addedAt: string;
}

interface ContextManagerProps {
  agentId: string;
  onContextSaved?: (context: string) => void;
}

export function ContextManager({ agentId, onContextSaved }: ContextManagerProps) {
  const { toast } = useToast();
  
  // File upload state
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Website crawling state
  const [websiteUrl, setWebsiteUrl] = useState("");
  
  // Context state
  const [masterPrompt, setMasterPrompt] = useState("");
  const [fileSources, setFileSources] = useState<ContextSource[]>([]);
  const [websiteSources, setWebsiteSources] = useState<ContextSource[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processingType, setProcessingType] = useState<"file" | "website" | null>(null);

  // Load existing context on mount
  useEffect(() => {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(agentId || '');
    if (isValidObjectId) {
      loadExistingContext();
    }
  }, [agentId]);

  const loadExistingContext = async () => {
    try {
      const result = await apiClient.getContext(agentId);
      if (result.generatedContext) {
        setMasterPrompt(result.generatedContext);
      }
      if (result.contextSources) {
        setFileSources(result.contextSources.files || []);
        setWebsiteSources(result.contextSources.websites || []);
      }
    } catch (error) {
      // No context exists yet
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or TXT file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setFileInput(file);
    setFileName(file.name);
  };

  const handleUploadFile = async () => {
    if (!fileInput) return;

    setIsProcessing(true);
    setProcessingType("file");
    try {
      const result = await apiClient.processFileForContext(agentId, fileInput);
      
      if (result.generatedContext) {
        // Add to sources
        setFileSources(prev => [...prev, {
          fileName: result.fileName,
          content: result.generatedContext,
          addedAt: new Date().toISOString()
        }]);
        
        if (result.masterPrompt) {
          setMasterPrompt(result.masterPrompt);
        }

        toast({
          title: "File processed successfully!",
          description: `Extracted ${result.generatedContext.length} characters of context`,
        });

        // Clear file input
        setFileInput(null);
        setFileName(null);
        
        if (onContextSaved) {
          onContextSaved(result.masterPrompt || result.generatedContext);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error processing file",
        description: error.response?.data?.message || "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  const handleCrawlWebsite = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(websiteUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with https://",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingType("website");
    try {
      const result = await apiClient.crawlWebsiteForContext(agentId, websiteUrl);
      
      if (result.generatedContext) {
        // Add to sources
        setWebsiteSources(prev => [...prev, {
          url: result.url,
          content: result.generatedContext,
          addedAt: new Date().toISOString()
        }]);

        if (result.masterPrompt) {
          setMasterPrompt(result.masterPrompt);
        }

        toast({
          title: "Website crawled successfully!",
          description: `Extracted ${result.generatedContext.length} characters of context`,
        });

        // Clear URL input
        setWebsiteUrl("");
        
        if (onContextSaved) {
          onContextSaved(result.masterPrompt || result.generatedContext);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error crawling website",
        description: error.response?.data?.message || "Failed to crawl website",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  const handleSaveContext = async () => {
    if (!masterPrompt.trim()) {
      toast({
        title: "No context to save",
        description: "Please upload a file or crawl a website first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.saveContext(agentId, masterPrompt);
      toast({
        title: "Context saved!",
        description: "Your agent's knowledge base has been updated",
      });
      
      if (onContextSaved) {
        onContextSaved(masterPrompt);
      }
    } catch (error: any) {
      toast({
        title: "Error saving context",
        description: error.response?.data?.message || "Failed to save context",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearFile = () => {
    setFileInput(null);
    setFileName(null);
  };

  const totalSources = fileSources.length + websiteSources.length;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium">AI-Powered Knowledge Extraction</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload files or crawl websites. Our AI uses Gemini to extract and structure knowledge automatically.
              All sources are combined into a master prompt for your agent.
            </p>
          </div>
        </div>
      </div>

      {/* Sources Summary */}
      {totalSources > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">
                {totalSources} source{totalSources !== 1 ? 's' : ''} loaded
              </span>
            </div>
            <div className="flex gap-2">
              {fileSources.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <FileText className="h-3 w-3 mr-1" />
                  {fileSources.length} file{fileSources.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {websiteSources.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Globe className="h-3 w-3 mr-1" />
                  {websiteSources.length} website{websiteSources.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Upload Knowledge Files</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Supported: PDF, TXT (Max 10MB). AI will extract key information automatically.
        </p>

        {!fileName ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="font-medium">Click to upload or drag and drop</span>
                <span className="text-sm text-muted-foreground">PDF or TXT files</span>
              </div>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        ) : (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{fileName}</p>
                <p className="text-xs text-muted-foreground">Ready to process</p>
              </div>
            </div>
            <button
              onClick={handleClearFile}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Clear file"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <Button
          onClick={handleUploadFile}
          disabled={!fileInput || isProcessing}
          className="w-full"
        >
          {isProcessing && processingType === "file" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Extracting with AI...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Process File
            </>
          )}
        </Button>
      </div>

      {/* Website Crawling Section */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Crawl Website</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Enter a URL to extract content using Gemini's URL Context feature.
        </p>

        <div className="space-y-3">
          <Input
            placeholder="https://example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            disabled={isProcessing}
          />
          <Button
            onClick={handleCrawlWebsite}
            disabled={!websiteUrl.trim() || isProcessing}
            className="w-full"
            variant="outline"
          >
            {isProcessing && processingType === "website" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Crawling with AI...
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Crawl Website
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Loaded Sources List */}
      {(fileSources.length > 0 || websiteSources.length > 0) && (
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">Knowledge Sources</h3>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {fileSources.map((source, index) => (
              <div key={`file-${index}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{source.fileName}</span>
                  <span className="text-xs text-muted-foreground">
                    {source.content.length} chars
                  </span>
                </div>
              </div>
            ))}
            {websiteSources.map((source, index) => (
              <div key={`web-${index}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{source.url}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {source.content.length} chars
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Master Prompt Preview */}
      {masterPrompt && (
        <div className="border rounded-lg p-6 space-y-4 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Master Prompt Preview</h3>
            <Badge variant="outline">
              {masterPrompt.length} characters
            </Badge>
          </div>

          <Textarea
            value={masterPrompt}
            onChange={(e) => setMasterPrompt(e.target.value)}
            placeholder="Combined context will appear here..."
            className="min-h-48 resize-none font-mono text-sm"
          />

          <Button
            onClick={handleSaveContext}
            disabled={isSaving || !masterPrompt.trim()}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Master Prompt
              </>
            )}
          </Button>
        </div>
      )}

      {/* Integrations (Greyed Out / Premium) */}
      <div className="border rounded-lg p-6 space-y-4 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">CRM Integrations</h3>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-500/30">
            Pro Plan
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Connect to Salesforce, HubSpot, and other CRMs to automatically sync customer data.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {['Salesforce', 'HubSpot', 'Zendesk', 'Pipedrive'].map((integration) => (
            <div 
              key={integration}
              className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30 cursor-not-allowed"
            >
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-medium">
                {integration.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{integration}</p>
                <p className="text-xs text-muted-foreground">Upgrade to connect</p>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full" disabled>
          <Lock className="h-4 w-4 mr-2" />
          Upgrade to Pro
        </Button>
      </div>

      {/* Empty State */}
      {!masterPrompt && totalSources === 0 && (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">
            No knowledge loaded yet. Upload a file or crawl a website to get started.
          </p>
        </div>
      )}
    </div>
  );
}
