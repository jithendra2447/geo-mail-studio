"use client";

import { useState, useEffect } from "react";
import { SpamDetector, DetailedSpamAnalysis } from "@/lib/compliance/spam-detector";
import { BounceGuard, BounceValidationResult } from "@/lib/compliance/bounce-guard";
import { WarmupEngine, WarmupScheduleDay } from "@/lib/warmup/warmup-engine";
import { DripEngine, DripSequence } from "@/lib/campaigns/drip-engine";
import { LeadScorer } from "@/lib/subscribers/lead-scorer";

export default function Home() {
  // Main Top-Level Navigation Tabs
  const [activeTab, setActiveTab] = useState<"campaigns" | "templates" | "contacts" | "finder" | "analytics" | "infrastructure" | "compliance" | "saas">("finder");

  const [workspaceId, setWorkspaceId] = useState("ws_geonixa");

  // ==========================================
  // EMAIL FINDER / CHECKER / LOOKUP TAB STATE (SCREENSHOTS 8 & 9)
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

  // New Campaign Form State
  const [campaignForm, setCampaignForm] = useState({
    name: "Web Development Masterclass Broadcast",
    subject: "Web Development Masterclass by Eonixa — Limited Seats",
    fromName: "Jithendra Varma",
    fromEmail: "jithendravarma.l@gmail.com",
    bodyHtml: `Hi {{subscriber.firstName}},\n\nRegistration is officially open for the Web Development Masterclass from Eonixa. Designed for students and aspiring developers, this program gives you practical hands-on experience building modern web applications.`,
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
  const [gsheetUrl, setGsheetUrl] = useState("");
  const [gsheetName, setGsheetName] = useState("Sheet1");
  const [copyPasteEmails, setCopyPasteEmails] = useState("student1@geonixa.com\nstudent2@geonixa.com\ncontact@enterprise.io");

  // Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCampaignModal, setSelectedCampaignModal] = useState<any>(null);

  // Templates Tab State
  const [templatesList, setTemplatesList] = useState<any[]>([
    { id: "t1", name: "Masterclass Onboarding HTML", lastModified: "2 hours ago", body: "<h1>Welcome to Eonixa</h1>" },
    { id: "t2", name: "Product Launch Announcement", lastModified: "Yesterday", body: "<h2>New Features Live</h2>" },
  ]);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateBody, setNewTemplateBody] = useState("");

  // Contacts Tab State
  const [contactsSubTab, setContactsSubTab] = useState<"all" | "unsubscribers" | "blocklist" | "lists">("all");

  // Infrastructure & Domain Activation State
  const [customSmtpHost, setCustomSmtpHost] = useState("smtp.geonixa.com");
  const [customSmtpPort, setCustomSmtpPort] = useState(587);
  const [customSmtpUser, setCustomSmtpUser] = useState("admin@geonixa.com");
  const [customSmtpPass, setCustomSmtpPass] = useState("nswymhicrcfgctmu");
  const [savingCustomSmtp, setSavingCustomSmtp] = useState(false);
  const [testingSmtpServer, setTestingSmtpServer] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<any>(null);

  // Domain Verification State
  const [inputDomain, setInputDomain] = useState("geonixa.com");
  const [registeringDomain, setRegisteringDomain] = useState(false);
  const [domainRecords, setDomainRecords] = useState<any>(null);
  const [registeredDomains, setRegisteredDomains] = useState<any[]>([]);
  const [verifyingDns, setVerifyingDns] = useState(false);
  const [dnsCheckResult, setDnsCheckResult] = useState<any>(null);
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);

  // SaaS Billing & Team State
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
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MARKETER");
  const [apiDocLang, setApiDocLang] = useState<"curl" | "node" | "python" | "go">("curl");

  // Spam Checker State
  const [spamInputText, setSpamInputText] = useState<string>(
    `Hello Future Innovator,\n\nWe are thrilled to welcome you to the Geonixa Internship & Skill Development Program.`
  );
  const [detailedSpamAnalysis, setDetailedSpamAnalysis] = useState<DetailedSpamAnalysis | null>(null);

  // Server Data Fetching State
  const [analytics, setAnalytics] = useState<any>(null);
  const [subscribersData, setSubscribersData] = useState<any>(null);
  const [campaignsList, setCampaignsList] = useState<any[]>([]);
  const [smtpPoolData, setSmtpPoolData] = useState<any>(null);
  const [sendingCampaign, setSendingCampaign] = useState(false);

  useEffect(() => {
    const analysis = SpamDetector.analyzeDetailed(spamInputText);
    setDetailedSpamAnalysis(analysis);
  }, [spamInputText]);

  useEffect(() => {
    fetchAnalytics();
    fetchSubscribers();
    fetchDomains();
    fetchCampaigns();
    fetchSmtpPoolAndAutoSeed();
  }, [workspaceId]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics?workspaceId=${workspaceId}`);
      const data = await res.json();
      setAnalytics(data);
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

  const fetchDomains = async () => {
    try {
      const res = await fetch(`/api/domains/verify?workspaceId=${workspaceId}`);
      const data = await res.json();
      setRegisteredDomains(data.domains || []);
    } catch (err) {
      console.error("Failed to fetch domains:", err);
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

  const fetchSmtpPoolAndAutoSeed = async () => {
    try {
      const res = await fetch(`/api/smtp-accounts?workspaceId=${workspaceId}`);
      const data = await res.json();
      if (!data.accounts || data.accounts.length === 0) {
        await fetch("/api/smtp-accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "seed_unlimited", workspaceId }),
        });
        const reFetch = await fetch(`/api/smtp-accounts?workspaceId=${workspaceId}`);
        const reData = await reFetch.json();
        setSmtpPoolData(reData);
      } else {
        setSmtpPoolData(data);
      }
    } catch (err) {
      console.error("Failed to fetch SMTP pool:", err);
    }
  };

  const handleRunEmailFinder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchingFinder(true);
    setFinderResult(null);

    try {
      const res = await fetch("/api/email-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: finderFullName || "Satya Nadella", domain: finderDomain || "microsoft.com" }),
      });
      const data = await res.json();
      setFinderResult(data);
    } catch (err: any) {
      setFinderResult({ error: err.message });
    } finally {
      setSearchingFinder(false);
    }
  };

  const handleRunEmailChecker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchingFinder(true);
    setFinderResult(null);

    try {
      const res = await fetch("/api/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: checkerEmailInput }),
      });
      const data = await res.json();
      setFinderResult({
        foundEmail: checkerEmailInput,
        confidenceScore: data.result?.isValid ? "100% Valid & Active Inbox" : "Invalid Address",
        permutations: [checkerEmailInput],
        details: data.result,
      });
    } catch (err: any) {
      setFinderResult({ error: err.message });
    } finally {
      setSearchingFinder(false);
    }
  };

  const handleSendCampaign = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSendingCampaign(true);

    try {
      await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...campaignForm, workspaceId, sendNow: true, followUps: followUpEmails }),
      });
      fetchCampaigns();
      fetchAnalytics();
      setIsCreatingCampaign(false);
    } catch (err: any) {
      console.error("Send campaign error:", err);
    } finally {
      setSendingCampaign(false);
    }
  };

  const handleAddFollowUpEmail = () => {
    const newStep = {
      id: `step_${followUpEmails.length + 1}`,
      delayDays: 3,
      subject: `Re: ${campaignForm.subject}`,
      bodyHtml: `Hi {{subscriber.firstName}},\n\nJust following up on my previous email regarding the Web Development Masterclass from Eonixa.`,
    };
    setFollowUpEmails([...followUpEmails, newStep]);
  };

  const handleSaveRecipientsSelection = () => {
    if (recipientTab === "gsheets") {
      setSelectedRecipientsText(`Google Sheets: ${gsheetName || "Sheet1"}`);
    } else if (recipientTab === "csv") {
      setSelectedRecipientsText("Imported CSV Mailing List (248 recipients)");
    } else if (recipientTab === "contacts") {
      setSelectedRecipientsText(`Workspace Contacts (${subscribersData?.totalCount || 350})`);
    } else {
      const count = copyPasteEmails.split("\n").filter(Boolean).length;
      setSelectedRecipientsText(`Pasted Emails (${count} recipients)`);
    }
    setShowRecipientModal(false);
  };

  const handleRegisterDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDomain) return;

    setRegisteringDomain(true);
    setDomainRecords(null);

    try {
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, domain: inputDomain }),
      });
      const data = await res.json();
      setDomainRecords(data);
      fetchDomains();
    } catch (err: any) {
      setDomainRecords({ error: err.message });
    } finally {
      setRegisteringDomain(false);
    }
  };

  const handleVerifyDomainDns = async (domainToVerify: string) => {
    setVerifyingDns(true);
    setDnsCheckResult(null);

    try {
      const res = await fetch("/api/domains/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, domain: domainToVerify }),
      });
      const data = await res.json();
      setDnsCheckResult(data);
      fetchDomains();
    } catch (err: any) {
      setDnsCheckResult({ error: err.message });
    } finally {
      setVerifyingDns(false);
    }
  };

  const handleCopyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedRecord(label);
    setTimeout(() => setCopiedRecord(null), 2500);
  };

  const handleCreateNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName) return;
    const newT = {
      id: `t_${Date.now()}`,
      name: newTemplateName,
      lastModified: "Just now",
      body: newTemplateBody || "<p>Sample email body</p>",
    };
    setTemplatesList([newT, ...templatesList]);
    setNewTemplateName("");
    setNewTemplateBody("");
    setShowCreateTemplateModal(false);
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
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="font-bold">Analytics</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${activeTab === "analytics" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab("infrastructure")}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left ${
                activeTab === "infrastructure"
                  ? "bg-blue-600 text-white shadow-md shadow-indigo-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="font-bold">SMTP Infrastructure</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${activeTab === "infrastructure" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}>
                Unlimited
              </span>
            </button>

            <button
              onClick={() => setActiveTab("compliance")}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left ${
                activeTab === "compliance"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="font-bold">Deliverability Guard</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${activeTab === "compliance" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                100% Score
              </span>
            </button>

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
          </nav>
        </div>

        {/* Sidebar System Status */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="rounded-xl bg-blue-50/80 p-3 border border-blue-200/80 text-[11px] font-medium text-blue-950 space-y-1 shadow-xs">
            <div className="flex items-center space-x-2 font-bold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Unlimited Engine Active</span>
            </div>
            <p className="text-[10px] text-blue-800 font-bold font-mono">
              Capacity: Unlimited Sending
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-1 min-h-screen p-8 overflow-y-auto bg-[#f8fafc]">
        {/* ========================================================================= */}
        {/* TAB: EMAIL FINDER / EMAIL CHECKER / EMAIL LOOKUP (DYNAMIC HEADER SCREENSHOT 9) */}
        {/* ========================================================================= */}
        {activeTab === "finder" && (
          <div className="space-y-8 max-w-4xl mx-auto pt-6 text-center">
            {/* Header Section (Dynamic per tab) */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                {finderSubTab === "finder" ? "EMAIL FINDER" : finderSubTab === "checker" ? "EMAIL CHECKER" : "EMAIL LOOKUP"}
              </span>

              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {finderSubTab === "finder"
                  ? "Find out the email address of anyone in seconds"
                  : finderSubTab === "checker"
                  ? "Verify any email address with the most accurate email checker"
                  : "Find all email addresses associated with any domain"}
              </h1>

              <p className="text-sm text-slate-500 max-w-2xl mx-auto">
                {finderSubTab === "finder"
                  ? "Just enter a name and company to find their work email. No sign-up needed."
                  : finderSubTab === "checker"
                  ? "Instantly verify if an email is real, active, and deliverable. No sign-up required."
                  : "Discover key decision makers and corporate emails by domain name."}
              </p>
            </div>

            {/* Email Finder Main Card Container */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden text-left">
              {/* 3 Tab Selector Bar */}
              <div className="grid grid-cols-3 border-b border-slate-200 text-center font-bold text-xs">
                <button
                  onClick={() => setFinderSubTab("finder")}
                  className={`py-3.5 transition-all cursor-pointer ${
                    finderSubTab === "finder" ? "bg-slate-50 text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  EMAIL FINDER
                </button>
                <button
                  onClick={() => setFinderSubTab("checker")}
                  className={`py-3.5 transition-all cursor-pointer ${
                    finderSubTab === "checker" ? "bg-slate-50 text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  EMAIL CHECKER
                </button>
                <button
                  onClick={() => setFinderSubTab("lookup")}
                  className={`py-3.5 transition-all cursor-pointer ${
                    finderSubTab === "lookup" ? "bg-slate-50 text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  EMAIL LOOKUP
                </button>
              </div>

              {/* Tab 1: Email Finder Form */}
              {finderSubTab === "finder" && (
                <div className="p-6 bg-slate-50/50 space-y-4">
                  <label className="block text-xs font-semibold text-slate-500">Find an email address by name:</label>
                  <form onSubmit={handleRunEmailFinder} className="flex gap-3">
                    <input
                      type="text"
                      value={finderFullName}
                      onChange={(e) => setFinderFullName(e.target.value)}
                      placeholder="Full name..."
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs text-slate-900 font-medium focus:border-blue-600 focus:outline-none shadow-xs"
                      required
                    />
                    <input
                      type="text"
                      value={finderDomain}
                      onChange={(e) => setFinderDomain(e.target.value)}
                      placeholder="company.com"
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
                      required
                    />
                    <button
                      type="submit"
                      disabled={searchingFinder}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-xs font-black tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {searchingFinder ? "SEARCHING..." : "FIND EMAIL"}
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Email Checker Form (SCREENSHOT 9) */}
              {finderSubTab === "checker" && (
                <div className="p-6 bg-slate-50/50 space-y-4">
                  <label className="block text-xs font-semibold text-slate-500">Enter an email address to verify:</label>
                  <form onSubmit={handleRunEmailChecker} className="flex gap-3">
                    <input
                      type="email"
                      value={checkerEmailInput}
                      onChange={(e) => setCheckerEmailInput(e.target.value)}
                      placeholder="Email address..."
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs text-slate-900 font-medium focus:border-blue-600 focus:outline-none shadow-xs"
                      required
                    />
                    <button
                      type="submit"
                      disabled={searchingFinder}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-xs font-black tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {searchingFinder ? "VERIFYING..." : "VERIFY"}
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 3: Email Lookup Form */}
              {finderSubTab === "lookup" && (
                <div className="p-6 bg-slate-50/50 space-y-4">
                  <label className="block text-xs font-semibold text-slate-500">Enter a domain name to lookup:</label>
                  <form onSubmit={handleRunEmailFinder} className="flex gap-3">
                    <input
                      type="text"
                      value={finderDomain}
                      onChange={(e) => setFinderDomain(e.target.value)}
                      placeholder="company.com"
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
                      required
                    />
                    <button
                      type="submit"
                      disabled={searchingFinder}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-xs font-black tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {searchingFinder ? "LOOKING UP..." : "LOOKUP"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Found Result Display Card */}
            {finderResult && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Verification Result</span>
                    <span className="text-xl font-black text-slate-900 font-mono">{finderResult.foundEmail}</span>
                  </div>
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {finderResult.confidenceScore}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Generated Permutations:</span>
                  <div className="flex flex-wrap gap-2">
                    {finderResult.permutations?.map((p: string, idx: number) => (
                      <span key={idx} className="rounded-lg bg-white border border-emerald-200 px-3 py-1 font-mono text-xs text-slate-800">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Interactive Example Link */}
            <p className="text-xs text-slate-500">
              Give it a try with{" "}
              <button
                onClick={() => {
                  if (finderSubTab === "checker") {
                    setCheckerEmailInput("snadella@microsoft.com");
                  } else {
                    setFinderFullName("Satya Nadella");
                    setFinderDomain("microsoft.com");
                  }
                }}
                className="text-blue-600 font-bold hover:underline"
              >
                {finderSubTab === "checker" ? "snadella@microsoft.com" : "Satya Nadella"}
              </button>
              . It's free!
            </p>
          </div>
        )}

        {/* TAB: CAMPAIGNS */}
        {activeTab === "campaigns" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {!isCreatingCampaign ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campaigns</h2>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer">
                      <span>Filter</span>
                    </button>
                    <button
                      onClick={() => setIsCreatingCampaign(true)}
                      className="flex items-center space-x-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span>+ New campaign</span>
                    </button>
                  </div>
                </div>

                <div className="border-b border-slate-200 flex items-center space-x-6 text-xs font-semibold text-slate-500">
                  {(["Recent", "Active", "Scheduled", "Drafts", "Ended", "All"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCampaignSubTab(tab.toLowerCase() as any)}
                      className={`pb-2.5 transition-all cursor-pointer ${
                        campaignSubTab === tab.toLowerCase()
                          ? "text-blue-600 font-bold border-b-2 border-blue-600"
                          : "hover:text-slate-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-bold">
                        <th className="p-4">Name</th>
                        <th className="p-4 text-center">Sent</th>
                        <th className="p-4 text-center">Opens</th>
                        <th className="p-4 text-center">Clicks</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Ended ⬇</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {campaignsList.length > 0 ? (
                        campaignsList.map((c: any) => (
                          <tr key={c.id} className="hover:bg-slate-50/80">
                            <td className="p-4 font-bold text-slate-900">{c.name}</td>
                            <td className="p-4 text-center font-bold text-slate-800">{c.stats?.sentCount || c._count?.emailLogs || 4}</td>
                            <td className="p-4 text-center text-emerald-600 font-bold">{c.stats?.openRate || "48.5%"}</td>
                            <td className="p-4 text-center text-blue-600 font-bold">{c.stats?.clickRate || "18.2%"}</td>
                            <td className="p-4 text-center">
                              <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 font-bold text-[10px]">
                                {c.status || "ENDED"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedCampaignModal(c)}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                              >
                                Inspect Audit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-16 text-center">
                            <h4 className="text-base font-bold text-slate-900">Nothing to see here</h4>
                            <p className="text-xs text-slate-500 mt-1">You have no campaigns matching your filters.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="border-t border-slate-100 p-3.5 flex items-center justify-between text-xs text-slate-500">
                    <span>{campaignsList.length > 0 ? `Showing ${campaignsList.length} results` : "No results"}</span>
                    <div className="flex items-center space-x-2">
                      <button disabled className="rounded-lg border border-slate-200 px-3 py-1 text-slate-400 font-medium">Previous</button>
                      <button disabled className="rounded-lg border border-slate-200 px-3 py-1 text-slate-400 font-medium">Next</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsCreatingCampaign(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900"
                    >
                      ← Back to campaigns
                    </button>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">New campaign</h2>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowPreviewModal(true)}
                      className="rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                    >
                      Show preview
                    </button>
                    <button
                      onClick={() => handleSendCampaign()}
                      disabled={sendingCampaign}
                      className="flex items-center space-x-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <span>{sendingCampaign ? "Sending..." : "Send emails"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                      <div className="flex items-center text-xs border-b border-slate-100 pb-3">
                        <label className="w-16 font-semibold text-slate-500">From</label>
                        <select
                          value={campaignForm.fromEmail}
                          onChange={(e) => setCampaignForm({ ...campaignForm, fromEmail: e.target.value })}
                          className="flex-1 bg-transparent font-semibold text-slate-900 outline-none cursor-pointer"
                        >
                          <option value="jithendravarma.l@gmail.com">jithendra varma &lt;jithendravarma.l@gmail.com&gt;</option>
                          <option value="admin@geonixa.com">Geonixa Admin &lt;admin@geonixa.com&gt;</option>
                        </select>
                      </div>

                      <div className="flex items-center text-xs border-b border-slate-100 pb-3">
                        <label className="w-16 font-semibold text-slate-500">To</label>
                        <button
                          type="button"
                          onClick={() => setShowRecipientModal(true)}
                          className="rounded-lg border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 px-3.5 py-1 text-xs font-bold transition-all cursor-pointer"
                        >
                          {selectedRecipientsText}
                        </button>
                      </div>

                      <div className="flex items-center text-xs border-b border-slate-100 pb-3">
                        <label className="w-16 font-semibold text-slate-500">Subject</label>
                        <input
                          type="text"
                          value={campaignForm.subject}
                          onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                          placeholder="Enter your email subject"
                          className="flex-1 text-xs text-slate-900 font-medium outline-none"
                        />
                      </div>

                      <div className="flex items-center flex-wrap gap-1.5 border-b border-slate-200 pb-2 text-xs text-slate-700 font-bold">
                        <button className="px-2 py-1 hover:bg-slate-100 rounded">B</button>
                        <button className="px-2 py-1 hover:bg-slate-100 rounded italic">I</button>
                        <button className="px-2 py-1 hover:bg-slate-100 rounded underline">U</button>
                        <button className="px-2 py-1 hover:bg-slate-100 rounded">A ▾</button>
                        <div className="h-4 w-px bg-slate-200 mx-1" />
                        <button className="px-2 py-1 hover:bg-slate-100 rounded">Link</button>
                        <button className="px-2 py-1 hover:bg-slate-100 rounded">Image</button>
                        <button className="px-2 py-1 hover:bg-slate-100 rounded">Merge Tags {"{}"} ▾</button>
                        <div className="h-4 w-px bg-slate-200 mx-1" />
                        <select className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                          <option>Sans Serif</option>
                          <option>Serif</option>
                          <option>Monospace</option>
                        </select>
                        <select className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                          <option>Normal Size</option>
                          <option>Large</option>
                          <option>Huge</option>
                        </select>
                      </div>

                      <textarea
                        rows={12}
                        value={campaignForm.bodyHtml}
                        onChange={(e) => setCampaignForm({ ...campaignForm, bodyHtml: e.target.value })}
                        className="w-full text-xs text-slate-900 outline-none resize-none leading-relaxed font-sans"
                        placeholder="Write your email body here..."
                      />
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                      {followUpEmails.map((step, idx) => (
                        <div key={step.id} className="w-full space-y-3">
                          <div className="h-6 w-px bg-slate-300 mx-auto" />
                          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-2">
                              <span>Follow-up Step #{idx + 1} (Send after {step.delayDays} days if no reply)</span>
                              <button
                                onClick={() => setFollowUpEmails(followUpEmails.filter((f) => f.id !== step.id))}
                                className="text-rose-600 hover:text-rose-700"
                              >
                                Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={step.subject}
                              onChange={(e) => {
                                const updated = [...followUpEmails];
                                updated[idx].subject = e.target.value;
                                setFollowUpEmails(updated);
                              }}
                              className="w-full text-xs font-medium border border-slate-200 rounded p-2 text-slate-900"
                            />
                            <textarea
                              rows={4}
                              value={step.bodyHtml}
                              onChange={(e) => {
                                const updated = [...followUpEmails];
                                updated[idx].bodyHtml = e.target.value;
                                setFollowUpEmails(updated);
                              }}
                              className="w-full text-xs border border-slate-200 rounded p-2 text-slate-900"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="h-6 w-px bg-slate-300" />
                      <button
                        type="button"
                        onClick={handleAddFollowUpEmail}
                        className="rounded-lg border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Add a follow-up email
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                      Settings
                    </h3>

                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Schedule send</span>
                        <input
                          type="checkbox"
                          checked={campaignSettings.scheduleSend}
                          onChange={(e) => setCampaignSettings({ ...campaignSettings, scheduleSend: e.target.checked })}
                          className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-700 block">Autopilot</span>
                          <span className="text-[10px] text-slate-400">Auto throttle send rates</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={campaignSettings.autopilot}
                          onChange={(e) => setCampaignSettings({ ...campaignSettings, autopilot: e.target.checked })}
                          className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-700 block">Track emails</span>
                          <span className="text-[10px] text-slate-400">Open & link click tracking</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={campaignSettings.trackEmails}
                          onChange={(e) => setCampaignSettings({ ...campaignSettings, trackEmails: e.target.checked })}
                          className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-700 block">Unsubscribe link</span>
                          <span className="text-[10px] text-slate-400">Include RFC 8058 header</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={campaignSettings.unsubscribeLink}
                          onChange={(e) => setCampaignSettings({ ...campaignSettings, unsubscribeLink: e.target.checked })}
                          className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: TEMPLATES */}
        {activeTab === "templates" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Templates</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create and manage reusable email templates.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  More ▾
                </button>
                <button
                  onClick={() => setShowCreateTemplateModal(true)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  + New template
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-bold">
                    <th className="p-4">Name</th>
                    <th className="p-4 text-right">Last modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templatesList.length > 0 ? (
                    templatesList.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{t.name}</td>
                        <td className="p-4 text-right text-slate-500">{t.lastModified}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-16 text-center space-y-3">
                        <h4 className="text-base font-bold text-slate-900">No templates found</h4>
                        <p className="text-xs text-slate-500">Compose a template to quickly send it with just a few clicks.</p>
                        <button
                          onClick={() => setShowCreateTemplateModal(true)}
                          className="rounded-lg bg-blue-600 text-white px-4 py-2 text-xs font-bold hover:bg-blue-700"
                        >
                          Create a template
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="border-t border-slate-100 p-3.5 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {templatesList.length} templates</span>
                <div className="flex items-center space-x-2">
                  <button disabled className="rounded-lg border border-slate-200 px-3 py-1 text-slate-400 font-medium">Previous</button>
                  <button disabled className="rounded-lg border border-slate-200 px-3 py-1 text-slate-400 font-medium">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CONTACTS */}
        {activeTab === "contacts" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contacts</h2>
              <div className="flex items-center space-x-3">
                <button className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Filter
                </button>
                <button className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Export
                </button>
                <button className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer">
                  Actions ▾
                </button>
              </div>
            </div>

            <div className="border-b border-slate-200 flex items-center space-x-6 text-xs font-semibold text-slate-500">
              {(["All", "Unsubscribers", "Blocklist", "Your lists"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setContactsSubTab(tab.toLowerCase() as any)}
                  className={`pb-2.5 transition-all cursor-pointer ${
                    contactsSubTab === tab.toLowerCase()
                      ? "text-blue-600 font-bold border-b-2 border-blue-600"
                      : "hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-bold">
                    <th className="p-4">Email address</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Created ⬇</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscribersData?.subscribers?.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">{s.email}</td>
                      <td className="p-4 text-center">
                        <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 font-bold text-[10px]">
                          {s.status || "SUBSCRIBED"}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-500 font-medium">Active Lead</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-slate-500 text-xs">
                        No contacts found in workspace.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OTHER TABS */}
        {activeTab === "analytics" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900">Mail Analytics Dashboard</h2>
            <div className="grid grid-cols-6 gap-3">
              <div className="rounded-2xl border bg-white p-4 space-y-1"><p className="text-[9px] font-bold text-slate-400">SENT</p><p className="text-2xl font-black">{analytics?.metrics?.totalEmailsSent || 1248}</p></div>
              <div className="rounded-2xl border bg-white p-4 space-y-1"><p className="text-[9px] font-bold text-slate-400">OPEN RATE</p><p className="text-2xl font-black text-emerald-600">{analytics?.metrics?.openRatePercentage || "48.5"}%</p></div>
              <div className="rounded-2xl border bg-white p-4 space-y-1"><p className="text-[9px] font-bold text-slate-400">CLICK RATE</p><p className="text-2xl font-black text-blue-600">{analytics?.metrics?.clickRatePercentage || "18.2"}%</p></div>
              <div className="rounded-2xl border bg-white p-4 space-y-1"><p className="text-[9px] font-bold text-slate-400">BOUNCE RATE</p><p className="text-2xl font-black">0.00%</p></div>
              <div className="rounded-2xl border bg-white p-4 space-y-1"><p className="text-[9px] font-bold text-slate-400">UNSUBSCRIBE</p><p className="text-2xl font-black">0.02%</p></div>
              <div className="rounded-2xl border bg-white p-4 space-y-1"><p className="text-[9px] font-bold text-slate-400">REPUTATION</p><p className="text-2xl font-black text-blue-600">98/100</p></div>
            </div>
          </div>
        )}
      </main>

      {/* SELECT RECIPIENTS MODAL */}
      {showRecipientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900">Select recipients</h3>
              <button
                onClick={() => setShowRecipientModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-1 min-h-[340px]">
              <div className="w-48 bg-slate-50 border-r border-slate-200 p-3 space-y-1">
                <button
                  onClick={() => setRecipientTab("gsheets")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    recipientTab === "gsheets" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  Google Sheets
                </button>
                <button
                  onClick={() => setRecipientTab("csv")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    recipientTab === "csv" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  Import a CSV
                </button>
                <button
                  onClick={() => setRecipientTab("contacts")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    recipientTab === "contacts" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  Contact list
                </button>
                <button
                  onClick={() => setRecipientTab("copypaste")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    recipientTab === "copypaste" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  Copy / paste
                </button>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-center">
                {recipientTab === "gsheets" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Spreadsheet</label>
                      <input
                        type="text"
                        value={gsheetUrl}
                        onChange={(e) => setGsheetUrl(e.target.value)}
                        placeholder="Copy/paste spreadsheet URL"
                        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Sheet</label>
                      <select
                        value={gsheetName}
                        onChange={(e) => setGsheetName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs text-slate-700 outline-none"
                      >
                        <option value="Sheet1">Sheet1</option>
                        <option value="Subscribers">Subscribers</option>
                      </select>
                    </div>
                  </div>
                )}

                {recipientTab === "csv" && (
                  <div className="border-2 border-dashed border-blue-400 bg-blue-50/50 rounded-xl p-8 text-center space-y-4">
                    <p className="text-xs font-semibold text-slate-700">
                      Drag a CSV file here or click the button below to upload your mailing list
                    </p>
                    <button className="rounded-lg bg-blue-600 text-white px-5 py-2.5 text-xs font-bold hover:bg-blue-700 shadow-xs">
                      Import a CSV
                    </button>
                  </div>
                )}

                {recipientTab === "contacts" && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">Workspace Contact List</span>
                    <p className="text-xs text-slate-500">Automatically pull all active subscribers in your workspace ({subscribersData?.totalCount || 350} leads).</p>
                  </div>
                )}

                {recipientTab === "copypaste" && (
                  <div className="space-y-2">
                    <textarea
                      rows={8}
                      value={copyPasteEmails}
                      onChange={(e) => setCopyPasteEmails(e.target.value)}
                      placeholder="Enter one email address per line"
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setShowRecipientModal(false)}
                className="rounded-lg bg-slate-600 text-white px-4 py-2 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleSaveRecipientsSelection}
                className="rounded-lg bg-blue-600 text-white px-5 py-2 text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                Save Recipients
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TEMPLATE MODAL */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Create New Template</h3>
            <form onSubmit={handleCreateNewTemplate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g. Masterclass Welcome Email"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Template Body HTML</label>
                <textarea
                  rows={6}
                  value={newTemplateBody}
                  onChange={(e) => setNewTemplateBody(e.target.value)}
                  placeholder="<p>Hi {{subscriber.firstName}}...</p>"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono text-slate-900 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTemplateModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 text-white px-4 py-2 text-xs font-bold hover:bg-blue-700"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
