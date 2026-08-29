"use client";

import { useState, useEffect } from "react";
import { SpamDetector, DetailedSpamAnalysis } from "@/lib/compliance/spam-detector";

export default function Home() {
  // Main Top-Level Navigation Tabs
  const [activeTab, setActiveTab] = useState<"campaigns" | "templates" | "contacts" | "activity" | "finder" | "analytics" | "infrastructure" | "compliance" | "saas">("saas");

  const [workspaceId, setWorkspaceId] = useState("ws_geonixa");

  // ==========================================
  // SAAS BILLING & FEATURE MATRIX TAB STATE (SCREENSHOTS 12, 13 & 14)
  // ==========================================
  const [saasSubTab, setSaasSubTab] = useState<"pricing" | "apikeys" | "team" | "docs">("pricing");
  const [currentPlan, setCurrentPlan] = useState<"Starter" | "Growth" | "Enterprise">("Enterprise");

  const [apiKeyList, setApiKeyList] = useState<any[]>([
    { id: "key_1", name: "Production Dispatcher", key: "geo_live_sk_9a87f6e5d4c3b2a1", createdAt: "2026-08-01" },
    { id: "key_2", name: "Zapier Integration Key", key: "geo_live_sk_1b2c3d4e5f6g7h8i", createdAt: "2026-08-15" },
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [teamMembers, setTeamMembers] = useState<any[]>([
    { id: "u1", name: "Jithendra Varma", email: "admin@geonixa.com", role: "OWNER" },
    { id: "u2", name: "DevOps Engineer", email: "infra@geonixa.com", role: "ADMIN" },
    { id: "u3", name: "Growth Lead", email: "growth@geonixa.com", role: "MARKETER" },
  ]);

  // ==========================================
  // RECENT ACTIVITY TAB STATE
  // ==========================================
  const [activitySubTab, setActivitySubTab] = useState<"all" | "opens" | "clicks" | "unsubscribes">("all");
  const [activityEventsList, setActivityEventsList] = useState<any[]>([]);

  // ==========================================
  // EMAIL FINDER / CHECKER / LOOKUP TAB STATE
  // ==========================================
  const [finderSubTab, setFinderSubTab] = useState<"finder" | "checker" | "lookup">("finder");
  const [finderFullName, setFinderFullName] = useState("");
  const [finderDomain, setFinderDomain] = useState("microsoft.com");
  const [checkerEmailInput, setCheckerEmailInput] = useState("snadella@microsoft.com");
  const [finderResult, setFinderResult] = useState<any>(null);
  const [searchingFinder, setSearchingFinder] = useState(false);

  // ==========================================
  // CAMPAIGNS TAB STATE
  // ==========================================
  const [campaignSubTab, setCampaignSubTab] = useState<"recent" | "active" | "scheduled" | "drafts" | "ended" | "all">("all");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    name: "Web Development Masterclass Broadcast",
    subject: "Web Development Masterclass by Eonixa — Limited Seats",
    fromName: "Jithendra Varma",
    fromEmail: "jithendravarma.l@gmail.com",
    bodyHtml: `Hi {{subscriber.firstName}},\n\nRegistration is officially open for the Web Development Masterclass from Eonixa.`,
  });

  const [campaignSettings, setCampaignSettings] = useState({
    scheduleSend: false,
    autopilot: true,
    trackEmails: true,
    unsubscribeLink: true,
  });

  const [followUpEmails, setFollowUpEmails] = useState<any[]>([]);
  const [selectedRecipientsText, setSelectedRecipientsText] = useState<string>("All Contacts (350)");

  // Recipient Modal State
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [recipientTab, setRecipientTab] = useState<"gsheets" | "csv" | "contacts" | "copypaste">("gsheets");

  // Templates Tab State
  const [templatesList, setTemplatesList] = useState<any[]>([
    { id: "t1", name: "Masterclass Onboarding HTML", lastModified: "2 hours ago", body: "<h1>Welcome to Eonixa</h1>" },
    { id: "t2", name: "Product Launch Announcement", lastModified: "Yesterday", body: "<h2>New Features Live</h2>" },
  ]);

  // Contacts Tab State
  const [contactsSubTab, setContactsSubTab] = useState<"all" | "unsubscribers" | "blocklist" | "lists">("all");

  // Server Data Fetching State
  const [analytics, setAnalytics] = useState<any>(null);
  const [subscribersData, setSubscribersData] = useState<any>(null);
  const [campaignsList, setCampaignsList] = useState<any[]>([]);
  const [sendingCampaign, setSendingCampaign] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchSubscribers();
    fetchCampaigns();
  }, [workspaceId]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics?workspaceId=${workspaceId}`);
      const data = await res.json();
      setAnalytics(data);
      setActivityEventsList(data?.recentActivity || []);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await fetch(`/api/subscribers?workspaceId=${workspaceId}`);
      const data = await res.json();
      setSubscribersData(data);
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`/api/campaigns?workspaceId=${workspaceId}`);
      const data = await res.json();
      setCampaignsList(data.campaigns || []);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    }
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    const newK = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: `geo_live_sk_${Math.random().toString(36).substring(2, 18)}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setApiKeyList([...apiKeyList, newK]);
    setNewKeyName("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased flex">
      {/* 280PX WIDE EXECUTIVE SIDEBAR */}
      <aside className="w-72 border-r border-slate-200/80 bg-white min-h-screen flex flex-col justify-between p-5 sticky top-0 h-screen overflow-y-auto shadow-xs">
        <div className="space-y-6">
          {/* Executive Brand Logo Header */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xs tracking-wider shadow-sm">
              GM
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">GEO Mail Studio</h1>
              <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-wider">Enterprise Edition</p>
            </div>
          </div>

          {/* Workspace Tenant Selector */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Active Workspace</label>
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value="ws_geonixa">Geonixa Inc (ws_geonixa)</option>
              <option value="ws_demo">Demo Workspace (ws_demo)</option>
            </select>
          </div>

          {/* SIDEBAR NAVIGATION PANELS */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("saas")}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left ${
                activeTab === "saas"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="font-bold">SaaS Billing & API</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${activeTab === "saas" ? "bg-white/20 text-white" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
                Pro Tier
              </span>
            </button>

            <button
              onClick={() => setActiveTab("activity")}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left ${
                activeTab === "activity"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="font-bold">Recent Activity</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${activeTab === "activity" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                Realtime
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("campaigns"); setIsCreatingCampaign(false); }}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left ${
                activeTab === "campaigns"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="font-bold">Campaigns</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${activeTab === "campaigns" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700 border border-slate-200"}`}>
                {campaignsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("templates")}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left ${
                activeTab === "templates"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="font-bold">Templates</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${activeTab === "templates" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                {templatesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("contacts")}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left ${
                activeTab === "contacts"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="font-bold">Contacts</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${activeTab === "contacts" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700 border border-slate-200"}`}>
                {subscribersData?.totalCount || 350}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("finder")}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left ${
                activeTab === "finder"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="font-bold">Email Finder</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${activeTab === "finder" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                Instant
              </span>
            </button>
          </nav>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-1 min-h-screen p-8 overflow-y-auto bg-[#f8fafc]">
        {/* ========================================================================= */}
        {/* TAB: SAAS BILLING & FEATURE COMPARISON MATRIX (SCREENSHOTS 12, 13 & 14) */}
        {/* ========================================================================= */}
        {activeTab === "saas" && (
          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">SaaS Suite & Billing</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Commercial plan tiers, developer REST API keys, team seats, and full feature matrix.
                </p>
              </div>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black">
                Active Plan: Enterprise Unlimited
              </span>
            </div>

            {/* Feature Comparison Matrix Table matching Screenshots 12, 13 & 14 */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">Complete Feature Breakdown Matrix</h3>
                <span className="text-xs font-semibold text-slate-500">Compare Plans & Capabilities</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-bold">
                      <th className="p-4 w-1/3">Feature Category & Capability</th>
                      <th className="p-4 text-center">Starter ($49/mo)</th>
                      <th className="p-4 text-center">Growth ($149/mo)</th>
                      <th className="p-4 text-center bg-blue-50 text-blue-900 font-extrabold">Enterprise Unlimited ($399/mo)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {/* CORE CAPABILITIES */}
                    <tr className="bg-slate-50/80 text-slate-900 font-extrabold text-xs">
                      <td colSpan={4} className="p-3 uppercase tracking-wider text-[10px] text-blue-600">CORE CAPABILITIES</td>
                    </tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Monthly limit</td><td className="p-3.5 text-center">50,000 / mo</td><td className="p-3.5 text-center">250,000 / mo</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">Unlimited</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Daily limit</td><td className="p-3.5 text-center">2,000 / day</td><td className="p-3.5 text-center">10,000 / day</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">Unlimited</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Email campaigns</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Unlimited</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Senders</td><td className="p-3.5 text-center">Up to 3 Senders</td><td className="p-3.5 text-center">Up to 10 Senders</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">Unlimited Senders</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Mail merge from Sheets</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Included</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Mail merge from Docs</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Included</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Gmail extension</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Included</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Excel add-in</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Included</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Email tracking</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Realtime Tracking</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Schedule send</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Advanced Cron</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Unsubscribe link</td><td className="p-3.5 text-center">RFC 8058</td><td className="p-3.5 text-center">RFC 8058</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">RFC 8058 1-Click</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Email templates</td><td className="p-3.5 text-center">10 Templates</td><td className="p-3.5 text-center">50 Templates</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">Unlimited Gallery</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">AI Email Writer</td><td className="p-3.5 text-center">Basic Copilot</td><td className="p-3.5 text-center">Advanced AI</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">Custom Voice AI</td></tr>

                    {/* STARTER FEATURES */}
                    <tr className="bg-slate-50/80 text-slate-900 font-extrabold text-xs">
                      <td colSpan={4} className="p-3 uppercase tracking-wider text-[10px] text-blue-600">STARTER FEATURES</td>
                    </tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Contacts</td><td className="p-3.5 text-center">5,000 Leads</td><td className="p-3.5 text-center">25,000 Leads</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">Unlimited Leads</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Autopilot</td><td className="p-3.5 text-center">✓ Standard</td><td className="p-3.5 text-center">✓ Smart Throttle</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Autonomous AI</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Shared templates</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Included</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">HTML Templates</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Included</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Email verification</td><td className="p-3.5 text-center">500 verifications</td><td className="p-3.5 text-center">2,500 verifications</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">Unlimited Realtime Verification</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Reply detection</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Smart Sentiment AI</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Zapier integration</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Native Webhooks</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Remove branding</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ White-Label SaaS</td></tr>

                    {/* PREMIUM FEATURES */}
                    <tr className="bg-slate-50/80 text-slate-900 font-extrabold text-xs">
                      <td colSpan={4} className="p-3 uppercase tracking-wider text-[10px] text-blue-600">PREMIUM FEATURES</td>
                    </tr>
                    <tr><td className="p-3.5 underline decoration-dotted">AI Email Assistant</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Unlimited AI</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Email follow-ups</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center">✓ Multi-Step Drips</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Unlimited Sequence Steps</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Sheets Automation</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Auto Sync</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Email warmup</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Automated Warmup Pool</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Bounce detection</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Bounce Guard Active</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Bot detection</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center">✓ Included</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Anti-Spam Bot Filter</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Auto labels with AI</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Automated AI Categorization</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Auto drafts in your voice</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Voice AI Engine</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Custom tracking domain</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Dedicated CNAME SSL</td></tr>

                    {/* PRO FEATURES (SCREENSHOT 14) */}
                    <tr className="bg-slate-50/80 text-slate-900 font-extrabold text-xs">
                      <td colSpan={4} className="p-3 uppercase tracking-wider text-[10px] text-blue-600">PRO FEATURES</td>
                    </tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Higher limits</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center">✓ High Bandwidth</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Unlimited Uncapped</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Inbox rotation</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center">✓ Multi-Account Pool</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Unlimited Auto-Rotation</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">CRM Integration</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center">✓ HubSpot / Salesforce</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Custom Bi-directional Sync</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Team analytics</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center">✓ Member Breakdown</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Multi-Tenant Dashboard</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Dedicated onboarding</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center text-slate-400">—</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ 1-on-1 Dedicated Architect</td></tr>
                    <tr><td className="p-3.5 underline decoration-dotted">Priority support</td><td className="p-3.5 text-center">Standard Email</td><td className="p-3.5 text-center">24/7 Live Chat</td><td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/30">✓ Dedicated Slack Channel</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Developer REST API Keys */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Developer REST API Keys</h3>
              <form onSubmit={handleCreateApiKey} className="flex gap-3">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="API Key Name (e.g. Production Dispatcher)"
                  className="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none"
                  required
                />
                <button type="submit" className="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-xs font-bold hover:bg-blue-700">
                  Generate API Key
                </button>
              </form>

              <div className="space-y-2">
                {apiKeyList.map((k) => (
                  <div key={k.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{k.name}</span>
                      <span className="font-mono text-blue-600 font-semibold">{k.key}</span>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(k.key)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-slate-700 font-bold hover:bg-slate-100"
                    >
                      Copy Key
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RECENT ACTIVITY TAB */}
        {activeTab === "activity" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recent activity</h2>
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-bold">
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Events</th>
                    <th className="p-4 text-right">Last activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activityEventsList.length > 0 ? (
                    activityEventsList.map((e: any) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{e.recipientName || "Lead Contact"}</td>
                        <td className="p-4 text-slate-800 font-mono">{e.email}</td>
                        <td className="p-4 text-center">
                          <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 font-bold text-[10px]">
                            {e.type || "OPENED"}
                          </span>
                        </td>
                        <td className="p-4 text-right text-slate-500 font-medium">{e.timestamp || "Just now"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <h4 className="text-base font-bold text-slate-900">No events yet</h4>
                        <p className="text-xs text-slate-500 mt-1">There aren't any results for this query.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
