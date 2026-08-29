"use client";

import { useState, useEffect } from "react";
import { SpamDetector, DetailedSpamAnalysis } from "@/lib/compliance/spam-detector";
import { BounceGuard, BounceValidationResult } from "@/lib/compliance/bounce-guard";
import { WarmupEngine, WarmupScheduleDay } from "@/lib/warmup/warmup-engine";
import { DripEngine, DripSequence } from "@/lib/campaigns/drip-engine";
import { LeadScorer } from "@/lib/subscribers/lead-scorer";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    | "smtppool"
    | "mailtrackers"
    | "warmup"
    | "bounceguard"
    | "drips"
    | "spamchecker"
    | "campaigns"
    | "domains"
    | "analytics"
    | "subscribers"
    | "webhooks"
    | "upload"
  >("smtppool");

  const [workspaceId, setWorkspaceId] = useState("ws_geonixa");

  // Mail Trackers State
  const [liveEvents, setLiveEvents] = useState<any[]>([
    { id: "e1", type: "OPEN", email: "jithendravarma.l@gmail.com", subject: "Web Development Masterclass", device: "Desktop", time: "2 mins ago" },
    { id: "e2", type: "CLICK", email: "student.test@geonixa.com", subject: "Web Development Masterclass", link: "https://geonixa.com", device: "Mobile", time: "14 mins ago" },
    { id: "e3", type: "OPEN", email: "contact@company.org", subject: "Geonixa Internship Roadmap", device: "Desktop", time: "1 hour ago" },
  ]);

  // Bounce Guard State
  const [singleTestEmail, setSingleTestEmail] = useState("user.test@gmail.com");
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [validationResult, setValidationResult] = useState<BounceValidationResult | null>(null);

  // Warmup Engine State
  const [warmupSchedule, setWarmupSchedule] = useState<WarmupScheduleDay[]>([]);
  const [targetWarmupVol, setTargetWarmupVol] = useState(2000);

  // Drip Sequence State
  const [dripSequence, setDripSequence] = useState<DripSequence>(
    DripEngine.createDefaultSequence("Web Dev Masterclass Onboarding", "ws_geonixa")
  );

  // Webhooks State
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.zapier.com/hooks/catch/sample/geo-mail");
  const [webhooksList, setWebhooksList] = useState<any[]>([]);
  const [addingWebhook, setAddingWebhook] = useState(false);

  // Reference-Inspired Spam Checker State
  const [spamInputText, setSpamInputText] = useState<string>(
    `Hello Future Innovator,\n\nWe are thrilled to welcome you to the Geonixa Internship & Skill Development Program. This is where your academic knowledge transforms into real-world, hireable expertise.\n\nOur team has curated an intensive, hands-on experience designed to push your boundaries. Whether you are aiming to land your dream tech job or build the next big startup, your roadmap to success starts right here.\n\nYour Training Tracks\nWe bridge the gap between learning and earning through two flagship, AI-driven pathways:\n\nPro Edge Internship (2 Months): Master modern tech stacks by building deployable live projects under the direct guidance of industry veterans.\nSkill Boost Program (Job Guarantee): An intensive career accelerator featuring targeted interview prep, advanced upskilling, and a 100% placement guarantee.\nWhat’s In It For You?\nGuaranteed placements post-completion and merit-based stipend opportunities during your internship.\nIndustry-recognised credentials from AICTE, AWS, and leading multinational corporations.\nEnd-to-end startup incubation and portfolio development support.\nExclusive access to Geonixa’s closed-network hiring partners.\nThe 2-Month Roadmap\nPhase 1: Foundation (Days 1-20) – Master the core tech stack, modern tools, and essential frameworks.\nPhase 2: Micro-Project (Days 21-30) – Apply your new skills to build and deploy an independent guided project.\nPhase 3: Career Prep (Days 31-45) – Master quantitative aptitude, logical reasoning, and technical interview dynamics.\nPhase 4: Capstone (Days 46-60) – Collaborate in Agile teams to deliver a complex, client-grade major project.\nThe Geonixa Extras\nComplete LinkedIn & Resume Makeovers | 1-on-1 Mock HR & Technical Interviews | 24/7 AI-Powered Coding Assistants`
  );
  const [detailedSpamAnalysis, setDetailedSpamAnalysis] = useState<DetailedSpamAnalysis | null>(null);
  const [fixingSpamAi, setFixingSpamAi] = useState(false);

  // Mailchimp-Style Campaign Studio State
  const [campaignForm, setCampaignForm] = useState({
    name: "Web Development Course Announcement",
    subject: "Web Development Masterclass by Eonixa — Limited Seats",
    fromName: "Jithendra Varma",
    fromEmail: "jithendravarma.l@gmail.com",
    bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">\n  <div style="background-color: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff;">\n    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">Web Development Masterclass — Eonixa</h1>\n    <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; color: #94a3b8;">Powered by Eonixa</p>\n  </div>\n  <div style="padding: 32px 24px; color: #334155; line-height: 1.6; font-size: 15px;">\n    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Hi {{subscriber.firstName}},</h2>\n    <p style="margin-bottom: 20px;">Registration is officially open for the Web Development Masterclass from Eonixa. Designed for students and aspiring developers, this program gives you practical hands-on experience building modern web applications.</p>\n    <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 18px; margin: 24px 0; border-radius: 6px;">\n      <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 13px; text-transform: uppercase; font-weight: 800;">Program Highlights:</h3>\n      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">\n        <li style="margin-bottom: 8px;">Full-Stack Web Development: HTML, CSS, JS & Next.js</li>\n        <li style="margin-bottom: 8px;">Real-world project portfolio & live deployment guidance</li>\n        <li style="margin-bottom: 0;">Reserved capacity to ensure personalized mentorship</li>\n      </ul>\n    </div>\n    <div style="text-align: center; margin: 32px 0 16px 0;">\n      <a href="https://geonixa.com" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 15px; display: inline-block;">Secure Your Seat Now →</a>\n    </div>\n  </div>\n  <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">\n    <p style="margin: 0 0 6px 0;">Office Address: {{workspace.physicalAddress}}</p>\n    <p style="margin: 0;"><a href="{{unsubscribeUrl}}" style="color: #4f46e5; text-decoration: underline;">Unsubscribe from emails</a></p>\n  </div>\n</div>`,
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
    fetchWarmup();
    fetchWebhooks();
  }, [workspaceId]);

  const fetchWarmup = () => {
    const sched = WarmupEngine.calculateWarmupSchedule(targetWarmupVol);
    setWarmupSchedule(sched);
  };

  const fetchWebhooks = async () => {
    try {
      const res = await fetch(`/api/webhooks?workspaceId=${workspaceId}`);
      const data = await res.json();
      setWebhooksList(data.webhooks || []);
    } catch (err) {
      console.error("Failed to fetch webhooks:", err);
    }
  };

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

  const handleRunBounceGuard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTestEmail) return;

    setValidatingEmail(true);
    setValidationResult(null);

    try {
      const res = await fetch("/api/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: singleTestEmail }),
      });
      const data = await res.json();
      setValidationResult(data.result);
    } catch (err) {
      console.error("Validation error:", err);
    } finally {
      setValidatingEmail(false);
    }
  };

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl) return;

    setAddingWebhook(true);
    try {
      await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          workspaceId,
          events: ["email.opened", "email.clicked", "contact.unsubscribed"],
        }),
      });
      setWebhookUrl("");
      fetchWebhooks();
    } catch (err) {
      console.error("Failed to add webhook:", err);
    } finally {
      setAddingWebhook(false);
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased flex">
      {/* 1. EXECUTIVE LIGHT SLATE SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-slate-200 bg-white min-h-screen flex flex-col justify-between p-4 sticky top-0 h-screen overflow-y-auto shadow-sm">
        <div className="space-y-4">
          {/* Executive Brand Logo Header */}
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs tracking-wider">
              GM
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">GEO Mail Studio</h1>
              <p className="text-[10px] font-medium text-slate-500">Enterprise Edition</p>
            </div>
          </div>

          {/* Workspace Tenant Selector */}
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-0.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Workspace</label>
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ws_geonixa">Geonixa Inc (ws_geonixa)</option>
              <option value="ws_demo">Demo Workspace (ws_demo)</option>
            </select>
          </div>

          {/* Navigation Category Groups */}
          <nav className="space-y-3">
            {/* Group 1: Infrastructure */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                Infrastructure
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveTab("smtppool")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "smtppool"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Sender Pool</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeTab === "smtppool" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                    {totalAccountCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("mailtrackers")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "mailtrackers"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Mail Trackers</span>
                </button>

                <button
                  onClick={() => setActiveTab("warmup")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "warmup"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Inbox Warmup</span>
                </button>
              </div>
            </div>

            {/* Group 2: Deliverability & Compliance */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                Deliverability
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveTab("bounceguard")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "bounceguard"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Bounce Guard</span>
                </button>

                <button
                  onClick={() => setActiveTab("spamchecker")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "spamchecker"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Spam Checker</span>
                </button>

                <button
                  onClick={() => setActiveTab("domains")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "domains"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Domain Auth</span>
                </button>
              </div>
            </div>

            {/* Group 3: Automation & Studio */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                Campaign Studio
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveTab("campaigns")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "campaigns"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Campaign Studio</span>
                </button>

                <button
                  onClick={() => setActiveTab("drips")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "drips"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Drip Sequences</span>
                </button>

                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "analytics"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Analytics</span>
                </button>
              </div>
            </div>

            {/* Group 4: CRM & Developers */}
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                Audience & Dev
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveTab("subscribers")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "subscribers"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Audience & Leads</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeTab === "subscribers" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                    {subscribersData?.totalCount || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("webhooks")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "webhooks"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Webhooks (Zapier)</span>
                </button>

                <button
                  onClick={() => setActiveTab("upload")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all text-left ${
                    activeTab === "upload"
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>Asset Storage</span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Status Footer */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px] font-medium text-slate-700 space-y-1">
            <div className="flex items-center space-x-2 font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engine Active</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Cap: {dynamicCapacity.toLocaleString()} Mails/Day
            </p>
          </div>
        </div>
      </aside>

      {/* 2. PURE WHITE CANVAS MAIN CONTENT */}
      <main className="flex-1 min-h-screen p-8 overflow-y-auto bg-[#f8fafc]">
        {/* TAB 1: MULTI-ACCOUNT SMTP LOAD BALANCER POOL */}
        {activeTab === "smtppool" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Title Section */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                  Dynamic Capacity Engine
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">Sender Accounts Pool</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every sender account adds <span className="text-indigo-600 font-semibold">+2,000 emails/day</span> to your daily dispatch capacity.
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleManualResetQuota}
                  disabled={resettingQuota}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                >
                  {resettingQuota ? "Resetting..." : "Reset 24h Quotas"}
                </button>
                <button
                  onClick={handleSeed30Accounts}
                  disabled={seedingPool}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>{seedingPool ? "Seeding..." : "Seed 30 Accounts (+60,000 Capacity)"}</span>
                </button>
              </div>
            </div>

            {/* Metric Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Daily Capacity</p>
                <p className="text-2xl font-extrabold text-indigo-600">{dynamicCapacity.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 font-medium">{totalAccountCount} Accounts × 2,000</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Sender Accounts</p>
                <p className="text-2xl font-extrabold text-slate-900">{totalAccountCount}</p>
                <p className="text-[11px] text-slate-400 font-medium">Load Balanced Rotation</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sent Today Across Pool</p>
                <p className="text-2xl font-extrabold text-emerald-600">{smtpPoolData?.summary?.totalSentToday || 0}</p>
                <p className="text-[11px] text-slate-400 font-medium">Inter-Email Throttling Active</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Per-Account Cap</p>
                <p className="text-xl font-bold text-amber-600">2,000 / 24h</p>
                <p className="text-[11px] text-slate-400 font-medium">Auto-Restores in 24 Hours</p>
              </div>
            </div>

            {/* Split Panel Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Form Card */}
              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Add Sender Accounts</h3>
                  <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px] font-semibold">
                    <button
                      onClick={() => setAddMode("single")}
                      className={`px-2.5 py-1 rounded transition-all ${addMode === "single" ? "bg-white text-slate-900 font-bold shadow-sm" : "text-slate-600"}`}
                    >
                      Single
                    </button>
                    <button
                      onClick={() => setAddMode("bulk")}
                      className={`px-2.5 py-1 rounded transition-all ${addMode === "bulk" ? "bg-white text-slate-900 font-bold shadow-sm" : "text-slate-600"}`}
                    >
                      Bulk Import
                    </button>
                  </div>
                </div>

                {addMode === "single" ? (
                  <form onSubmit={handleAddSingleSmtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Email Address</label>
                      <input
                        type="email"
                        value={newSmtpEmail}
                        onChange={(e) => setNewSmtpEmail(e.target.value)}
                        placeholder="user1@geonixa.com"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none font-medium shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Gmail App Password (16-digits)</label>
                      <input
                        type="password"
                        value={newSmtpPass}
                        onChange={(e) => setNewSmtpPass(e.target.value)}
                        placeholder="nswymhicrcfgctmu"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none font-mono shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Limit per Account</label>
                      <input
                        type="number"
                        value={newSmtpLimit}
                        onChange={(e) => setNewSmtpLimit(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addingSmtp}
                      className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      {addingSmtp ? "Adding..." : "Add Sender Email to Pool (+2,000 Capacity)"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleBulkImportSmtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Paste Accounts (Format: <code className="text-indigo-600 font-mono">email, password</code>)
                      </label>
                      <textarea
                        rows={7}
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder={`sender1@geonixa.com, app_password_1\nsender2@geonixa.com, app_password_2\nsender3@geonixa.com, app_password_3`}
                        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none leading-relaxed shadow-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addingSmtp}
                      className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      {addingSmtp ? "Importing..." : "Import All Sender Emails to Pool"}
                    </button>
                  </form>
                )}
              </div>

              {/* Pool Table Card */}
              <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Sender Pool ({totalAccountCount})</h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                    24h Rolling Reset Active
                  </span>
                </div>

                {smtpPoolData?.accounts?.length > 0 ? (
                  <div className="overflow-x-auto flex-1 max-h-[460px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold sticky top-0">
                          <th className="p-3">Sender Email</th>
                          <th className="p-3">Daily Progress</th>
                          <th className="p-3">Quota Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {smtpPoolData.accounts.map((acc: any) => {
                          const pct = Math.min(100, Math.round((acc.sentToday / acc.dailyLimit) * 100));
                          const isCapReached = acc.sentToday >= acc.dailyLimit;
                          return (
                            <tr key={acc.id} className="hover:bg-slate-50">
                              <td className="p-3 font-semibold text-slate-900">{acc.email}</td>
                              <td className="p-3">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-medium text-slate-700">{acc.sentToday} / {acc.dailyLimit}</span>
                                    <span className="text-slate-400">{pct}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-1.5 rounded-full ${isCapReached ? "bg-rose-500" : "bg-emerald-500"}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                                    isCapReached
                                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  }`}
                                >
                                  {isCapReached ? "LOCKED (Restores in 24h)" : "ACTIVE"}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteSmtpAccount(acc.id)}
                                  className="text-rose-600 hover:text-rose-700 font-semibold hover:underline"
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
                  <div className="flex-1 min-h-[240px] flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-6 text-center space-y-3 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-800">No Sender Accounts Configured</p>
                    <button
                      onClick={handleSeed30Accounts}
                      disabled={seedingPool}
                      className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
                    >
                      Seed 30 Geonixa Accounts (+60,000 Capacity)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MAIL TRACKERS & LIVE STREAM */}
        {activeTab === "mailtrackers" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                  Real-Time Tracking Pixel Studio
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">Mail Trackers & Live Activity Stream</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect transparent 1x1 GIF open pixels, wrapped link click redirects, and live recipient engagement events.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time Websocket Receiver Active</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tracking Pixel URL Format</p>
                <p className="text-xs font-mono text-indigo-600 font-bold mt-2 truncate">
                  http://localhost:3000/api/track/open?msgId=...
                </p>
                <p className="text-[11px] text-slate-400 mt-1">1x1 Transparent GIF Byte Stream</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Click Redirect Format</p>
                <p className="text-xs font-mono text-indigo-600 font-bold mt-2 truncate">
                  http://localhost:3000/api/track/click?url=...
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Wrapped HTTP Redirect Logger</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Device Parsing</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">Desktop & Mobile</p>
                <p className="text-[11px] text-slate-400 mt-1">Automatic User-Agent Parser</p>
              </div>
            </div>

            {/* Live Activity Stream Table */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Activity Stream (Real-Time Ingestion)</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                      <th className="p-3">Event Type</th>
                      <th className="p-3">Recipient Email</th>
                      <th className="p-3">Campaign Subject</th>
                      <th className="p-3">Target / Metadata</th>
                      <th className="p-3">Device Type</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {liveEvents.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <span
                            className={`rounded px-2.5 py-0.5 text-[10px] font-bold ${
                              ev.type === "OPEN"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                            }`}
                          >
                            {ev.type}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">{ev.email}</td>
                        <td className="p-3 text-slate-700">{ev.subject}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {ev.link ? ev.link : "1x1 GIF Pixel Rendered"}
                        </td>
                        <td className="p-3 text-slate-600 font-semibold">{ev.device}</td>
                        <td className="p-3 text-slate-400">{ev.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INBOX WARMUP ENGINE */}
        {activeTab === "warmup" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                  Deliverability Builder
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">Automated Peer-to-Peer Inbox Warmup</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated peer email exchange to build domain reputation and ensure 100% Primary Inbox placement.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded text-xs font-bold">
                  Warmup Status: ACTIVE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Warmup Period</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">14 Days Ramp</p>
                <p className="text-[11px] text-slate-400 mt-1">Gradual Volume Escalation</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Daily Cap</p>
                <p className="text-2xl font-extrabold text-indigo-600 mt-1">2,000 Mails/Day</p>
                <p className="text-[11px] text-slate-400 mt-1">Per Account</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Reputation Score</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">98 / 100</p>
                <p className="text-[11px] text-slate-400 mt-1">High Deliverability Tier</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">14-Day Warmup Schedule Ramp</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                      <th className="p-3">Day #</th>
                      <th className="p-3">Warmup Volume / Day</th>
                      <th className="p-3">Escalation Phase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {warmupSchedule.map((s) => (
                      <tr key={s.day} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">Day {s.day}</td>
                        <td className="p-3 font-mono font-bold text-indigo-600">{s.emailsPerDay} Emails</td>
                        <td className="p-3 text-slate-700 font-medium">{s.rampStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRE-SEND BOUNCE GUARD */}
        {activeTab === "bounceguard" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                  Pre-Send Email Validator
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">Bounce Guard Engine</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify syntax, MX records, and disposable email domains before dispatching campaigns to maintain zero bounce rates.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Test Email Address Deliverability</h3>
                <form onSubmit={handleRunBounceGuard} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={singleTestEmail}
                      onChange={(e) => setSingleTestEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={validatingEmail}
                    className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {validatingEmail ? "Validating MX Records..." : "Validate Email Deliverability"}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Deliverability Inspection Result</h3>

                {validationResult ? (
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs font-mono space-y-2">
                    <p><strong className="text-slate-600">Email:</strong> {validationResult.email}</p>
                    <p><strong className="text-slate-600">Domain:</strong> {validationResult.domain}</p>
                    <p><strong className="text-slate-600">Syntax RFC 5322:</strong> {validationResult.isValidSyntax ? "PASS" : "FAIL"}</p>
                    <p><strong className="text-slate-600">MX Server Found:</strong> {validationResult.hasMxRecords ? "PASS" : "FAIL"}</p>
                    <p><strong className="text-slate-600">Disposable Filter:</strong> {validationResult.isDisposable ? "DISPOSABLE" : "SAFE"}</p>

                    <div className="pt-2">
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold ${
                          validationResult.deliverabilityStatus === "SAFE"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-rose-100 text-rose-900 border border-rose-300"
                        }`}
                      >
                        STATUS: {validationResult.deliverabilityStatus}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-h-[160px] flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs text-center p-4">
                    Enter an email address on the left to run live MX and syntax verification.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DRIP SEQUENCES */}
        {activeTab === "drips" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                  Automated Sequences
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">Multi-Step Drip Campaigns</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure automated follow-up sequences with conditional branching (<code className="text-indigo-600 font-mono">If No Reply</code>, <code className="text-indigo-600 font-mono">If No Open</code>).
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{dripSequence.name}</h3>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded text-[10px] font-bold">
                  {dripSequence.status}
                </span>
              </div>

              <div className="space-y-3">
                {dripSequence.steps.map((step) => (
                  <div key={step.stepNumber} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Step #{step.stepNumber} (Delay: {step.delayDays} Days)</span>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Condition: {step.condition}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">Subject: {step.subject}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SPAM CHECKER TOOL */}
        {activeTab === "spamchecker" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                  Spam Inspector
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">Spam Checker</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Copy/paste email copy to scan for trigger phrases and replace them with professional synonyms.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearEditor}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  Clear Editor
                </button>
                <button
                  onClick={handleAutoRemoveSpam}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  Fast Synonym Fix
                </button>
                <button
                  onClick={handleAiAutoFixSpam}
                  disabled={fixingSpamAi}
                  className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {fixingSpamAi ? "Rewriting..." : "Replace Spam Words with AI Synonyms"}
                </button>
              </div>
            </div>

            {/* Metrics Banner Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Overall score</span>
                    <span
                      className={`text-xl font-extrabold ${
                        detailedSpamAnalysis?.overallScore === "Poor"
                          ? "text-rose-600"
                          : detailedSpamAnalysis?.overallScore === "Needs Work"
                          ? "text-amber-600"
                          : detailedSpamAnalysis?.overallScore === "Good"
                          ? "text-blue-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {detailedSpamAnalysis?.overallScore || "Clean"}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-slate-200" />

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Words</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      {detailedSpamAnalysis?.wordCount || 0}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-slate-200" />

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Read time</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {detailedSpamAnalysis?.readTime || "a few seconds"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categorized Breakdown */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Detected Categories</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {detailedSpamAnalysis?.categorySummaries.map((cat) => {
                    const colorStyles =
                      cat.category === "Urgency"
                        ? "bg-rose-50 border-rose-200 text-rose-800"
                        : cat.category === "Shady"
                        ? "bg-pink-50 border-pink-200 text-pink-800"
                        : cat.category === "Overpromise"
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-purple-50 border-purple-200 text-purple-800";

                    return (
                      <div
                        key={cat.category}
                        className={`flex items-center justify-between rounded-lg p-2.5 border text-xs font-semibold transition-all ${
                          cat.count > 0 ? `${colorStyles} shadow-sm` : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                        }`}
                      >
                        <span>{cat.category}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            cat.count > 0 ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
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

            {/* Editors Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Email Body Editor</h3>
                </div>

                <textarea
                  rows={18}
                  value={spamInputText}
                  onChange={(e) => setSpamInputText(e.target.value)}
                  placeholder="Paste or type your email content here..."
                  className="w-full flex-1 rounded-lg border border-slate-300 bg-white p-3.5 text-xs font-sans text-slate-900 focus:border-indigo-600 focus:outline-none leading-relaxed shadow-inner"
                />
              </div>

              <div className="lg:col-span-6 space-y-4 flex flex-col">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex-1 flex flex-col">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Highlighted Output</h3>
                  </div>

                  <div
                    className="w-full flex-1 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-900 whitespace-pre-wrap overflow-y-auto max-h-[360px]"
                    dangerouslySetInnerHTML={{
                      __html: SpamDetector.renderHighlightedHtml(spamInputText),
                    }}
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Deliverability Audit Report
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        detailedSpamAnalysis?.highlights.length === 0
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {detailedSpamAnalysis?.highlights.length === 0
                        ? "0 Risk (Clean)"
                        : `${detailedSpamAnalysis?.highlights.length} Triggers Found`}
                    </span>
                  </div>

                  {detailedSpamAnalysis?.highlights && detailedSpamAnalysis.highlights.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-600 font-medium">Detected trigger phrases:</p>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                        {detailedSpamAnalysis.highlights.map((h, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${h.color}`}
                          >
                            {h.word} ({h.category})
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-emerald-50 p-2.5 border border-emerald-200 text-xs text-emerald-900 font-medium">
                      Zero spam triggers detected! 100% ready for maximum inbox deliverability.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CAMPAIGN STUDIO */}
        {activeTab === "campaigns" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Campaign Setup</h3>
                    <p className="text-xs text-slate-500">Configure signature, subject line, and HTML email body.</p>
                  </div>
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold transition-all shadow-sm"
                  >
                    AI Copilot
                  </button>
                </div>

                <form onSubmit={handleSendCampaign} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Title</label>
                      <input
                        type="text"
                        value={campaignForm.name}
                        onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                      <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 flex items-center justify-between">
                        <span>All Active Subscribers</span>
                        <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[11px] font-bold">
                          {subscribersData?.totalCount || 0} Recipients
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Subject Line</label>
                    <input
                      type="text"
                      value={campaignForm.subject}
                      onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none font-medium shadow-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">From Name</label>
                      <input
                        type="text"
                        value={campaignForm.fromName}
                        onChange={(e) => setCampaignForm({ ...campaignForm, fromName: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">From Email (Multi-Account Rotation)</label>
                      <input
                        type="email"
                        value={campaignForm.fromEmail}
                        onChange={(e) => setCampaignForm({ ...campaignForm, fromEmail: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-indigo-700 focus:border-indigo-600 focus:outline-none font-semibold shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">HTML Template Content</label>
                      <button
                        type="button"
                        onClick={() => setShowAiModal(true)}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline"
                      >
                        Write with AI Copilot
                      </button>
                    </div>
                    <textarea
                      rows={10}
                      value={campaignForm.bodyHtml}
                      onChange={(e) => setCampaignForm({ ...campaignForm, bodyHtml: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs font-mono text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingCampaign}
                    className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {sendingCampaign ? "Dispatching via Multi-Account Pool..." : "Send Campaign (Auto-Rotate Senders + Rate Limited)"}
                  </button>
                </form>
              </div>

              {/* Preview Box */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Inbox Preview</h3>
                    <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px] font-semibold">
                      <button
                        onClick={() => setPreviewMode("desktop")}
                        className={`px-2.5 py-1 rounded transition-all ${previewMode === "desktop" ? "bg-white text-slate-900 font-bold shadow-sm" : "text-slate-600"}`}
                      >
                        Desktop
                      </button>
                      <button
                        onClick={() => setPreviewMode("mobile")}
                        className={`px-2.5 py-1 rounded transition-all ${previewMode === "mobile" ? "bg-white text-slate-900 font-bold shadow-sm" : "text-slate-600"}`}
                      >
                        Mobile
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-xs space-y-0.5 mb-3 text-slate-700">
                    <p><strong className="text-slate-500">From:</strong> {campaignForm.fromName} &lt;{campaignForm.fromEmail}&gt;</p>
                    <p><strong className="text-slate-500">To:</strong> Jithendra Varma &lt;jithendravarma.l@gmail.com&gt;</p>
                    <p><strong className="text-slate-500">Subject:</strong> {campaignForm.subject}</p>
                  </div>

                  <div
                    className={`mx-auto transition-all duration-300 border border-slate-200 rounded-lg bg-white shadow-inner overflow-hidden ${
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
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs font-mono text-slate-900 overflow-x-auto space-y-1 shadow-sm">
                    <p className="text-indigo-600 font-bold">// Live Multi-Account Dispatch Output</p>
                    <pre>{JSON.stringify(campaignResult.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign History Table */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Campaign History ({campaignsList.length})</h3>
              {campaignsList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                        <th className="p-3">Campaign Title</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3">From Signature</th>
                        <th className="p-3">Recipients Sent</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Sent Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {campaignsList.map((c: any) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                          <td className="p-3 text-slate-700">{c.subject}</td>
                          <td className="p-3 text-slate-500">{c.fromName} &lt;{c.fromEmail}&gt;</td>
                          <td className="p-3 font-bold text-indigo-600">{c._count?.emailLogs || 0} Emails</td>
                          <td className="p-3">
                            <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 font-semibold text-[10px]">
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{c.sentAt ? new Date(c.sentAt).toLocaleString() : "Draft"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No campaigns created yet.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: DOMAIN AUTH */}
        {activeTab === "domains" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Register Domain for Verification</h3>
                <p className="text-xs text-slate-500">
                  Enter your sending domain to generate 2048-bit RSA DKIM keys and required DNS TXT records.
                </p>

                <form onSubmit={handleRegisterDomain} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Domain Name</label>
                    <input
                      type="text"
                      value={inputDomain}
                      onChange={(e) => setInputDomain(e.target.value)}
                      placeholder="example.com"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={registeringDomain}
                    className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {registeringDomain ? "Generating DKIM Keys..." : "Register & Generate DNS Keys"}
                  </button>
                </form>

                {domainRecords?.expectedRecords && (
                  <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Required DNS TXT Records:</h4>

                    <div className="rounded-lg bg-slate-50 p-3 text-slate-800 font-mono text-[11px] overflow-x-auto space-y-2 border border-slate-200">
                      <p className="text-indigo-600 font-bold">// 1. DKIM Record (TXT)</p>
                      <p><span className="text-slate-500">Host:</span> {domainRecords.expectedRecords.dkim.host}</p>
                      <p><span className="text-slate-500">Value:</span> {domainRecords.expectedRecords.dkim.value.substring(0, 70)}...</p>

                      <p className="text-indigo-600 font-bold pt-2">// 2. SPF Record (TXT)</p>
                      <p><span className="text-slate-500">Host:</span> {domainRecords.expectedRecords.spf.host}</p>
                      <p><span className="text-slate-500">Value:</span> {domainRecords.expectedRecords.spf.value}</p>

                      <p className="text-indigo-600 font-bold pt-2">// 3. DMARC Record (TXT)</p>
                      <p><span className="text-slate-500">Host:</span> {domainRecords.expectedRecords.dmarc.host}</p>
                      <p><span className="text-slate-500">Value:</span> {domainRecords.expectedRecords.dmarc.value}</p>
                    </div>

                    <button
                      onClick={() => handleRunDNSCheck(inputDomain)}
                      disabled={checkingDNS}
                      className="w-full rounded-lg border border-slate-300 bg-white text-slate-700 py-2 text-xs font-semibold hover:bg-slate-50 transition-all shadow-sm"
                    >
                      {checkingDNS ? "Querying DNS..." : "Run Live Real-Time DNS Check"}
                    </button>
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Workspace Authenticated Domains</h3>
                {registeredDomains.length > 0 ? (
                  <div className="space-y-3 flex-1">
                    {registeredDomains.map((d: any) => (
                      <div key={d.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900">{d.domain}</span>
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                d.isVerified
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {d.isVerified ? "VERIFIED" : "PENDING DNS"}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRunDNSCheck(d.domain)}
                            disabled={checkingDNS}
                            className="rounded bg-indigo-600 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-indigo-700 shadow-sm cursor-pointer"
                          >
                            Re-Check DNS
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className={`p-1.5 rounded border ${d.spfVerified ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold" : "bg-white border-slate-200 text-slate-400"}`}>
                            SPF: {d.spfVerified ? "PASS" : "FAIL"}
                          </div>
                          <div className={`p-1.5 rounded border ${d.dkimVerified ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold" : "bg-white border-slate-200 text-slate-400"}`}>
                            DKIM: {d.dkimVerified ? "PASS" : "FAIL"}
                          </div>
                          <div className={`p-1.5 rounded border ${d.dmarcVerified ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold" : "bg-white border-slate-200 text-slate-400"}`}>
                            DMARC: {d.dmarcVerified ? "PASS" : "FAIL"}
                          </div>
                        </div>
                      </div>
                    ))}

                    {dnsResult && (
                      <div className="rounded-lg bg-white p-3 text-xs font-mono text-slate-900 overflow-x-auto space-y-1 border border-slate-200 shadow-sm">
                        <p className="text-indigo-600 font-bold">// Live DNS Query Output</p>
                        <p className="text-slate-800">Domain: {dnsResult.domain}</p>
                        <p className="text-slate-800">Status: {dnsResult.isFullyVerified ? "100% VERIFIED" : "Records Pending Propagation"}</p>
                        <pre className="text-slate-500 mt-1">{JSON.stringify(dnsResult.dnsDetails, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 min-h-[180px] flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500">
                    <p className="text-xs font-medium">No authenticated domains registered yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: ANALYTICS DASHBOARD */}
        {activeTab === "analytics" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Emails Sent</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{analytics?.metrics?.totalEmailsSent || 0}</p>
                <p className="text-[11px] text-slate-400 mt-1">Tenant: {workspaceId}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Open Rate %</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">{analytics?.metrics?.openRatePercentage || 0}%</p>
                <p className="text-[11px] text-slate-400 mt-1">{analytics?.metrics?.openedCount || 0} opened</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Click Rate %</p>
                <p className="text-2xl font-extrabold text-indigo-600 mt-1">{analytics?.metrics?.clickRatePercentage || 0}%</p>
                <p className="text-[11px] text-slate-400 mt-1">{analytics?.metrics?.clickedCount || 0} clicked</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unsubscribes</p>
                <p className="text-2xl font-extrabold text-rose-600 mt-1">{analytics?.metrics?.unsubscribedCount || 0}</p>
                <p className="text-[11px] text-slate-400 mt-1">RFC 8058 Compliant</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Email Logs & Tracking</h3>
              {analytics?.recentLogs?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                        <th className="p-3">Message ID</th>
                        <th className="p-3">To Email</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Opened?</th>
                        <th className="p-3">Clicked?</th>
                        <th className="p-3">Delivered At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analytics.recentLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-slate-500">{log.messageId}</td>
                          <td className="p-3 font-semibold text-slate-900">{log.toEmail}</td>
                          <td className="p-3 text-slate-700">{log.subject}</td>
                          <td className="p-3">
                            {log.openedAt ? (
                              <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 font-semibold text-[10px]">
                                Opened
                              </span>
                            ) : (
                              <span className="text-slate-400">No</span>
                            )}
                          </td>
                          <td className="p-3">
                            {log.clickedAt ? (
                              <span className="rounded bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 font-semibold text-[10px]">
                                Clicked
                              </span>
                            ) : (
                              <span className="text-slate-400">No</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-500">{new Date(log.deliveredAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3">No email logs found yet for tenant {workspaceId}. Send a campaign to populate analytics!</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: AUDIENCE & LEAD SCORING */}
        {activeTab === "subscribers" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 max-w-7xl mx-auto">
            <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Add New Subscriber</h3>
              <form onSubmit={handleAddSubscriber} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newSubEmail}
                    onChange={(e) => setNewSubEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newSubFirstName}
                    onChange={(e) => setNewSubFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-all shadow-sm"
                >
                  Add Subscriber to List
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Audience & Lead Scoring ({subscribersData?.totalCount || 0})</h3>
              {subscribersData?.subscribers?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                        <th className="p-3">Email</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Lead Score</th>
                        <th className="p-3">Tier</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subscribersData.subscribers.map((sub: any) => {
                        const scoreData = LeadScorer.calculateScore(sub.emailLogs?.length || 1, 0, sub.status === "UNSUBSCRIBED");
                        return (
                          <tr key={sub.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-900">{sub.email}</td>
                            <td className="p-3 text-slate-700">{sub.firstName} {sub.lastName}</td>
                            <td className="p-3 font-mono font-bold text-indigo-600">+{scoreData.score} Pts</td>
                            <td className="p-3">
                              <span className="rounded bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 font-bold text-[10px]">
                                {scoreData.tier}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                  sub.status === "SUBSCRIBED"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-rose-50 text-rose-800 border border-rose-200"
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3">No subscribers found for tenant {workspaceId}.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 11: WEBHOOKS (ZAPIER / MAKE) */}
        {activeTab === "webhooks" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                  Integrations & API
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">Webhooks & External Dispatchers</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Broadcast real-time HTTP payloads to Zapier, Make.com, or custom serverless endpoints on events (<code className="text-indigo-600 font-mono">email.opened</code>, <code className="text-indigo-600 font-mono">email.clicked</code>).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Add New Webhook URL</h3>
                <form onSubmit={handleAddWebhook} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Webhook Endpoint URL</label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://hooks.zapier.com/..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addingWebhook}
                    className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {addingWebhook ? "Registering..." : "Register Webhook Endpoint"}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Webhook Endpoints ({webhooksList.length})</h3>
                {webhooksList.length > 0 ? (
                  <div className="space-y-2">
                    {webhooksList.map((wh) => (
                      <div key={wh.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900 truncate max-w-sm">{wh.url}</span>
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">Secret: {wh.secret}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-3">No webhooks registered yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: ASSET UPLOAD */}
        {activeTab === "upload" && (
          <div className="max-w-2xl mx-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Self-Hosted Media Asset Upload</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload image banners, logos, or attachment assets directly to your self-hosted <code className="text-indigo-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded font-semibold">/public/uploads</code> directory.
              </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                required
              />
              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {uploading ? "Uploading..." : "Upload File to Storage"}
              </button>
            </form>

            {uploadResult && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs font-mono text-slate-900 overflow-x-auto space-y-1 shadow-sm">
                {uploadResult.url ? (
                  <>
                    <p className="text-emerald-700 font-bold">Asset Uploaded Successfully!</p>
                    <p className="text-slate-700">Public URL: <a href={uploadResult.url} target="_blank" rel="noreferrer" className="text-indigo-600 underline">{uploadResult.url}</a></p>
                    {uploadResult.url.match(/\.(png|jpg|jpeg|gif|webp)$/i) && (
                      <div className="mt-2 border border-slate-200 rounded p-2 bg-white">
                        <img src={uploadResult.url} alt="Uploaded asset preview" className="max-h-40 rounded mx-auto" />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-rose-600 font-bold">Upload Error: {uploadResult.error}</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* AI TEMPLATE GENERATOR MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white border border-slate-200 p-5 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">AI Template Copilot</h3>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateAiTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">What do you want this email to be about?</label>
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. for course web development from Eonixa Limited slots for students..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none font-medium shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Tone</label>
                <select
                  value={aiTone}
                  onChange={(e: any) => setAiTone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                >
                  <option value="Friendly">Friendly & Welcoming</option>
                  <option value="Urgent">Urgent / Sales Focus</option>
                  <option value="Professional">Professional & Corporate</option>
                  <option value="Persuasive">Persuasive Call-to-Action</option>
                  <option value="Casual">Casual & Personal</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingAi}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {generatingAi ? "Crafting..." : "Generate AI Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
