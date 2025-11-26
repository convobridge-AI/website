import { useState, useMemo, useEffect } from "react";
import { ChevronRight, ChevronLeft, Play, Plus, Settings, Code, Phone, CheckCircle2, ArrowRight, Eye, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { LiveDemoWidget } from "@/components/LiveDemoWidget";
import { ContextManager } from "@/components/ContextManager";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface TestCall {
  id: string;
  timestamp: Date;
  scenario: string;
  duration: number;
  outcome: string;
  transcript?: string;
}

export default function AgentBuilder() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Template
  
  // Step 1: Template
  const [selectedTemplate, setSelectedTemplate] = useState<string>("Sales Agent");
  
  // Step 2: Configuration
  const [agentName, setAgentName] = useState("Sales Agent");
  const [selectedVoice, setSelectedVoice] = useState("aria");
  const [languages, setLanguages] = useState(["English", "Spanish"]);
  const [personality, setPersonality] = useState(60); // 0 = Formal, 100 = Friendly
  
  // Step 3: Prompt
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful sales assistant. Your goal is to qualify leads and schedule meetings. Be professional but friendly. Listen to the caller, ask clarifying questions, and determine their level of interest.");
  
  // Step 4: Context
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [connectedIntegrations, setConnectedIntegrations] = useState<{[key: string]: boolean}>({
    salesforce: false,
    hubspot: false,
    stripe: false,
    zapier: false
  });
  const [agentId, setAgentId] = useState<string | null>(null);
  const [creatingAgent, setCreatingAgent] = useState(false);
  
  // Step 5: Test Call
  const [testScenario, setTestScenario] = useState("Interested Prospect");
  const [testCalls, setTestCalls] = useState<TestCall[]>([]);
  const [showLiveWidget, setShowLiveWidget] = useState(false);
  const [isTestCallActive, setIsTestCallActive] = useState(false);
  
  // Step 6: Deploy
  const [isDeploying, setIsDeploying] = useState(false);
  const [agentContext, setAgentContext] = useState<string>("");

  const steps = [
    { number: 1, label: "Template", id: "template" },
    { number: 2, label: "Config", id: "config" },
    { number: 3, label: "Prompt", id: "prompt" },
    { number: 4, label: "Context", id: "context" },
    { number: 5, label: "Test", id: "test" },
    { number: 6, label: "Deploy", id: "deploy" }
  ];

  const voices = [
    { id: "aria", name: "Aria", gender: "Female", accent: "American" },
    { id: "guy", name: "Guy", gender: "Male", accent: "American" },
    { id: "jenny", name: "Jenny", gender: "Female", accent: "British" },
    { id: "chris", name: "Chris", gender: "Male", accent: "Australian" }
  ];

  const availableLanguages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Mandarin",
    "Japanese"
  ];

  const templates = [
    {
      name: "Sales Agent",
      description: "Qualify leads and book appointments",
      icon: "🎯",
      prompt: "You are a sales assistant. Qualify leads, identify pain points, and schedule follow-up meetings. Be professional and persuasive."
    },
    {
      name: "Support Agent",
      description: "Handle customer support inquiries",
      icon: "🛟",
      prompt: "You are a customer support specialist. Help resolve issues, answer questions, and escalate complex problems appropriately."
    },
    {
      name: "Scheduling Agent",
      description: "Manage appointments and reservations",
      icon: "📅",
      prompt: "You are a scheduling assistant. Help book appointments, manage calendars, and confirm meeting details with callers."
    },
    {
      name: "Custom",
      description: "Build from scratch",
      icon: "⚙️",
      prompt: "You are a helpful AI assistant. Be professional, empathetic, and provide clear guidance to callers."
    }
  ];

  const testScenarios = [
    { value: "Interested Prospect", label: "Interested Prospect", description: "Caller is interested in learning more" },
    { value: "Objection Handling", label: "Objection Handling", description: "Caller has concerns or objections" },
    { value: "Already Customer", label: "Already Customer", description: "Caller is an existing customer" },
    { value: "Busy / Rushed Caller", label: "Busy / Rushed Caller", description: "Caller is in a hurry" },
    { value: "Technical Questions", label: "Technical Questions", description: "Caller asks technical details" }
  ];

  const integrations = [
    { name: "Salesforce", icon: "🚀" },
    { name: "HubSpot", icon: "💼" },
    { name: "Stripe", icon: "💳" },
    { name: "Zapier", icon: "⚡" }
  ];

  // Helper functions
  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleIntegration = (integrationName: string) => {
    const key = integrationName.toLowerCase();
    setConnectedIntegrations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTestCallComplete = (duration: number, transcript: string) => {
    const newTestCall: TestCall = {
      id: Date.now().toString(),
      timestamp: new Date(),
      scenario: testScenario,
      duration,
      outcome: generateOutcome(testScenario),
      transcript
    };
    setTestCalls(prev => [newTestCall, ...prev]);
    setShowLiveWidget(false);
    setIsTestCallActive(false);
  };

  const generateOutcome = (scenario: string): string => {
    const outcomes: {[key: string]: string} = {
      "Interested Prospect": "Good response to qualification questions",
      "Objection Handling": "Successfully addressed objections",
      "Already Customer": "Identified as existing customer, routed appropriately",
      "Busy / Rushed Caller": "Handled time constraint professionally",
      "Technical Questions": "Provided technical details and explanation"
    };
    return outcomes[scenario] || "Test call completed";
  };

  const isStepComplete = (step: number): boolean => {
    switch(step) {
      case 1: return !!selectedTemplate;
      case 2: return !!agentName && !!selectedVoice && languages.length > 0;
      case 3: return !!systemPrompt;
      case 4: return true; // Optional, can skip
      case 5: return testCalls.length > 0;
      case 6: return true;
      default: return false;
    }
  };

  const handleDeployAgent = async () => {
    if (!agentId) {
      toast({
        title: "Error",
        description: "Agent ID not found. Please try creating the agent again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeploying(true);
      
      // Deploy the agent via API (this assigns Asterisk extension)
      const response = await apiClient.deployAgent(agentId);

      toast({
        title: "Agent deployed successfully!",
        description: `Extension ${response.deployment.extension} assigned. Your agent is now live.`,
      });

      // Show deployment details
      console.log('Deployment config:', response.deployment);
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error deploying agent",
        description: error.response?.data?.message || "Failed to deploy agent",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleContextSaved = (context: string) => {
    setAgentContext(context);
  };

  // Get agent configuration summary
  const agentConfig = useMemo(() => ({
    template: selectedTemplate,
    name: agentName,
    voice: voices.find(v => v.id === selectedVoice)?.name || "Unknown",
    languages,
    personality: personality < 33 ? "Formal" : personality < 67 ? "Balanced" : "Friendly",
    prompt: systemPrompt,
    files: uploadedFiles,
    integrations: Object.keys(connectedIntegrations).filter(k => connectedIntegrations[k as keyof typeof connectedIntegrations])
  }), [agentName, selectedVoice, languages, personality, systemPrompt, uploadedFiles, connectedIntegrations, selectedTemplate]);

  // Create a draft agent when entering Step 4 if not already created
  useEffect(() => {
    const createDraftAgent = async () => {
      if (currentStep === 4 && !agentId && !creatingAgent) {
        try {
          setCreatingAgent(true);
          const response = await apiClient.createAgent({
            name: `${agentName} (Draft)`,
            type: selectedTemplate.toLowerCase().replace(" agent", ""),
            systemPrompt,
            voice: selectedVoice,
            languages,
            personality: personality < 33 ? "formal" : personality < 67 ? "balanced" : "friendly",
            isDeployed: false
          });
          setAgentId(response.agent._id);
        } catch (error: any) {
          toast({
            title: "Error creating draft agent",
            description: error.response?.data?.message || "Failed to create draft agent",
            variant: "destructive",
          });
        } finally {
          setCreatingAgent(false);
        }
      }
    };
    createDraftAgent();
  }, [currentStep, agentId, creatingAgent, agentName, selectedTemplate, systemPrompt, selectedVoice, languages, personality, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-h2">Create New Agent</h1>
            <Button variant="outline" size="sm">Save Draft</Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.number)}
                  className={`flex items-center gap-3 pb-4 transition-all relative group cursor-pointer ${
                    currentStep === step.number
                      ? "border-b-2 border-primary"
                      : currentStep > step.number
                      ? "border-b-2 border-success"
                      : "border-b-2 border-muted"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold transition-all ${
                      currentStep === step.number
                        ? "bg-primary text-white"
                        : currentStep > step.number
                        ? "bg-success text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`text-sm font-semibold hidden sm:inline ${
                    currentStep === step.number ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </span>
                </button>

                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.number ? "bg-success" : "bg-muted"}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="text-h2 mb-2">Choose a Template</h2>
                  <p className="text-muted-foreground">Start with a pre-built template for your use case.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {templates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedTemplate(template.name);
                        setAgentName(template.name);
                        setSystemPrompt(template.prompt);
                        setCurrentStep(2);
                      }}
                      className={`p-6 border rounded-lg transition-all text-left group ${
                        selectedTemplate === template.name
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-border hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      <div className="text-3xl mb-3">{template.icon}</div>
                      <h3 className="font-semibold mb-2">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">Click to start →</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="text-h2 mb-2">Configuration</h2>
                  <p className="text-muted-foreground">Set up your agent's basic properties.</p>
                </div>

                {/* Agent Name */}
                <div className="space-y-2">
                  <label className="text-body-small font-semibold">Agent Name</label>
                  <Input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="My Sales Agent"
                    className="h-12"
                  />
                  <p className="text-caption text-muted-foreground">This name will appear in your dashboard and call logs.</p>
                </div>

                {/* Voice Selection */}
                <div className="space-y-3">
                  <label className="text-body-small font-semibold">Voice</label>
                  <div className="space-y-2">
                    {voices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.id)}
                        className={`w-full p-4 border rounded-lg text-left transition-all flex items-center justify-between group ${
                          selectedVoice === voice.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{voice.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {voice.gender} • {voice.accent}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-3">
                  <label className="text-body-small font-semibold">Languages</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                          languages.includes(lang)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personality Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-body-small font-semibold">Personality</label>
                    <span className="text-caption text-muted-foreground">
                      {personality < 33 ? "Formal" : personality < 67 ? "Balanced" : "Friendly"}
                    </span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={[personality]}
                      onValueChange={(val) => setPersonality(val[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Formal</span>
                    <span>Friendly</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="text-h2 mb-2">Master Prompt</h2>
                  <p className="text-muted-foreground">Define how your agent should behave and respond to callers.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-body-small font-semibold">System Prompt</label>
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful sales assistant..."
                    className="min-h-48 resize-none"
                  />
                  <p className="text-caption text-muted-foreground">Use {"{variables}"} to reference dynamic content from your knowledge base.</p>
                </div>

                <div>
                  <h4 className="text-body-small font-semibold mb-3">Quick Templates</h4>
                  <div className="space-y-2">
                    {templates.map((tpl, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSystemPrompt(tpl.prompt)}
                        className="w-full p-3 border rounded-lg text-left hover:bg-muted/50 transition-colors"
                      >
                        <p className="font-semibold text-sm">{tpl.name} Template</p>
                        <p className="text-xs text-muted-foreground truncate">{tpl.prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-700 font-semibold">💡 Pro Tip</p>
                  <p className="text-sm text-blue-700/90 mt-1">Be specific about goals, tone, and behavior. Reference knowledge base fields with {"{}"} syntax. Avoid contradictory instructions.</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="text-h2 mb-2">Add Context & Knowledge</h2>
                  <p className="text-muted-foreground">Provide files, data, and integrations to enhance your agent's knowledge.</p>
                </div>

                {creatingAgent ? (
                  <div className="text-center py-12">
                    <div className="animate-spin inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    <p className="mt-4 text-muted-foreground">Preparing agent for context...</p>
                  </div>
                ) : agentId ? (
                  <ContextManager agentId={agentId} onContextSaved={handleContextSaved} />
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">Error: Could not create draft agent. Please try again.</p>
                  </div>
                )}

                {/* API Integrations */}
                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold">Integrations (Coming Soon)</h3>
                  <div className="space-y-2">
                    {integrations.map((integration) => (
                      <button
                        key={integration.name}
                        onClick={() => toggleIntegration(integration.name)}
                        className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all ${
                          connectedIntegrations[integration.name.toLowerCase() as keyof typeof connectedIntegrations]
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{integration.icon}</span>
                          <span className="text-sm font-medium">{integration.name}</span>
                        </div>
                        <Button 
                          variant={connectedIntegrations[integration.name.toLowerCase() as keyof typeof connectedIntegrations] ? "default" : "outline"} 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIntegration(integration.name);
                          }}
                        >
                          {connectedIntegrations[integration.name.toLowerCase() as keyof typeof connectedIntegrations] ? "Connected" : "Connect"}
                        </Button>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep > 5 && currentStep < 6 && (
              <div className="space-y-6 animate-fade-in-up text-center py-12">
                <div className="inline-flex p-4 rounded-lg bg-primary/10">
                  <Settings className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-h2 mb-2">Step 6: Deploy</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Assign a phone number, configure routing rules, and launch your agent to production.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in-up">
                {!showLiveWidget ? (
                  <>
                    <div>
                      <h2 className="text-h2 mb-2">Test Your Agent</h2>
                      <p className="text-muted-foreground">Make a live test call to verify your agent's behavior and performance.</p>
                    </div>

                    <div className="bg-gradient-to-br from-primary/5 via-primary/2.5 to-primary/5 border border-primary/20 rounded-lg p-8">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        {/* Phone Icon */}
                        <div className="p-4 rounded-full bg-primary/10 animate-pulse">
                          <Phone className="h-12 w-12 text-primary" />
                        </div>

                        {/* Call Status */}
                        <div className="text-center space-y-2">
                          <h3 className="text-h3 font-semibold">Ready to Test Your Agent</h3>
                          <p className="text-muted-foreground">Your agent "{agentName}" is configured and ready for a test call.</p>
                        </div>

                        {/* Test Call Instructions */}
                        <div className="w-full bg-card border rounded-lg p-6 space-y-4">
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">1</div>
                              <div>
                                <p className="font-semibold text-sm">Customize Test Scenario</p>
                                <p className="text-sm text-muted-foreground">Select a caller type to test different conversation paths</p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">2</div>
                              <div>
                                <p className="font-semibold text-sm">Initiate Live Call</p>
                                <p className="text-sm text-muted-foreground">Click the button below to start a real-time test call using your voice</p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">3</div>
                              <div>
                                <p className="font-semibold text-sm">Review Recording & Metrics</p>
                                <p className="text-sm text-muted-foreground">View the call transcript and performance metrics after the call</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Test Scenarios Dropdown */}
                        <div className="w-full space-y-3">
                          <label className="text-sm font-semibold">Test Scenario</label>
                          <select 
                            value={testScenario}
                            onChange={(e) => setTestScenario(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {testScenarios.map((scenario) => (
                              <option key={scenario.value} value={scenario.value}>
                                {scenario.label} - {scenario.description}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-muted-foreground">
                            The agent will be configured to handle a {testScenario.toLowerCase()} during this test call.
                          </p>
                        </div>

                        {/* Start Test Call Button */}
                        <Button 
                          size="lg" 
                          className="w-full gap-2"
                          onClick={() => {
                            setShowLiveWidget(true);
                            setIsTestCallActive(true);
                          }}
                        >
                          <Phone className="h-5 w-5" />
                          Start Test Call
                        </Button>

                        {/* Info Box */}
                        <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
                          <p className="text-sm font-semibold text-blue-700">💡 Pro Tip</p>
                          <p className="text-sm text-blue-700/90">Speak naturally with your agent. The call will be recorded and you can review the transcript and metrics afterward to evaluate performance.</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Test Calls */}
                    {testCalls.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold">Recent Test Calls</h3>
                        <div className="space-y-2">
                          {testCalls.slice(0, 3).map((call) => (
                            <div key={call.id} className="bg-card border rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-all">
                              <div>
                                <p className="text-sm font-medium">{call.timestamp.toLocaleTimeString()}</p>
                                <p className="text-xs text-muted-foreground">{call.scenario} • {call.duration}s • {call.outcome}</p>
                              </div>
                              <button 
                                onClick={() => {
                                  // Show transcript in modal
                                }}
                                className="text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Live Widget Modal */
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-lg max-w-2xl w-full max-h-96 overflow-hidden border shadow-2xl">
                      <div className="flex items-center justify-between p-6 border-b">
                        <div>
                          <h3 className="text-h3 font-semibold">Test Call: {agentName}</h3>
                          <p className="text-sm text-muted-foreground">Scenario: {testScenario}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowLiveWidget(false);
                            setIsTestCallActive(false);
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="p-6">
                        <LiveDemoWidget 
                          variant="hero"
                          agentConfig={{
                            name: agentName,
                            voice: selectedVoice,
                            systemPrompt: systemPrompt,
                            context: agentContext,
                            languages: languages,
                            personality: personality < 33 ? "Formal" : personality < 67 ? "Balanced" : "Friendly",
                            template: selectedTemplate,
                          }}
                          testScenario={testScenario}
                          onCallEnd={(duration, transcript) => {
                            handleTestCallComplete(duration, transcript);
                            setShowLiveWidget(false);
                            setIsTestCallActive(false);
                          }}
                        />
                      </div>

                      <div className="p-6 border-t bg-muted/30 text-xs text-muted-foreground">
                        <p>Agent Configuration:</p>
                        <p className="mt-1">Voice: {agentConfig.voice} • Languages: {agentConfig.languages.join(", ")} • Template: {agentConfig.template}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h2 className="text-h2 mb-2">Deploy Your Agent</h2>
                  <p className="text-muted-foreground">Assign a phone number, set routing rules, and launch your agent to production.</p>
                </div>

                <div className="bg-gradient-to-br from-success/5 via-success/2.5 to-success/5 border border-success/20 rounded-lg p-8">
                  <div className="space-y-6">
                    {/* Phone Number Assignment */}
                    <div className="space-y-3">
                      <label className="text-body-small font-semibold">Assign Phone Number</label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <button className="p-4 border border-dashed rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                          <p className="text-sm font-semibold">+1 (555) 000-0000</p>
                          <p className="text-xs text-muted-foreground mt-1">Available</p>
                        </button>
                        <button className="p-4 border border-dashed rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                          <p className="text-sm font-semibold">+1 (555) 000-0001</p>
                          <p className="text-xs text-muted-foreground mt-1">Available</p>
                        </button>
                      </div>
                    </div>

                    {/* Routing Rules */}
                    <div className="border-t pt-6">
                      <h3 className="text-body-small font-semibold mb-3">Routing Rules</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/30">
                          <input type="radio" name="routing" defaultChecked className="accent-primary" />
                          <div>
                            <p className="text-sm font-medium">Automatic</p>
                            <p className="text-xs text-muted-foreground">Agent handles all calls</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/30">
                          <input type="radio" name="routing" className="accent-primary" />
                          <div>
                            <p className="text-sm font-medium">Business Hours</p>
                            <p className="text-xs text-muted-foreground">Agent during work hours, voicemail outside</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/30">
                          <input type="radio" name="routing" className="accent-primary" />
                          <div>
                            <p className="text-sm font-medium">Hybrid</p>
                            <p className="text-xs text-muted-foreground">Agent for leads, transfer to human on demand</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t pt-6">
                      <h3 className="text-body-small font-semibold mb-3">Deployment Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Agent Name:</span>
                          <span className="font-medium">{agentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Template:</span>
                          <span className="font-medium">{selectedTemplate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Voice:</span>
                          <span className="font-medium">{agentConfig.voice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Languages:</span>
                          <span className="font-medium">{languages.join(", ")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Test Calls:</span>
                          <span className="font-medium text-success">{testCalls.length} completed</span>
                        </div>
                      </div>
                    </div>

                    {/* Launch Button */}
                    <Button 
                      size="lg" 
                      className="w-full gap-2 bg-success hover:bg-success/90"
                      onClick={handleDeployAgent}
                      disabled={isDeploying}
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Saving Agent...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Deploy Agent Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-700 font-semibold">🚀 Ready to Launch</p>
                  <p className="text-sm text-blue-700/90 mt-1">Once deployed, your agent will be live and can accept incoming calls. You can monitor performance in the dashboard and make adjustments anytime.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="animate-fade-in-up">
            <div className="sticky top-32 p-6 border rounded-lg bg-card space-y-4">
              <h3 className="font-semibold">Agent Preview</h3>

              {/* Agent Card */}
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 space-y-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Agent Name</p>
                  <p className="font-semibold text-lg">{agentConfig.name}</p>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Template</p>
                  <p className="font-semibold text-sm">{agentConfig.template}</p>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Voice</p>
                  <p className="font-semibold">{agentConfig.voice}</p>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {agentConfig.languages.map((lang) => (
                      <span key={lang} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Personality</p>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${personality}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{agentConfig.personality}</p>
                </div>

                {agentConfig.integrations.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Integrations</p>
                    <div className="flex flex-wrap gap-2">
                      {agentConfig.integrations.map((int) => (
                        <span key={int} className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                          {int}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {testCalls.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Test Status</p>
                    <p className="text-sm font-semibold text-success">✓ {testCalls.length} test call(s) completed</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(currentStep / 6) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Step {currentStep} of 6</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                ℹ️ Configuration updates in real-time as you build
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-4 items-center">
            {currentStep <= 4 && (
              <Button variant="ghost" onClick={() => setCurrentStep(6)}>
                Skip to Deploy
              </Button>
            )}
            
            <Button 
              onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
              disabled={!isStepComplete(currentStep)}
            >
              {currentStep === 6 ? "Complete Setup" : "Next"}
              {currentStep < 6 && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
