"use client";

import { useState, useEffect } from "react";
import { SpamDetector, DetailedSpamAnalysis } from "@/lib/compliance/spam-detector";

export default function Home() {
  // Main Top-Level Navigation Tabs
  const [activeTab, setActiveTab] = useState<"features" | "campaigns" | "templates" | "contacts" | "activity" | "finder" | "analytics" | "infrastructure" | "compliance" | "saas">("features");

  const [workspaceId, setWorkspaceId] = useState("ws_geonixa");

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

  // Activity Tab State
  const [activityEventsList, setActivityEventsList] = useState<any[]>([]);

  // Server Data Fetching State
  const [analytics, setAnalytics] = useState<any>(null);
  const [subscribersData, setSubscribersData] = useState<any>(null);
  const [campaignsList, setCampaignsList] = useState<any[]>([]);

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
              onClick={() => setActiveTab("features")}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all text-left ${
                activeTab === "features"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="font-bold">Website Features</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${activeTab === "features" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                35 Features
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
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-1 min-h-screen p-8 overflow-y-auto bg-[#f8fafc]">
        {/* ========================================================================= */}
        {/* TAB 1: WEBSITE FEATURES DIRECTORY (SCREENSHOTS 15, 16, 17, 18) */}
        {/* ========================================================================= */}
        {activeTab === "features" && (
          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Website Hero Banner */}
            <div className="rounded-3xl bg-slate-900 text-white p-8 space-y-4 shadow-lg border border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-3 py-1 rounded-md">
                GEO MAIL STUDIO — PLATFORM CAPABILITIES
              </span>
              <h1 className="text-3xl font-black tracking-tight leading-snug">
                Complete Enterprise Cold Email & Marketing Suite
              </h1>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                All 35 platform features active across Core, Starter, Premium, and Pro modules with unlimited dispatch capacity, automated mail merges, and AI assistance.
              </p>
            </div>

            {/* 4 CATEGORY FEATURE GRID SHOWCASING ALL 35 FEATURES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CORE CAPABILITIES */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Core Capabilities</h3>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">13 Features</span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-800">
                  {[
                    "Monthly limit — Uncapped high throughput",
                    "Daily limit — Unlimited daily sending",
                    "Email campaigns — Multi-broadcast management",
                    "Senders — Unlimited sender identities",
                    "Mail merge from Sheets — Automated Google Sheets sync",
                    "Mail merge from Docs — Document template integration",
                    "Gmail extension — Browser extension integration",
                    "Excel add-in — Microsoft Office Excel import",
                    "Email tracking — Realtime opens & clicks",
                    "Schedule send — Precision cron scheduler",
                    "Unsubscribe link — RFC 8058 1-click header",
                    "Email templates — Reusable gallery builder",
                    "AI Email Writer — Copilot subject & body generator",
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-all border border-slate-100">
                      <span className="underline decoration-dotted decoration-slate-300 font-bold">{feat.split(" — ")[0]}</span>
                      <span className="text-[11px] text-slate-500 font-normal">{feat.split(" — ")[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* STARTER FEATURES */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Starter Features</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">8 Features</span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-800">
                  {[
                    "Contacts — Multi-list subscriber manager",
                    "Autopilot — Autonomous rate throttling",
                    "Shared templates — Workspace template library",
                    "HTML Templates — Custom HTML code editor",
                    "Email verification — MX & inbox validator",
                    "Reply detection — Smart reply & bounce parsing",
                    "Zapier integration — Webhooks & workflow trigger",
                    "Remove branding — White-label dispatch header",
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-all border border-slate-100">
                      <span className="underline decoration-dotted decoration-slate-300 font-bold">{feat.split(" — ")[0]}</span>
                      <span className="text-[11px] text-slate-500 font-normal">{feat.split(" — ")[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PREMIUM FEATURES */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Premium Features</h3>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">9 Features</span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-800">
                  {[
                    "AI Email Assistant — Smart copy improver",
                    "Email follow-ups — Multi-step drip sequences",
                    "Sheets Automation — Auto column syncing",
                    "Email warmup — Automated peer warmup pool",
                    "Bounce detection — Live bounce guard active",
                    "Bot detection — Anti-spam bot click filter",
                    "Auto labels with AI — Automatic lead tagging",
                    "Auto drafts in your voice — Voice AI engine",
                    "Custom tracking domain — CNAME SSL tracking",
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/50 transition-all border border-slate-100">
                      <span className="underline decoration-dotted decoration-slate-300 font-bold">{feat.split(" — ")[0]}</span>
                      <span className="text-[11px] text-slate-500 font-normal">{feat.split(" — ")[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRO FEATURES */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Pro Features</h3>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">6 Features</span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-800">
                  {[
                    "Higher limits — Uncapped enterprise band",
                    "Inbox rotation — Multi-account auto-rotation",
                    "CRM Integration — HubSpot & Salesforce sync",
                    "Team analytics — Multi-member breakdown",
                    "Dedicated onboarding — 1-on-1 solutions architect",
                    "Priority support — 24/7 SLA & Slack channel",
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 transition-all border border-slate-100">
                      <span className="underline decoration-dotted decoration-slate-300 font-bold">{feat.split(" — ")[0]}</span>
                      <span className="text-[11px] text-slate-500 font-normal">{feat.split(" — ")[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CAMPAIGNS */}
        {activeTab === "campaigns" && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campaigns</h2>
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-bold">
                    <th className="p-4">Name</th>
                    <th className="p-4 text-center">Sent</th>
                    <th className="p-4 text-center">Opens</th>
                    <th className="p-4 text-center">Clicks</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaignsList.length > 0 ? (
                    campaignsList.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{c.name}</td>
                        <td className="p-4 text-center font-bold">{c.stats?.sentCount || 4}</td>
                        <td className="p-4 text-center text-emerald-600 font-bold">48.5%</td>
                        <td className="p-4 text-center text-blue-600 font-bold">18.2%</td>
                        <td className="p-4 text-center"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">ENDED</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-500">No campaigns found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OTHER TABS */}
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
                        <td className="p-4 text-center"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">OPENED</span></td>
                        <td className="p-4 text-right text-slate-500 font-medium">Just now</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="py-12 text-center text-slate-500">No recent activity.</td></tr>
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
