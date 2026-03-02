import { useState, useEffect } from "react";
import { Upload, Globe, Loader2, Check, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

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
  
  // Generated context state
  const [generatedContext, setGeneratedContext] = useState("");
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [contextSource, setContextSource] = useState<"file" | "website" | null>(null);
  
  // Saved context state
  const [savedContext, setSavedContext] = useState("");
  const [isSavingContext, setIsSavingContext] = useState(false);

  // Load existing context on mount
  useEffect(() => {
    // Only attempt to load existing context when agentId looks like a MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(agentId || '');
    if (isValidObjectId) {
      loadExistingContext();
    }
  }, [agentId]);

  const loadExistingContext = async () => {
    try {
      const result = await apiClient.getContext(agentId);
      if (result.generatedContext) {
        setSavedContext(result.generatedContext);
        setGeneratedContext(result.generatedContext);
      }
    } catch (error) {
      // No context exists yet, which is fine
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or TXT file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setFileInput(file);
    setFileName(file.name);
  };

  const handleUploadFile = async () => {
    if (!fileInput) return;

    setIsLoadingContext(true);
    try {
      const result = await apiClient.processFileForContext(agentId, fileInput);
      
      if (result.generatedContext) {
        setGeneratedContext(result.generatedContext);
        setContextSource("file");
        toast({
          title: "File processed",
          description: "Context has been extracted from your file",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error processing file",
        description: error.response?.data?.message || "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContext(false);
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

    // Basic URL validation
    try {
      new URL(websiteUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingContext(true);
    try {
      const result = await apiClient.crawlWebsiteForContext(agentId, websiteUrl);
      
      if (result.generatedContext) {
        setGeneratedContext(result.generatedContext);
        setContextSource("website");
        toast({
          title: "Website crawled",
          description: "Content has been extracted and summarized",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error crawling website",
        description: error.response?.data?.message || "Failed to crawl website",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContext(false);
    }
  };

  const handleSaveContext = async () => {
    if (!generatedContext.trim()) {
      toast({
        title: "No context to save",
        description: "Please upload a file or crawl a website first",
        variant: "destructive",
      });
      return;
    }

    setIsSavingContext(true);
    try {
      await apiClient.saveContext(agentId, generatedContext);
      setSavedContext(generatedContext);
      toast({
        title: "Context saved",
        description: "Your agent context has been updated",
      });
      
      if (onContextSaved) {
        onContextSaved(generatedContext);
      }
    } catch (error: any) {
      toast({
        title: "Error saving context",
        description: error.response?.data?.message || "Failed to save context",
        variant: "destructive",
      });
    } finally {
      setIsSavingContext(false);
    }
  };

  const handleClearFile = () => {
    setFileInput(null);
    setFileName(null);
  };

  const handleClearContext = () => {
    setGeneratedContext("");
    setContextSource(null);
    setFileInput(null);
    setFileName(null);
    setWebsiteUrl("");
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <p className="text-sm text-foreground">
          💡 <strong>Tip:</strong> Upload files or crawl your website to extract context. Our AI will summarize and intelligently integrate this knowledge into your agent's responses.
        </p>
      </div>

      {/* File Upload Section */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Upload Knowledge Files</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Supported formats: PDF, TXT (Max 5MB)
        </p>

        {!fileName ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="font-medium">Click to upload or drag and drop</span>
                <span className="text-sm text-muted-foreground">PDF or TXT files up to 5MB</span>
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
          <div className="bg-accent/50 border border-accent rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{fileName}</p>
                <p className="text-xs text-primary">Ready to process</p>
              </div>
            </div>
            <button
              onClick={handleClearFile}
              className="text-primary hover:text-primary/80"
              title="Clear file"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <Button
          onClick={handleUploadFile}
          disabled={!fileInput || isLoadingContext}
          className="w-full"
        >
          {isLoadingContext ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Process File"
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
          Provide a website URL to extract and summarize content
        </p>

        <div className="space-y-3">
          <Input
            placeholder="https://example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            disabled={isLoadingContext}
          />
          <Button
            onClick={handleCrawlWebsite}
            disabled={!websiteUrl.trim() || isLoadingContext}
            className="w-full"
            variant="outline"
          >
            {isLoadingContext ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Crawling...
              </>
            ) : (
              "Crawl Website"
            )}
          </Button>
        </div>
      </div>

      {/* Generated Context Display */}
      {generatedContext && (
        <div className="border rounded-lg p-6 space-y-4 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {contextSource === "file" ? (
                <Upload className="h-5 w-5 text-primary" />
              ) : (
                <Globe className="h-5 w-5 text-primary" />
              )}
              <h3 className="font-semibold">
                {contextSource === "file" ? "Extracted from File" : "Extracted from Website"}
              </h3>
            </div>
            {savedContext === generatedContext && (
              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                <Check className="h-4 w-4" />
                Saved
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Review and Edit (Optional)</label>
            <Textarea
              value={generatedContext}
              onChange={(e) => setGeneratedContext(e.target.value)}
              placeholder="Your context will appear here..."
              className="min-h-64 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {generatedContext.length} characters
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveContext}
              disabled={isSavingContext || !generatedContext.trim()}
              className="flex-1"
            >
              {isSavingContext ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Context
                </>
              )}
            </Button>
            <Button
              onClick={handleClearContext}
              variant="outline"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Saved Context Status */}
      {savedContext && !generatedContext && (
        <div className="border border-primary/30 bg-primary/10 rounded-lg p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-foreground">Context Saved</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your agent has {savedContext.length} characters of context loaded
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!generatedContext && !savedContext && (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">
            No context yet. Upload a file or crawl a website to get started.
          </p>
        </div>
      )}
    </div>
  );
}
