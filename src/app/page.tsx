"use client";

import { useState, useEffect } from "react";
import { SpamDetector, DetailedSpamAnalysis } from "@/lib/compliance/spam-detector";

export default function Home() {
  // Main Top-Level Navigation Tabs
  const [activeTab, setActiveTab] = useState<"campaigns" | "templates" | "contacts" | "activity" | "finder" | "analytics" | "infrastructure" | "compliance" | "saas">("activity");

  const [workspaceId, setWorkspaceId] = useState("ws_geonixa");

  // ==========================================
  // RECENT ACTIVITY TAB STATE (SCREENSHOT 11)
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
        {/* TAB: RECENT ACTIVITY (SCREENSHOT 11) */}
        {/* ========================================================================= */}
        {activeTab === "activity" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recent activity</h2>
              <button className="flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer">
                <span>Filter</span>
              </button>
            </div>

            <div className="border-b border-slate-200 flex items-center space-x-6 text-xs font-semibold text-slate-500">
              {(["All", "Opens", "Clicks", "Unsubscribes"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivitySubTab(tab.toLowerCase() as any)}
                  className={`pb-2.5 transition-all cursor-pointer ${
                    activitySubTab === tab.toLowerCase()
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

              <div className="border-t border-slate-100 p-3.5 flex items-center justify-between text-xs text-slate-500">
                <span>{activityEventsList.length > 0 ? `Showing ${activityEventsList.length} results` : "No results"}</span>
                <div className="flex items-center space-x-2">
                  <button disabled className="rounded-lg border border-slate-200 px-3 py-1 text-slate-400 font-medium">Previous</button>
                  <button disabled className="rounded-lg border border-slate-200 px-3 py-1 text-slate-400 font-medium">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: EMAIL FINDER / CHECKER / LOOKUP */}
        {activeTab === "finder" && (
          <div className="space-y-8 max-w-4xl mx-auto pt-6 text-center">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                {finderSubTab === "finder" ? "EMAIL FINDER" : finderSubTab === "checker" ? "EMAIL CHECKER" : "REVERSE EMAIL LOOKUP"}
              </span>

              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {finderSubTab === "finder"
                  ? "Find out the email address of anyone in seconds"
                  : finderSubTab === "checker"
                  ? "Verify any email address with the most accurate email checker"
                  : "Find out who's behind any email address"}
              </h1>

              <p className="text-sm text-slate-500 max-w-2xl mx-auto">
                {finderSubTab === "finder"
                  ? "Just enter a name and company to find their work email. No sign-up needed."
                  : finderSubTab === "checker"
                  ? "Instantly verify if an email is real, active, and deliverable. No sign-up required."
                  : "Instantly get details like name and company from any professional email. No sign-up required."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden text-left">
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

              {finderSubTab === "lookup" && (
                <div className="p-6 bg-slate-50/50 space-y-4">
                  <label className="block text-xs font-semibold text-slate-500">Who's behind this email address:</label>
                  <form onSubmit={handleRunEmailChecker} className="flex gap-3">
                    <input
                      type="email"
                      value={checkerEmailInput}
                      onChange={(e) => setCheckerEmailInput(e.target.value)}
                      placeholder="Email address..."
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
                      required
                    />
                    <button
                      type="submit"
                      disabled={searchingFinder}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-xs font-black tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {searchingFinder ? "SEARCHING..." : "SEARCH"}
                    </button>
                  </form>
                </div>
              )}
            </div>

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
              </div>
            )}
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
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
      </main>
    </div>
  );
}
