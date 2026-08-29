"use client";

import { useState, useEffect } from "react";
import { SpamDetector, DetailedSpamAnalysis } from "@/lib/compliance/spam-detector";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"smtppool" | "spamchecker" | "campaigns" | "domains" | "analytics" | "subscribers" | "upload">("smtppool");
  const [workspaceId, setWorkspaceId] = useState("ws_geonixa");

  // Reference-Inspired Spam Checker State
  const [spamInputText, setSpamInputText] = useState<string>(
    `Hello Future Innovator,\n\nWe are thrilled to welcome you to the Geonixa Internship & Skill Development Program. This is where your academic knowledge transforms into real-world, hireable expertise.\n\nOur team has curated an intensive, hands-on experience designed to push your boundaries. Whether you are aiming to land your dream tech job or build the next big startup, your roadmap to success starts right here.\n\nYour Training Tracks\nWe bridge the gap between learning and earning through two flagship, AI-driven pathways:\n\nPro Edge Internship (2 Months): Master modern tech stacks by building deployable live projects under the direct guidance of industry veterans.\nSkill Boost Program (Job Guarantee): An intensive career accelerator featuring targeted interview prep, advanced upskilling, and a 100% placement guarantee.\nWhat’s In It For You?\nGuaranteed placements post-completion and merit-based stipend opportunities during your internship.\nIndustry-recognised credentials from AICTE, AWS, and leading multinational corporations.\nEnd-to-end startup incubation and portfolio development support.\nExclusive access to Geonixa’s closed-network hiring partners.\nThe 2-Month Roadmap\nPhase 1: Foundation (Days 1-20) – Master the core tech stack, modern tools, and essential frameworks.\nPhase 2: Micro-Project (Days 21-30) – Apply your new skills to build and deploy an independent guided project.\nPhase 3: Career Prep (Days 31-45) – Master quantitative aptitude, logical reasoning, and technical interview dynamics.\nPhase 4: Capstone (Days 46-60) – Collaborate in Agile teams to deliver a complex, client-grade major project.\nThe Geonixa Extras\nComplete LinkedIn & Resume Makeovers | 1-on-1 Mock HR & Technical Interviews | 24/7 AI-Powered Coding Assistants`
  );
  const [detailedSpamAnalysis, setDetailedSpamAnalysis] = useState<DetailedSpamAnalysis | null>(null);
  const [fixingSpamAi, setFixingSpamAi] = useState(false);

  // Mailchimp-Style Campaign Studio State
  const [campaignForm, setCampaignForm] = useState({
    name: "Web Development Course Announcement",
    subject: "🎓 Web Development Masterclass by Eonixa — Limited Seats",
    fromName: "Jithendra Varma",
    fromEmail: "jithendravarma.l@gmail.com",
    bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">\n  <div style="background-color: #0d1f1c; padding: 32px 24px; text-align: center; color: #ffffff; border-bottom: 3px solid #bef264;">\n    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #bef264;">Web Development Masterclass — Eonixa</h1>\n    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; color: #a7f3d0;">Powered by Eonixa</p>\n  </div>\n  <div style="padding: 32px 24px; color: #1e293b; line-height: 1.6; font-size: 15px;">\n    <h2 style="color: #091412; margin-top: 0; font-size: 20px;">Hi {{subscriber.firstName}}! 👋</h2>\n    <p style="margin-bottom: 20px;">Registration is officially open for the Web Development Masterclass from Eonixa. Designed for students and aspiring developers, this program gives you practical hands-on experience building modern web applications.</p>\n    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 18px; margin: 24px 0; border-radius: 8px;">\n      <h3 style="margin: 0 0 10px 0; color: #065f46; font-size: 13px; text-transform: uppercase; font-weight: 800;">Program Highlights:</h3>\n      <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px;">\n        <li style="margin-bottom: 8px;">Full-Stack Web Development: HTML, CSS, JS & Next.js</li>\n        <li style="margin-bottom: 8px;">Real-world project portfolio & live deployment guidance</li>\n        <li style="margin-bottom: 0;">Reserved capacity to ensure personalized mentorship</li>\n      </ul>\n    </div>\n    <div style="text-align: center; margin: 32px 0 16px 0;">\n      <a href="https://geonixa.com" style="background-color: #bef264; color: #081311; padding: 14px 28px; border-radius: 9999px; font-weight: 800; text-decoration: none; font-size: 15px; display: inline-block;">Secure Your Seat Now →</a>\n    </div>\n  </div>\n  <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">\n    <p style="margin: 0 0 6px 0;">Office Address: {{workspace.physicalAddress}}</p>\n    <p style="margin: 0;"><a href="{{unsubscribeUrl}}" style="color: #059669; text-decoration: underline;">Unsubscribe from emails</a></p>\n  </div>\n</div>`,
  });

  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignResult, setCampaignResult] = useState<any>(null);
  const [campaignsList, setCampaignsList] = useState<any[]>([]);

  // Multi-Account SMTP Pool State
  const [smtpPoolData, setSmtpPoolData] = useState<any>(null);
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [newSmtpEmail, setNewSmtpEmail] = useState("");
  const [newSmtpPass, setNewSmtpPass] = useState("");
  const [newSmtpLimit, setNewSmtpLimit] = useState(2000);
  const [bulkText, setBulkText] = useState(
    `sender1@geonixa.com, nswymhicrcfgctmu\nsender2@geonixa.com, nswymhicrcfgctmu\nsender3@geonixa.com, nswymhicrcfgctmu`
  );
  const [addingSmtp, setAddingSmtp] = useState(false);
  const [seedingPool, setSeedingPool] = useState(false);
  const [resettingQuota, setResettingQuota] = useState(false);

  // AI Copilot Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("for course web development from Eonixa Limited slots for students");
  const [aiTone, setAiTone] = useState<"Professional" | "Friendly" | "Urgent" | "Persuasive" | "Casual">("Friendly");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Preview Mode State
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Domain Verification State
  const [inputDomain, setInputDomain] = useState("gmail.com");
  const [registeringDomain, setRegisteringDomain] = useState(false);
  const [domainRecords, setDomainRecords] = useState<any>(null);
  const [checkingDNS, setCheckingDNS] = useState(false);
  const [dnsResult, setDnsResult] = useState<any>(null);
  const [registeredDomains, setRegisteredDomains] = useState<any[]>([]);

  // Analytics & Subscribers State
  const [analytics, setAnalytics] = useState<any>(null);
  const [subscribersData, setSubscribersData] = useState<any>(null);
  const [newSubEmail, setNewSubEmail] = useState("");
  const [newSubFirstName, setNewSubFirstName] = useState("");

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // Real-Time Detailed Spam Analysis
  useEffect(() => {
    const analysis = SpamDetector.analyzeDetailed(spamInputText);
    setDetailedSpamAnalysis(analysis);
  }, [spamInputText]);

  useEffect(() => {
    fetchAnalytics();
    fetchSubscribers();
    fetchDomains();
    fetchCampaigns();
    fetchSmtpPool();
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

  const fetchSmtpPool = async () => {
    try {
      const res = await fetch(`/api/smtp-accounts?workspaceId=${workspaceId}`);
      const data = await res.json();
      setSmtpPoolData(data);
    } catch (err) {
      console.error("Failed to fetch SMTP pool:", err);
    }
  };

  const handleManualResetQuota = async () => {
    setResettingQuota(true);
    try {
      await fetch("/api/smtp-accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      fetchSmtpPool();
    } catch (err) {
      console.error("Failed to reset quota:", err);
    } finally {
      setResettingQuota(false);
    }
  };

  const handleSeed30Accounts = async () => {
    setSeedingPool(true);
    try {
      await fetch("/api/smtp-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_30", workspaceId }),
      });
      fetchSmtpPool();
    } catch (err) {
      console.error("Failed to seed SMTP pool:", err);
    } finally {
      setSeedingPool(false);
    }
  };

  const handleAddSingleSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSmtpEmail || !newSmtpPass) return;

    setAddingSmtp(true);
    try {
      await fetch("/api/smtp-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          email: newSmtpEmail,
          password: newSmtpPass,
          dailyLimit: Number(newSmtpLimit),
        }),
      });
      setNewSmtpEmail("");
      setNewSmtpPass("");
      fetchSmtpPool();
    } catch (err) {
      console.error("Failed to add SMTP account:", err);
    } finally {
      setAddingSmtp(false);
    }
  };

  const handleBulkImportSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    setAddingSmtp(true);
    const lines = bulkText.split("\n").filter(Boolean);
    const accounts = lines.map((line) => {
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      return {
        email: parts[0],
        password: parts[1] || process.env.SMTP_PASS || "nswymhicrcfgctmu",
        dailyLimit: parts[2] ? Number(parts[2]) : 2000,
      };
    });

    try {
      await fetch("/api/smtp-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import", workspaceId, accounts }),
      });
      setBulkText("");
      fetchSmtpPool();
    } catch (err) {
      console.error("Failed to bulk import SMTP accounts:", err);
    } finally {
      setAddingSmtp(false);
    }
  };

  const handleDeleteSmtpAccount = async (id: string) => {
    try {
      await fetch(`/api/smtp-accounts?id=${id}`, { method: "DELETE" });
      fetchSmtpPool();
    } catch (err) {
      console.error("Failed to delete SMTP account:", err);
    }
  };

  const handleAutoRemoveSpam = () => {
    const clean = SpamDetector.autoFixSpamWordsWithSynonyms(spamInputText);
    setSpamInputText(clean);
  };

  const handleAiAutoFixSpam = async () => {
    setFixingSpamAi(true);
    try {
      const res = await fetch("/api/ai/fix-spam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: spamInputText }),
      });
      const data = await res.json();
      if (res.ok && data.fixedText) {
        setSpamInputText(data.fixedText);
      }
    } catch (err) {
      console.error("AI Fix Spam Error:", err);
    } finally {
      setFixingSpamAi(false);
    }
  };

  const handleClearEditor = () => {
    setSpamInputText("");
  };

  const handleGenerateAiTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt) return;

    setGeneratingAi(true);

    try {
      const res = await fetch("/api/ai/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, tone: aiTone, brandName: "Eonixa" }),
      });

      const data = await res.json();
      if (res.ok && data.htmlBody) {
        setCampaignForm({
          ...campaignForm,
          subject: data.subject,
          bodyHtml: data.htmlBody,
        });
        setSpamInputText(data.htmlBody.replace(/<[^>]*>/g, " "));
        setShowAiModal(false);
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleRegisterDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDomain) return;

    setRegisteringDomain(true);
    setDomainRecords(null);
    setDnsResult(null);

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

  const handleRunDNSCheck = async (domainToCheck: string) => {
    setCheckingDNS(true);
    setDnsResult(null);

    try {
      const res = await fetch("/api/domains/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, domain: domainToCheck }),
      });
      const data = await res.json();
      setDnsResult(data);
      fetchDomains();
    } catch (err: any) {
      setDnsResult({ error: err.message });
    } finally {
      setCheckingDNS(false);
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingCampaign(true);
    setCampaignResult(null);

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...campaignForm, workspaceId, sendNow: true }),
      });

      const data = await response.json();
      setCampaignResult({ status: response.status, data });
      fetchCampaigns();
      fetchAnalytics();
      fetchSmtpPool();
    } catch (err: any) {
      setCampaignResult({ status: 500, data: { error: err.message } });
    } finally {
      setSendingCampaign(false);
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail) return;

    try {
      await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, email: newSubEmail, firstName: newSubFirstName }),
      });
      setNewSubEmail("");
      setNewSubFirstName("");
      fetchSubscribers();
    } catch (err) {
      console.error("Failed to add subscriber:", err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadResult(null);

    const body = new FormData();
    body.append("file", uploadFile);
    body.append("workspaceId", workspaceId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      setUploadResult(data);
    } catch (err: any) {
      setUploadResult({ error: err.message });
    } finally {
      setUploading(false);
    }
  };

  const totalAccountCount = smtpPoolData?.summary?.totalAccounts || 0;
  const dynamicCapacity = smtpPoolData?.summary?.totalDailyCapacity || (totalAccountCount * 2000);

  return (
    <div className="min-h-screen bg-[#081311] text-[#ecfdf5] font-sans antialiased flex flex-col">
      {/* 1. MESA-STYLE ELEGANT TOP NAVIGATION BAR */}
      <header className="h-16 border-b border-[#1b3832] bg-[#0a1815]/90 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#bef264] text-[#081311] font-black text-sm tracking-tighter">
            m
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-extrabold tracking-tight text-white">GEO Mail</span>
            <span className="text-[10px] font-bold text-[#bef264] bg-[#162e29] border border-[#274c44] px-2 py-0.5 rounded-full">
              ENTERPRISE STUDIO
            </span>
          </div>
        </div>

        {/* Top Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setActiveTab("smtppool")}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "smtppool"
                ? "bg-[#bef264] text-[#081311] shadow-md shadow-emerald-950"
                : "text-emerald-200/80 hover:text-white hover:bg-[#122622]"
            }`}
          >
            📫 Sender Pool ({totalAccountCount})
          </button>

          <button
            onClick={() => setActiveTab("spamchecker")}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "spamchecker"
                ? "bg-[#bef264] text-[#081311] shadow-md shadow-emerald-950"
                : "text-emerald-200/80 hover:text-white hover:bg-[#122622]"
            }`}
          >
            🛡️ Spam Checker
          </button>

          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "campaigns"
                ? "bg-[#bef264] text-[#081311] shadow-md shadow-emerald-950"
                : "text-emerald-200/80 hover:text-white hover:bg-[#122622]"
            }`}
          >
            📣 Campaign Studio
          </button>

          <button
            onClick={() => setActiveTab("domains")}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "domains"
                ? "bg-[#bef264] text-[#081311] shadow-md shadow-emerald-950"
                : "text-emerald-200/80 hover:text-white hover:bg-[#122622]"
            }`}
          >
            🔑 Domain Auth
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-[#bef264] text-[#081311] shadow-md shadow-emerald-950"
                : "text-emerald-200/80 hover:text-white hover:bg-[#122622]"
            }`}
          >
            📊 Analytics
          </button>

          <button
            onClick={() => setActiveTab("subscribers")}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "subscribers"
                ? "bg-[#bef264] text-[#081311] shadow-md shadow-emerald-950"
                : "text-emerald-200/80 hover:text-white hover:bg-[#122622]"
            }`}
          >
            👥 Audience ({subscribersData?.totalCount || 0})
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-[#bef264] text-[#081311] shadow-md shadow-emerald-950"
                : "text-emerald-200/80 hover:text-white hover:bg-[#122622]"
            }`}
          >
            🖼️ Storage
          </button>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#0f231f] border border-[#1b3832] rounded-full px-3 py-1 text-[11px] font-bold text-emerald-300 flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#bef264] animate-pulse" />
            <span>{dynamicCapacity.toLocaleString()} Mails/Day</span>
          </div>

          <button
            onClick={handleSeed30Accounts}
            disabled={seedingPool}
            className="rounded-full border border-[#bef264] text-[#bef264] hover:bg-[#bef264] hover:text-[#081311] px-4 py-1.5 text-xs font-extrabold transition-all cursor-pointer"
          >
            {seedingPool ? "Seeding..." : "SEED 30 SENDERS"}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* TAB 1: MULTI-ACCOUNT SMTP LOAD BALANCER POOL */}
        {activeTab === "smtppool" && (
          <div className="space-y-8">
            {/* Hero Banner Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0d1f1c] rounded-3xl border border-[#1b3832] p-8 shadow-2xl relative overflow-hidden">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#162e29] border border-[#274c44] px-3.5 py-1 text-xs font-extrabold text-[#bef264]">
                    🟢 2,000 Mails / Acc Cap
                  </span>
                  <span className="rounded-full bg-[#162e29] border border-[#274c44] px-3.5 py-1 text-xs font-extrabold text-emerald-300">
                    ⚡ Auto Round-Robin Rotation
                  </span>
                  <span className="rounded-full bg-[#162e29] border border-[#274c44] px-3.5 py-1 text-xs font-extrabold text-emerald-300">
                    🕒 24-Hour Rolling Quota Reset
                  </span>
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Multi-Account Load Balancer Engine
                </h2>
                <p className="text-sm text-emerald-200/80 leading-relaxed">
                  Scale your email campaigns to 60,000+ daily dispatches completely free without page timeouts or Google spam flags.
                </p>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    onClick={handleSeed30Accounts}
                    disabled={seedingPool}
                    className="rounded-full bg-[#bef264] text-[#081311] hover:bg-[#a3e635] px-6 py-3 text-xs font-extrabold tracking-wide transition-all shadow-lg shadow-emerald-950 flex items-center space-x-2 cursor-pointer"
                  >
                    <span>SEED 30 SENDER ACCOUNTS (+60,000 DAILY CAP)</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={handleManualResetQuota}
                    disabled={resettingQuota}
                    className="rounded-full border border-[#274c44] bg-[#122622] text-emerald-200 hover:text-white px-5 py-3 text-xs font-extrabold transition-all cursor-pointer"
                  >
                    🔄 {resettingQuota ? "Resetting..." : "Reset 24h Quotas"}
                  </button>
                </div>
              </div>

              {/* Right Summary Metrics Panel */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#20403a] bg-[#122622] p-5 text-center space-y-1">
                  <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Total Daily Capacity</p>
                  <p className="text-3xl font-black text-[#bef264]">{dynamicCapacity.toLocaleString()}</p>
                  <p className="text-[11px] text-emerald-300/60 font-semibold">{totalAccountCount} Accounts × 2,000</p>
                </div>

                <div className="rounded-2xl border border-[#20403a] bg-[#122622] p-5 text-center space-y-1">
                  <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Active Accounts</p>
                  <p className="text-3xl font-black text-white">{totalAccountCount}</p>
                  <p className="text-[11px] text-emerald-300/60 font-semibold">Load Balanced</p>
                </div>

                <div className="rounded-2xl border border-[#20403a] bg-[#122622] p-5 text-center space-y-1">
                  <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Sent Today</p>
                  <p className="text-3xl font-black text-emerald-300">{smtpPoolData?.summary?.totalSentToday || 0}</p>
                  <p className="text-[11px] text-emerald-300/60 font-semibold">Throttled Rate</p>
                </div>

                <div className="rounded-2xl border border-[#20403a] bg-[#122622] p-5 text-center space-y-1">
                  <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Cap / Account</p>
                  <p className="text-xl font-black text-amber-300">2,000 / 24h</p>
                  <p className="text-[11px] text-emerald-300/60 font-semibold">Auto-Restores</p>
                </div>
              </div>
            </div>

            {/* Split Form & Rotation Pool Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Form Card */}
              <div className="lg:col-span-5 rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#1b3832] pb-3">
                  <h3 className="text-sm font-bold text-white">How to Add Sender Mails</h3>
                  <div className="flex items-center space-x-1 bg-[#091513] p-1 rounded-full border border-[#1e4039] text-[11px] font-bold">
                    <button
                      onClick={() => setAddMode("single")}
                      className={`px-3 py-1 rounded-full transition-all ${addMode === "single" ? "bg-[#bef264] text-[#081311] font-extrabold" : "text-emerald-300/70"}`}
                    >
                      Single
                    </button>
                    <button
                      onClick={() => setAddMode("bulk")}
                      className={`px-3 py-1 rounded-full transition-all ${addMode === "bulk" ? "bg-[#bef264] text-[#081311] font-extrabold" : "text-emerald-300/70"}`}
                    >
                      📋 Bulk Paste
                    </button>
                  </div>
                </div>

                {addMode === "single" ? (
                  <form onSubmit={handleAddSingleSmtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-200 mb-1">Sender Email Address</label>
                      <input
                        type="email"
                        value={newSmtpEmail}
                        onChange={(e) => setNewSmtpEmail(e.target.value)}
                        placeholder="user1@geonixa.com"
                        className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] px-4 py-2.5 text-xs text-white placeholder-[#3d6e64] focus:border-[#bef264] focus:outline-none font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-200 mb-1">Gmail App Password (16-digits)</label>
                      <input
                        type="password"
                        value={newSmtpPass}
                        onChange={(e) => setNewSmtpPass(e.target.value)}
                        placeholder="nswymhicrcfgctmu"
                        className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] px-4 py-2.5 text-xs text-white placeholder-[#3d6e64] focus:border-[#bef264] focus:outline-none font-mono"
                        required
                      />
                      <p className="text-[10px] text-emerald-400/60 mt-1">Use 16-character App Password from Google Security settings.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-200 mb-1">Daily Limit per Account</label>
                      <input
                        type="number"
                        value={newSmtpLimit}
                        onChange={(e) => setNewSmtpLimit(Number(e.target.value))}
                        className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] px-4 py-2.5 text-xs text-white focus:border-[#bef264] focus:outline-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addingSmtp}
                      className="w-full rounded-full bg-[#bef264] text-[#081311] py-3 text-xs font-extrabold hover:bg-[#a3e635] transition-all cursor-pointer shadow-md"
                    >
                      {addingSmtp ? "Adding..." : "➕ Add Sender Email to Pool (+2,000 Capacity)"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleBulkImportSmtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-200 mb-1">
                        Paste Sender Emails & Passwords (Format: <code className="text-[#bef264]">email, password</code>)
                      </label>
                      <textarea
                        rows={8}
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder={`sender1@geonixa.com, app_password_1\nsender2@geonixa.com, app_password_2\nsender3@geonixa.com, app_password_3`}
                        className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] p-3.5 text-xs font-mono text-emerald-100 placeholder-[#3d6e64] focus:border-[#bef264] focus:outline-none leading-relaxed"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addingSmtp}
                      className="w-full rounded-full bg-[#bef264] text-[#081311] py-3 text-xs font-extrabold hover:bg-[#a3e635] transition-all cursor-pointer shadow-md"
                    >
                      {addingSmtp ? "Importing..." : "🚀 Import All Sender Emails to Pool"}
                    </button>
                  </form>
                )}
              </div>

              {/* Pool Table */}
              <div className="lg:col-span-7 rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl space-y-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Active Sender Pool Rotation ({totalAccountCount})</h3>
                  <span className="text-[10px] font-extrabold text-[#bef264] bg-[#162e29] border border-[#274c44] px-3 py-1 rounded-full">
                    24h Rolling Quota Auto-Reset
                  </span>
                </div>

                {smtpPoolData?.accounts?.length > 0 ? (
                  <div className="overflow-x-auto flex-1 max-h-[460px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#1b3832] bg-[#091513] text-emerald-300 uppercase font-semibold sticky top-0">
                          <th className="p-3">Sender Email</th>
                          <th className="p-3">Daily Progress</th>
                          <th className="p-3">24h Quota Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1b3832]">
                        {smtpPoolData.accounts.map((acc: any) => {
                          const pct = Math.min(100, Math.round((acc.sentToday / acc.dailyLimit) * 100));
                          const isCapReached = acc.sentToday >= acc.dailyLimit;
                          return (
                            <tr key={acc.id} className="hover:bg-[#132c28]">
                              <td className="p-3 font-bold text-white">{acc.email}</td>
                              <td className="p-3">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-emerald-200">{acc.sentToday} / {acc.dailyLimit}</span>
                                    <span className="text-emerald-400/60">{pct}%</span>
                                  </div>
                                  <div className="w-full bg-[#091513] rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-1.5 rounded-full ${isCapReached ? "bg-rose-500" : "bg-[#bef264]"}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`rounded-full px-3 py-0.5 font-extrabold text-[10px] ${
                                    isCapReached
                                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                                      : "bg-[#162e29] text-[#bef264] border border-[#274c44]"
                                  }`}
                                >
                                  {isCapReached ? "🔒 LOCKED (Restores in 24h)" : "🟢 ACTIVE"}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteSmtpAccount(acc.id)}
                                  className="text-rose-400 hover:text-rose-300 font-bold hover:underline"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex-1 min-h-[260px] flex flex-col items-center justify-center border border-dashed border-[#20403a] rounded-2xl p-8 text-center space-y-4 bg-[#091513]">
                    <div className="h-12 w-12 rounded-2xl bg-[#122622] border border-[#20403a] flex items-center justify-center text-2xl shadow-inner text-[#bef264]">
                      📫
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">No Sender Accounts Configured</p>
                      <p className="text-xs text-emerald-300/70 max-w-sm">
                        Click <strong>"SEED 30 SENDER ACCOUNTS"</strong> or paste your list on the left to load sender accounts!
                      </p>
                    </div>
                    <button
                      onClick={handleSeed30Accounts}
                      disabled={seedingPool}
                      className="rounded-full bg-[#bef264] text-[#081311] px-6 py-2.5 text-xs font-extrabold hover:bg-[#a3e635] transition-all shadow-md"
                    >
                      ⚡ Seed 30 Geonixa Accounts (+60,000 Capacity)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SPAM CHECKER TOOL */}
        {activeTab === "spamchecker" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-[#bef264] uppercase tracking-widest bg-[#162e29] px-3 py-1 rounded-full border border-[#274c44]">
                  SPAM INSPECTOR
                </span>
                <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">Spam Checker</h2>
                <p className="text-xs text-emerald-200/80 mt-1">
                  Copy/paste an email message to detect and optimize <span className="text-[#bef264] underline font-semibold">spam words with professional synonyms</span>.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleClearEditor}
                  className="rounded-full border border-[#274c44] bg-[#122622] px-4 py-2 text-xs font-bold text-emerald-200 hover:text-white transition-colors cursor-pointer"
                >
                  🧹 Clear Editor
                </button>
                <button
                  onClick={handleAutoRemoveSpam}
                  className="rounded-full border border-[#274c44] bg-[#122622] px-4 py-2 text-xs font-bold text-emerald-200 hover:text-white transition-colors cursor-pointer"
                >
                  ⚡ Fast Synonym Fix
                </button>
                <button
                  onClick={handleAiAutoFixSpam}
                  disabled={fixingSpamAi}
                  className="rounded-full bg-[#bef264] text-[#081311] hover:bg-[#a3e635] px-5 py-2 text-xs font-extrabold transition-all disabled:opacity-50 flex items-center space-x-2 cursor-pointer shadow-md"
                >
                  <span>✨</span>
                  <span>{fixingSpamAi ? "Rewriting with Smart AI..." : "Replace Spam Words with AI Synonyms"}</span>
                </button>
              </div>
            </div>

            {/* TOP METRICS BANNER */}
            <div className="rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1b3832] pb-4">
                <div className="flex items-center space-x-6">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Overall score</span>
                    <span
                      className={`text-xl font-black ${
                        detailedSpamAnalysis?.overallScore === "Poor"
                          ? "text-rose-400"
                          : detailedSpamAnalysis?.overallScore === "Needs Work"
                          ? "text-amber-300"
                          : detailedSpamAnalysis?.overallScore === "Good"
                          ? "text-blue-300"
                          : "text-[#bef264]"
                      }`}
                    >
                      {detailedSpamAnalysis?.overallScore || "Clean"}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-[#1b3832]" />

                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Words</span>
                    <span className="text-xl font-extrabold text-white">
                      {detailedSpamAnalysis?.wordCount || 0}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-[#1b3832]" />

                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Read time</span>
                    <span className="text-xs font-bold text-emerald-200">
                      {detailedSpamAnalysis?.readTime || "a few seconds"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categorized Breakdown Cards Bar */}
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-2">Detected Categories</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {detailedSpamAnalysis?.categorySummaries.map((cat) => {
                    const colorStyles =
                      cat.category === "Urgency"
                        ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                        : cat.category === "Shady"
                        ? "bg-pink-500/10 border-pink-500/40 text-pink-300"
                        : cat.category === "Overpromise"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                        : "bg-purple-500/10 border-purple-500/40 text-purple-300";

                    return (
                      <div
                        key={cat.category}
                        className={`flex items-center justify-between rounded-2xl p-3 border text-xs font-bold transition-all ${
                          cat.count > 0 ? `${colorStyles} shadow-sm` : "bg-[#091513] border-[#1e4039] text-emerald-400/50 opacity-60"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{cat.icon}</span>
                          <span>{cat.category}</span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            cat.count > 0 ? "bg-[#bef264] text-[#081311]" : "bg-[#122622] text-emerald-400/60"
                          }`}
                        >
                          ({cat.count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* EDITORS GRID */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-6 rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl space-y-3 flex flex-col">
                <div className="flex items-center justify-between border-b border-[#1b3832] pb-2">
                  <h3 className="text-xs font-bold text-emerald-200 flex items-center space-x-2">
                    <span>✍️</span>
                    <span>Email Body Editor</span>
                  </h3>
                </div>

                <textarea
                  rows={18}
                  value={spamInputText}
                  onChange={(e) => setSpamInputText(e.target.value)}
                  placeholder="Paste or type your email content here..."
                  className="w-full flex-1 rounded-2xl border border-[#1e4039] bg-[#091513] p-4 text-xs font-sans text-white focus:border-[#bef264] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="lg:col-span-6 space-y-4 flex flex-col">
                <div className="rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between border-b border-[#1b3832] pb-2">
                    <h3 className="text-xs font-bold text-emerald-200 flex items-center space-x-2">
                      <span>🔍</span>
                      <span>Live Highlighted Output</span>
                    </h3>
                  </div>

                  <div
                    className="w-full flex-1 rounded-2xl border border-[#1e4039] bg-[#091513] p-4 text-xs leading-relaxed text-white whitespace-pre-wrap overflow-y-auto max-h-[360px]"
                    dangerouslySetInnerHTML={{
                      __html: SpamDetector.renderHighlightedHtml(spamInputText),
                    }}
                  />
                </div>

                <div className="rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1b3832] pb-2">
                    <h4 className="text-[10px] font-extrabold text-emerald-200 uppercase tracking-widest flex items-center space-x-1.5">
                      <span>📋</span>
                      <span>Deliverability Audit Report</span>
                    </h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        detailedSpamAnalysis?.highlights.length === 0
                          ? "bg-[#162e29] text-[#bef264] border border-[#274c44]"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {detailedSpamAnalysis?.highlights.length === 0
                        ? "0 Risk (Clean)"
                        : `${detailedSpamAnalysis?.highlights.length} Triggers Found`}
                    </span>
                  </div>

                  {detailedSpamAnalysis?.highlights && detailedSpamAnalysis.highlights.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      <p className="text-emerald-300/80 font-medium">
                        The following trigger phrases were detected and highlighted above:
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                        {detailedSpamAnalysis.highlights.map((h, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${h.color}`}
                          >
                            {h.word} ({h.category})
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#091513] p-3 border border-[#274c44] text-xs text-[#bef264] flex items-center space-x-2">
                      <span className="text-base">🎉</span>
                      <span className="font-semibold">
                        Zero spam triggers detected! 100% ready for maximum inbox deliverability.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CAMPAIGN STUDIO */}
        {activeTab === "campaigns" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7 rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Campaign Setup & Design Studio</h3>
                    <p className="text-xs text-emerald-300/70">Configure target audience, sender signature, subject line, and HTML email body.</p>
                  </div>
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="flex items-center space-x-1.5 rounded-full bg-[#bef264] text-[#081311] hover:bg-[#a3e635] px-4 py-1.5 text-xs font-extrabold transition-all cursor-pointer shadow-md"
                  >
                    <span>✨</span>
                    <span>AI Copilot</span>
                  </button>
                </div>

                <form onSubmit={handleSendCampaign} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-200 mb-1">Campaign Title</label>
                      <input
                        type="text"
                        value={campaignForm.name}
                        onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                        className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] px-4 py-2.5 text-xs text-white focus:border-[#bef264] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-200 mb-1">Target Audience</label>
                      <div className="w-full rounded-2xl border border-[#274c44] bg-[#122622] px-4 py-2.5 text-xs font-bold text-emerald-300 flex items-center justify-between">
                        <span>All Active Subscribers</span>
                        <span className="bg-[#bef264] text-[#081311] px-2.5 py-0.5 rounded-full font-bold">
                          {subscribersData?.totalCount || 0} Recipients
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1">Email Subject Line</label>
                    <input
                      type="text"
                      value={campaignForm.subject}
                      onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                      className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] px-4 py-2.5 text-xs text-white focus:border-[#bef264] focus:outline-none font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-200 mb-1">From Name</label>
                      <input
                        type="text"
                        value={campaignForm.fromName}
                        onChange={(e) => setCampaignForm({ ...campaignForm, fromName: e.target.value })}
                        className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] px-4 py-2.5 text-xs text-white focus:border-[#bef264] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-200 mb-1">From Email (Multi-Account Rotation)</label>
                      <input
                        type="email"
                        value={campaignForm.fromEmail}
                        onChange={(e) => setCampaignForm({ ...campaignForm, fromEmail: e.target.value })}
                        className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] px-4 py-2.5 text-xs text-[#bef264] focus:border-[#bef264] focus:outline-none font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-emerald-200">HTML Template Content</label>
                      <button
                        type="button"
                        onClick={() => setShowAiModal(true)}
                        className="text-[11px] font-bold text-[#bef264] hover:underline"
                      >
                        ✨ Write with AI Copilot
                      </button>
                    </div>
                    <textarea
                      rows={10}
                      value={campaignForm.bodyHtml}
                      onChange={(e) => setCampaignForm({ ...campaignForm, bodyHtml: e.target.value })}
                      className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] p-4 text-xs font-mono text-white focus:border-[#bef264] focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingCampaign}
                    className="w-full rounded-full bg-[#bef264] text-[#081311] py-3.5 text-xs font-extrabold hover:bg-[#a3e635] transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>🚀</span>
                    <span>{sendingCampaign ? "Dispatching via Multi-Account Pool..." : "Send Campaign (Auto-Rotate Senders + Rate Limited)"}</span>
                  </button>
                </form>
              </div>

              {/* Preview Box */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Live Email Inbox Preview</h3>
                    <div className="flex items-center space-x-1 bg-[#091513] p-1 rounded-full border border-[#1e4039] text-xs font-bold">
                      <button
                        onClick={() => setPreviewMode("desktop")}
                        className={`px-3 py-1 rounded-full transition-all ${previewMode === "desktop" ? "bg-[#bef264] text-[#081311] font-extrabold" : "text-emerald-300/70"}`}
                      >
                        🖥️ Desktop
                      </button>
                      <button
                        onClick={() => setPreviewMode("mobile")}
                        className={`px-3 py-1 rounded-full transition-all ${previewMode === "mobile" ? "bg-[#bef264] text-[#081311] font-extrabold" : "text-emerald-300/70"}`}
                      >
                        📱 Mobile
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#091513] p-3 border border-[#1e4039] text-xs space-y-1 mb-4 text-emerald-200">
                    <p><strong className="text-emerald-400/60">From:</strong> {campaignForm.fromName} &lt;{campaignForm.fromEmail}&gt;</p>
                    <p><strong className="text-emerald-400/60">To:</strong> Jithendra Varma &lt;jithendravarma.l@gmail.com&gt;</p>
                    <p><strong className="text-emerald-400/60">Subject:</strong> {campaignForm.subject}</p>
                  </div>

                  <div
                    className={`mx-auto transition-all duration-300 border border-[#1e4039] rounded-2xl bg-white shadow-inner overflow-hidden ${
                      previewMode === "mobile" ? "w-[320px] min-h-[400px]" : "w-full min-h-[350px]"
                    }`}
                  >
                    <iframe
                      srcDoc={campaignForm.bodyHtml.replace(/{{subscriber\.firstName}}/g, "Jithendra")}
                      className="w-full h-[400px] border-0"
                      title="Email Live Preview"
                    />
                  </div>
                </div>

                {campaignResult && (
                  <div className="rounded-2xl border border-[#1b3832] bg-[#091513] p-6 text-xs font-mono text-emerald-100 overflow-x-auto space-y-2">
                    <p className="text-[#bef264] font-bold">// Live Multi-Account Dispatch Output</p>
                    <pre>{JSON.stringify(campaignResult.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* History Table */}
            <div className="rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Campaign History ({campaignsList.length})</h3>
              {campaignsList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#1b3832] bg-[#091513] text-emerald-300 uppercase font-semibold">
                        <th className="p-3">Campaign Title</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3">From Signature</th>
                        <th className="p-3">Recipients Sent</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Sent Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b3832]">
                      {campaignsList.map((c: any) => (
                        <tr key={c.id} className="hover:bg-[#132c28]">
                          <td className="p-3 font-bold text-white">{c.name}</td>
                          <td className="p-3 text-emerald-200">{c.subject}</td>
                          <td className="p-3 text-emerald-400/70">{c.fromName} &lt;{c.fromEmail}&gt;</td>
                          <td className="p-3 font-bold text-[#bef264]">{c._count?.emailLogs || 0} Emails</td>
                          <td className="p-3">
                            <span className="rounded-full bg-[#162e29] text-[#bef264] border border-[#274c44] px-3 py-0.5 font-extrabold">
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3 text-emerald-400/60">{c.sentAt ? new Date(c.sentAt).toLocaleString() : "Draft"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-emerald-400/60">No campaigns created yet.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: DOMAIN AUTH */}
        {activeTab === "domains" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-6 rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Register Domain for Verification</h3>
                <p className="text-xs text-emerald-200/80">
                  Enter your sending domain to generate 2048-bit RSA DKIM keys and required DNS TXT records.
                </p>

                <form onSubmit={handleRegisterDomain} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1">Domain Name</label>
                    <input
                      type="text"
                      value={inputDomain}
                      onChange={(e) => setInputDomain(e.target.value)}
                      placeholder="example.com"
                      className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] px-4 py-2.5 text-xs text-white focus:border-[#bef264] focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={registeringDomain}
                    className="w-full rounded-full bg-[#bef264] text-[#081311] py-3 text-xs font-extrabold hover:bg-[#a3e635] transition-all cursor-pointer shadow-md"
                  >
                    {registeringDomain ? "Generating DKIM Keys..." : "🔑 Register & Generate DNS Keys"}
                  </button>
                </form>

                {domainRecords?.expectedRecords && (
                  <div className="mt-6 border-t border-[#1b3832] pt-4 space-y-3 text-xs">
                    <h4 className="font-bold text-emerald-200 uppercase tracking-wider text-[10px]">Required DNS TXT Records:</h4>

                    <div className="rounded-2xl bg-[#091513] p-4 text-emerald-200 font-mono text-[11px] overflow-x-auto space-y-2 border border-[#1e4039]">
                      <p className="text-[#bef264] font-bold">// 1. DKIM Record (TXT)</p>
                      <p><span className="text-emerald-400/60">Host:</span> {domainRecords.expectedRecords.dkim.host}</p>
                      <p><span className="text-emerald-400/60">Value:</span> {domainRecords.expectedRecords.dkim.value.substring(0, 70)}...</p>

                      <p className="text-[#bef264] font-bold pt-2">// 2. SPF Record (TXT)</p>
                      <p><span className="text-emerald-400/60">Host:</span> {domainRecords.expectedRecords.spf.host}</p>
                      <p><span className="text-emerald-400/60">Value:</span> {domainRecords.expectedRecords.spf.value}</p>

                      <p className="text-[#bef264] font-bold pt-2">// 3. DMARC Record (TXT)</p>
                      <p><span className="text-emerald-400/60">Host:</span> {domainRecords.expectedRecords.dmarc.host}</p>
                      <p><span className="text-emerald-400/60">Value:</span> {domainRecords.expectedRecords.dmarc.value}</p>
                    </div>

                    <button
                      onClick={() => handleRunDNSCheck(inputDomain)}
                      disabled={checkingDNS}
                      className="w-full rounded-full border border-[#274c44] bg-[#122622] text-[#bef264] py-2.5 text-xs font-extrabold hover:bg-[#162e29] transition-all cursor-pointer"
                    >
                      {checkingDNS ? "Querying Public DNS..." : "🔍 Run Live Real-Time DNS Check"}
                    </button>
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl flex flex-col">
                <h3 className="text-sm font-bold text-white mb-4">Workspace Authenticated Domains</h3>
                {registeredDomains.length > 0 ? (
                  <div className="space-y-4 flex-1">
                    {registeredDomains.map((d: any) => (
                      <div key={d.id} className="rounded-2xl border border-[#1e4039] bg-[#091513] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-white">{d.domain}</span>
                            <span
                              className={`rounded-full px-3 py-0.5 text-[10px] font-bold ${
                                d.isVerified
                                  ? "bg-[#162e29] text-[#bef264] border border-[#274c44] font-extrabold"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {d.isVerified ? "VERIFIED" : "PENDING DNS"}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRunDNSCheck(d.domain)}
                            disabled={checkingDNS}
                            className="rounded-full bg-[#122622] text-[#bef264] border border-[#274c44] px-3 py-1 text-xs font-bold hover:bg-[#162e29] cursor-pointer"
                          >
                            Re-Check DNS
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className={`p-2 rounded-xl border ${d.spfVerified ? "bg-[#162e29] border-[#274c44] text-[#bef264] font-extrabold" : "bg-[#091513] border-[#1e4039] text-emerald-400/50"}`}>
                            SPF: {d.spfVerified ? "PASS" : "FAIL"}
                          </div>
                          <div className={`p-2 rounded-xl border ${d.dkimVerified ? "bg-[#162e29] border-[#274c44] text-[#bef264] font-extrabold" : "bg-[#091513] border-[#1e4039] text-emerald-400/50"}`}>
                            DKIM: {d.dkimVerified ? "PASS" : "FAIL"}
                          </div>
                          <div className={`p-2 rounded-xl border ${d.dmarcVerified ? "bg-[#162e29] border-[#274c44] text-[#bef264] font-extrabold" : "bg-[#091513] border-[#1e4039] text-emerald-400/50"}`}>
                            DMARC: {d.dmarcVerified ? "PASS" : "FAIL"}
                          </div>
                        </div>
                      </div>
                    ))}

                    {dnsResult && (
                      <div className="rounded-2xl bg-[#091513] p-4 text-xs font-mono text-emerald-200 overflow-x-auto space-y-2 border border-[#1e4039]">
                        <p className="text-[#bef264] font-bold">// Live DNS Query Output</p>
                        <p className="text-emerald-100">Domain: {dnsResult.domain}</p>
                        <p className="text-emerald-100">Status: {dnsResult.isFullyVerified ? "100% VERIFIED" : "Records Pending DNS Propagation"}</p>
                        <pre className="text-emerald-400/60 mt-2">{JSON.stringify(dnsResult.dnsDetails, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center border border-dashed border-[#20403a] rounded-2xl p-6 text-center text-emerald-400/60">
                    <span className="text-3xl mb-2">🛡️</span>
                    <p className="text-xs font-medium">No authenticated domains registered yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS DASHBOARD */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-5 shadow-xl">
                <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Total Emails Sent</p>
                <p className="text-3xl font-black text-white mt-1">{analytics?.metrics?.totalEmailsSent || 0}</p>
                <p className="text-[11px] text-emerald-300/60 mt-1">Tenant: {workspaceId}</p>
              </div>

              <div className="rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-5 shadow-xl">
                <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Open Rate %</p>
                <p className="text-3xl font-black text-[#bef264] mt-1">{analytics?.metrics?.openRatePercentage || 0}%</p>
                <p className="text-[11px] text-emerald-300/60 mt-1">{analytics?.metrics?.openedCount || 0} opened</p>
              </div>

              <div className="rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-5 shadow-xl">
                <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Click Rate %</p>
                <p className="text-3xl font-black text-[#bef264] mt-1">{analytics?.metrics?.clickRatePercentage || 0}%</p>
                <p className="text-[11px] text-emerald-300/60 mt-1">{analytics?.metrics?.clickedCount || 0} clicked</p>
              </div>

              <div className="rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-5 shadow-xl">
                <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Unsubscribes</p>
                <p className="text-3xl font-black text-rose-400 mt-1">{analytics?.metrics?.unsubscribedCount || 0}</p>
                <p className="text-[11px] text-emerald-300/60 mt-1">RFC 8058 Compliant</p>
              </div>
            </div>

            <div className="rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4">Recent Email Logs & Tracking Stats</h3>
              {analytics?.recentLogs?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#1b3832] bg-[#091513] text-emerald-300 uppercase font-semibold">
                        <th className="p-3">Message ID</th>
                        <th className="p-3">To Email</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Opened?</th>
                        <th className="p-3">Clicked?</th>
                        <th className="p-3">Delivered At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b3832]">
                      {analytics.recentLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-[#132c28]">
                          <td className="p-3 font-mono text-emerald-400/60">{log.messageId}</td>
                          <td className="p-3 font-medium text-white">{log.toEmail}</td>
                          <td className="p-3 text-emerald-200">{log.subject}</td>
                          <td className="p-3">
                            {log.openedAt ? (
                              <span className="rounded-full bg-[#162e29] text-[#bef264] border border-[#274c44] px-3 py-0.5 font-extrabold">
                                Opened
                              </span>
                            ) : (
                              <span className="text-emerald-400/40">No</span>
                            )}
                          </td>
                          <td className="p-3">
                            {log.clickedAt ? (
                              <span className="rounded-full bg-[#162e29] text-[#bef264] border border-[#274c44] px-3 py-0.5 font-bold">
                                Clicked
                              </span>
                            ) : (
                              <span className="text-emerald-400/40">No</span>
                            )}
                          </td>
                          <td className="p-3 text-emerald-400/60">{new Date(log.deliveredAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-emerald-400/60 py-4">No email logs found yet for tenant {workspaceId}. Send a campaign to populate analytics!</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: AUDIENCE SUBSCRIBERS */}
        {activeTab === "subscribers" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4 rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4">Add New Subscriber</h3>
              <form onSubmit={handleAddSubscriber} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newSubEmail}
                    onChange={(e) => setNewSubEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] px-4 py-2.5 text-xs text-white focus:border-[#bef264] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newSubFirstName}
                    onChange={(e) => setNewSubFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] px-4 py-2.5 text-xs text-white focus:border-[#bef264] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#bef264] text-[#081311] py-3 text-xs font-extrabold hover:bg-[#a3e635] transition-all shadow-md"
                >
                  ➕ Add Subscriber to List
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4">Audience List ({subscribersData?.totalCount || 0})</h3>
              {subscribersData?.subscribers?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#1b3832] bg-[#091513] text-emerald-300 uppercase font-semibold">
                        <th className="p-3">Email</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Subscribed Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b3832]">
                      {subscribersData.subscribers.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-[#132c28]">
                          <td className="p-3 font-bold text-white">{sub.email}</td>
                          <td className="p-3 text-emerald-200">{sub.firstName} {sub.lastName}</td>
                          <td className="p-3">
                            <span
                              className={`rounded-full px-3 py-0.5 font-bold ${
                                sub.status === "SUBSCRIBED"
                                  ? "bg-[#162e29] text-[#bef264] border border-[#274c44] font-extrabold"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-3 text-emerald-400/60">{new Date(sub.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-emerald-400/60 py-4">No subscribers found for tenant {workspaceId}.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: ASSET UPLOAD */}
        {activeTab === "upload" && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-[#1b3832] bg-[#0d1f1c] p-8 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Self-Hosted Media Asset Upload</h3>
              <p className="text-xs text-emerald-300/70 mt-1">
                Upload image banners, logos, or attachment assets directly to your self-hosted <code className="text-[#bef264] bg-[#091513] px-2 py-0.5 rounded-full">/public/uploads</code> directory.
              </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-emerald-200 file:mr-3 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#122622] file:text-[#bef264] hover:file:bg-[#162e29] cursor-pointer"
                required
              />
              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full rounded-full bg-[#bef264] text-[#081311] py-3.5 text-xs font-extrabold hover:bg-[#a3e635] transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {uploading ? "Uploading..." : "Upload File to Local Storage"}
              </button>
            </form>

            {uploadResult && (
              <div className="rounded-2xl border border-[#1e4039] bg-[#091513] p-4 text-xs font-mono text-emerald-100 overflow-x-auto space-y-2">
                {uploadResult.url ? (
                  <>
                    <p className="text-[#bef264] font-bold">✅ Asset Uploaded Successfully!</p>
                    <p className="text-emerald-200">Public URL: <a href={uploadResult.url} target="_blank" rel="noreferrer" className="text-[#bef264] underline">{uploadResult.url}</a></p>
                    {uploadResult.url.match(/\.(png|jpg|jpeg|gif|webp)$/i) && (
                      <div className="mt-3 border border-[#1e4039] rounded-xl p-2 bg-[#0d1f1c]">
                        <img src={uploadResult.url} alt="Uploaded asset preview" className="max-h-40 rounded mx-auto" />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-rose-400 font-bold">❌ Upload Error: {uploadResult.error}</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* AI TEMPLATE GENERATOR MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081311]/90 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0d1f1c] border border-[#1b3832] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#1b3832] pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">✨</span>
                <h3 className="text-base font-bold text-white">AI Template Copilot</h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-emerald-300/70 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateAiTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">What do you want this email to be about?</label>
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. for course web development from Eonixa Limited slots for students..."
                  className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] p-3.5 text-xs text-white placeholder-[#3d6e64] focus:border-[#bef264] focus:outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">Email Tone</label>
                <select
                  value={aiTone}
                  onChange={(e: any) => setAiTone(e.target.value)}
                  className="w-full rounded-2xl border border-[#1e4039] bg-[#091513] px-3.5 py-2 text-xs font-bold text-white focus:border-[#bef264] focus:outline-none"
                >
                  <option value="Friendly" className="bg-[#091513] text-white">😊 Friendly & Welcoming</option>
                  <option value="Urgent" className="bg-[#091513] text-white">🚨 Urgent / Sales Focus</option>
                  <option value="Professional" className="bg-[#091513] text-white">💼 Professional & Corporate</option>
                  <option value="Persuasive" className="bg-[#091513] text-white">🎯 Persuasive Call-to-Action</option>
                  <option value="Casual" className="bg-[#091513] text-white">💬 Casual & Personal</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="rounded-full border border-[#274c44] px-5 py-2 text-xs font-bold text-emerald-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingAi}
                  className="rounded-full bg-[#bef264] text-[#081311] px-6 py-2 text-xs font-extrabold hover:bg-[#a3e635] transition-all disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <span>✨</span>
                  <span>{generatingAi ? "Crafting Email..." : "Generate AI Template"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
