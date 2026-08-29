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

  // Selected Campaign Modal Inspection State
  const [selectedCampaignModal, setSelectedCampaignModal] = useState<any>(null);

  // Dedicated Custom SMTP Server Config State
  const [customSmtpHost, setCustomSmtpHost] = useState("smtp.geonixa.com");
  const [customSmtpPort, setCustomSmtpPort] = useState(587);
  const [customSmtpUser, setCustomSmtpUser] = useState("admin@geonixa.com");
  const [customSmtpPass, setCustomSmtpPass] = useState("nswymhicrcfgctmu");
  const [savingCustomSmtp, setSavingCustomSmtp] = useState(false);

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
  const [addMode, setAddMode] = useState<"single" | "bulk" | "dedicated">("single");
  const [newSmtpEmail, setNewSmtpEmail] = useState("");
  const [newSmtpPass, setNewSmtpPass] = useState("");
  const [newSmtpLimit, setNewSmtpLimit] = useState(999999999);
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

  const handleSeedUnlimitedAccounts = async () => {
    setSeedingPool(true);
    try {
      await fetch("/api/smtp-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_unlimited", workspaceId }),
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
          dailyLimit: 999999999, // Unlimited
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
        dailyLimit: 999999999, // Unlimited
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

  const handleSaveDedicatedSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCustomSmtp(true);
    try {
      await fetch("/api/smtp-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          email: customSmtpUser,
          password: customSmtpPass,
          host: customSmtpHost,
          port: Number(customSmtpPort),
          dailyLimit: 999999999, // Unlimited Capacity
        }),
      });
      fetchSmtpPool();
    } catch (err) {
      console.error("Failed to save dedicated SMTP server:", err);
    } finally {
      setSavingCustomSmtp(false);
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
              <p className="text-[10px] font-medium text-indigo-600 font-bold">Unlimited Edition</p>
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
                  <span>Unlimited SMTP Pool</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeTab === "smtppool" ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}>
                    ∞ Unlimited
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
          <div className="rounded-lg bg-indigo-50 p-2.5 border border-indigo-200 text-[11px] font-medium text-indigo-900 space-y-1">
            <div className="flex items-center space-x-2 font-bold text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Unlimited Engine Active</span>
            </div>
            <p className="text-[10px] text-indigo-800 font-bold font-mono">
              Cap: UNLIMITED Daily Sending (∞)
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
                  Self-Hosted Dedicated Engine
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">Unlimited SMTP Dispatch Pool</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Send <span className="text-indigo-600 font-bold">UNLIMITED emails daily</span> with self-hosted dedicated SMTP servers (Stalwart, Postfix, PowerMTA, SES, SendGrid).
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleManualResetQuota}
                  disabled={resettingQuota}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                >
                  {resettingQuota ? "Resetting..." : "Reset Daily Quotas"}
                </button>
                <button
                  onClick={handleSeedUnlimitedAccounts}
                  disabled={seedingPool}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>{seedingPool ? "Activating..." : "Activate Unlimited SMTP Pool (∞)"}</span>
                </button>
              </div>
            </div>

            {/* Metric Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Daily Capacity</p>
                <p className="text-2xl font-extrabold text-indigo-600">UNLIMITED (∞)</p>
                <p className="text-[11px] text-slate-400 font-medium">{totalAccountCount} Senders Load Balanced</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Sender Accounts</p>
                <p className="text-2xl font-extrabold text-slate-900">{totalAccountCount}</p>
                <p className="text-[11px] text-slate-400 font-medium">Automatic Rotation Engine</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sent Today Across Pool</p>
                <p className="text-2xl font-extrabold text-emerald-600">{smtpPoolData?.summary?.totalSentToday || 0}</p>
                <p className="text-[11px] text-slate-400 font-medium">Inter-Email Throttling Active</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Per-Account Limit</p>
                <p className="text-xl font-bold text-indigo-600">UNLIMITED / 24h</p>
                <p className="text-[11px] text-slate-400 font-medium">Zero Restrictions</p>
              </div>
            </div>

            {/* Split Panel Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Form Card */}
              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">SMTP Server Setup</h3>
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
                      Bulk
                    </button>
                    <button
                      onClick={() => setAddMode("dedicated")}
                      className={`px-2.5 py-1 rounded transition-all ${addMode === "dedicated" ? "bg-indigo-600 text-white font-bold shadow-sm" : "text-slate-600"}`}
                    >
                      Dedicated VPS
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
                      <label className="block text-xs font-semibold text-slate-700 mb-1">App Password or SMTP Password</label>
                      <input
                        type="password"
                        value={newSmtpPass}
                        onChange={(e) => setNewSmtpPass(e.target.value)}
                        placeholder="nswymhicrcfgctmu"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none font-mono shadow-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addingSmtp}
                      className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      {addingSmtp ? "Adding..." : "Add Unlimited Sender Email to Pool"}
                    </button>
                  </form>
                ) : addMode === "bulk" ? (
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
                      {addingSmtp ? "Importing..." : "Import All Sender Emails (Unlimited Capacity)"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSaveDedicatedSmtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Dedicated Host / IP</label>
                      <input
                        type="text"
                        value={customSmtpHost}
                        onChange={(e) => setCustomSmtpHost(e.target.value)}
                        placeholder="mail.geonixa.com or 164.92.120.4"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Port</label>
                        <input
                          type="number"
                          value={customSmtpPort}
                          onChange={(e) => setCustomSmtpPort(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Cap</label>
                        <input
                          type="text"
                          value="UNLIMITED (∞)"
                          disabled
                          className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-800 shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Username</label>
                      <input
                        type="text"
                        value={customSmtpUser}
                        onChange={(e) => setCustomSmtpUser(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Password</label>
                      <input
                        type="password"
                        value={customSmtpPass}
                        onChange={(e) => setCustomSmtpPass(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none font-mono shadow-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingCustomSmtp}
                      className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      {savingCustomSmtp ? "Saving..." : "Save Dedicated SMTP (Unlimited Capacity)"}
                    </button>
                  </form>
                )}
              </div>

              {/* Pool Table Card */}
              <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Unlimited Pool ({totalAccountCount})</h3>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                    ∞ UNLIMITED Daily Capacity
                  </span>
                </div>

                {smtpPoolData?.accounts?.length > 0 ? (
                  <div className="overflow-x-auto flex-1 max-h-[460px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold sticky top-0">
                          <th className="p-3">Sender Email</th>
                          <th className="p-3">Sent Today</th>
                          <th className="p-3">Capacity Limit</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {smtpPoolData.accounts.map((acc: any) => {
                          return (
                            <tr key={acc.id} className="hover:bg-slate-50">
                              <td className="p-3 font-semibold text-slate-900">{acc.email}</td>
                              <td className="p-3 font-bold text-emerald-600">{acc.sentToday} Mails</td>
                              <td className="p-3">
                                <span className="rounded px-2.5 py-0.5 font-extrabold text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200">
                                  UNLIMITED (∞)
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
                    <p className="text-xs font-semibold text-slate-800">No SMTP Senders Configured</p>
                    <button
                      onClick={handleSeedUnlimitedAccounts}
                      disabled={seedingPool}
                      className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
                    >
                      Activate Unlimited SMTP Pool (∞)
                    </button>
                  </div>
                )}
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
              </div>
            </div>

            {/* Campaign Tracking Metrics Table */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Per-Campaign Tracking Metrics</h3>
                  <p className="text-xs text-slate-500">Detailed delivery, open, click, and bounce metrics for every broadcast.</p>
                </div>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded text-xs font-bold">
                  {campaignsList.length} Total Campaigns
                </span>
              </div>

              {campaignsList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                        <th className="p-3">Campaign Title</th>
                        <th className="p-3">Mails Sent</th>
                        <th className="p-3">Opened</th>
                        <th className="p-3">Clicked</th>
                        <th className="p-3">Bounced Back</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {campaignsList.map((c: any) => {
                        const sent = c.stats?.sentCount || c._count?.emailLogs || 0;
                        const opened = c.stats?.openedCount || 0;
                        const clicked = c.stats?.clickedCount || 0;
                        const bounced = c.stats?.bouncedCount || 0;

                        return (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{c.name}</p>
                              <p className="text-[11px] text-slate-500 truncate max-w-xs">{c.subject}</p>
                            </td>
                            <td className="p-3 font-semibold text-slate-900">{sent} Mails</td>
                            <td className="p-3 font-semibold text-emerald-600">
                              {opened} ({c.stats?.openRate || "0.0%"})
                            </td>
                            <td className="p-3 font-semibold text-indigo-600">
                              {clicked} ({c.stats?.clickRate || "0.0%"})
                            </td>
                            <td className="p-3 font-semibold text-slate-600">
                              {bounced} ({c.stats?.bounceRate || "0.0%"})
                            </td>
                            <td className="p-3">
                              <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 font-bold text-[10px]">
                                {c.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedCampaignModal(c)}
                                className="rounded bg-slate-900 text-white hover:bg-slate-800 px-3 py-1 text-[11px] font-semibold transition-all shadow-sm cursor-pointer"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3">No campaigns dispatched yet.</p>
              )}
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

            {/* Campaign Breakdown Table inside Analytics */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Campaign Performance Matrix</h3>
              {campaignsList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                        <th className="p-3">Campaign Name</th>
                        <th className="p-3">Total Sent</th>
                        <th className="p-3">Opened (Rate %)</th>
                        <th className="p-3">Clicked (Rate %)</th>
                        <th className="p-3">Bounced Back</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {campaignsList.map((c: any) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                          <td className="p-3 font-bold text-slate-800">{c.stats?.sentCount || 0}</td>
                          <td className="p-3 text-emerald-600 font-bold">{c.stats?.openedCount || 0} ({c.stats?.openRate || "0%"})</td>
                          <td className="p-3 text-indigo-600 font-bold">{c.stats?.clickedCount || 0} ({c.stats?.clickRate || "0%"})</td>
                          <td className="p-3 text-slate-500 font-bold">{c.stats?.bouncedCount || 0} (0.0%)</td>
                          <td className="p-3">
                            <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 font-bold text-[10px]">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3">No campaign performance data available.</p>
              )}
            </div>
          </div>
        )}

        {/* OTHER TABS */}
        {activeTab === "mailtrackers" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900">Mail Trackers & Live Activity Stream</h2>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Activity Stream</h3>
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
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{ev.link ? ev.link : "1x1 GIF Pixel Rendered"}</td>
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

        {activeTab === "warmup" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Inbox Warmup</h2>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
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
        )}

        {activeTab === "bounceguard" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Bounce Guard</h2>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <form onSubmit={handleRunBounceGuard} className="space-y-3">
                <input
                  type="email"
                  value={singleTestEmail}
                  onChange={(e) => setSingleTestEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                />
                <button type="submit" className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-xs font-bold">
                  Validate Email
                </button>
              </form>
              {validationResult && (
                <pre className="text-xs font-mono bg-slate-50 p-3 rounded">{JSON.stringify(validationResult, null, 2)}</pre>
              )}
            </div>
          </div>
        )}

        {activeTab === "drips" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Drip Sequences</h2>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              {dripSequence.steps.map((step) => (
                <div key={step.stepNumber} className="p-3 border rounded bg-slate-50 text-xs">
                  Step #{step.stepNumber}: {step.subject} ({step.condition})
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "domains" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Domain Auth</h2>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <form onSubmit={handleRegisterDomain} className="space-y-3">
                <input
                  type="text"
                  value={inputDomain}
                  onChange={(e) => setInputDomain(e.target.value)}
                  className="w-full rounded border p-2 text-xs"
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 text-xs rounded font-bold">Register Domain</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "subscribers" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Audience & Lead Scoring</h2>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-600">Total Subscribers: {subscribersData?.totalCount || 0}</p>
            </div>
          </div>
        )}

        {activeTab === "webhooks" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Webhooks</h2>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <form onSubmit={handleAddWebhook} className="space-y-3">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full border rounded p-2 text-xs"
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 text-xs rounded font-bold">Add Webhook</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div className="max-w-2xl mx-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Self-Hosted Asset Upload</h3>
            <form onSubmit={handleUpload} className="space-y-3">
              <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="text-xs" />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 text-xs rounded font-bold">Upload</button>
            </form>
          </div>
        )}
      </main>

      {/* DETAILED RECIPIENT INSPECTION MODAL */}
      {selectedCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedCampaignModal.name}</h3>
                <p className="text-xs text-slate-500">Subject: {selectedCampaignModal.subject}</p>
              </div>
              <button
                onClick={() => setSelectedCampaignModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Mails Sent</p>
                <p className="text-lg font-extrabold text-slate-900">{selectedCampaignModal.stats?.sentCount || 0}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-[10px] text-emerald-800 font-bold uppercase">Opened Rate</p>
                <p className="text-lg font-extrabold text-emerald-700">{selectedCampaignModal.stats?.openRate || "0%"}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-[10px] text-indigo-800 font-bold uppercase">Clicked Rate</p>
                <p className="text-lg font-extrabold text-indigo-700">{selectedCampaignModal.stats?.clickRate || "0%"}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Bounced Back</p>
                <p className="text-lg font-extrabold text-slate-700">0 (0.0%)</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recipient Log Audit ({selectedCampaignModal.recipientLogs?.length || 0})</h4>
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {selectedCampaignModal.recipientLogs?.map((l: any, idx: number) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                    <span className="font-semibold text-slate-900">{l.toEmail}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.openedAt ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-400"}`}>
                        {l.openedAt ? "Opened" : "Unopened"}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.clickedAt ? "bg-indigo-50 text-indigo-800 border border-indigo-200" : "bg-slate-100 text-slate-400"}`}>
                        {l.clickedAt ? "Clicked" : "No Click"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCampaignModal(null)}
                className="rounded-lg bg-slate-900 text-white px-4 py-1.5 text-xs font-bold hover:bg-slate-800"
              >
                Close Audit Window
              </button>
            </div>
          </div>
        </div>
      )}

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
