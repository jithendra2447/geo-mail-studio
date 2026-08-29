"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const workspaceId = searchParams.get("ws") || "";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnsubscribe = async () => {
    setLoadingState(true);

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, workspaceId }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to complete unsubscribe request.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  const setLoadingState = (loading: boolean) => {
    if (loading) setStatus("loading");
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center space-y-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-2xl">
        📭
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Email Unsubscribe</h1>
        <p className="text-sm text-slate-600">
          Manage your email communication preferences for <strong className="text-slate-900">{email || "this address"}</strong>.
        </p>
      </div>

      {status === "idle" && (
        <button
          onClick={handleUnsubscribe}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
        >
          Confirm Unsubscribe
        </button>
      )}

      {status === "loading" && (
        <div className="py-4 text-sm font-medium text-slate-600 flex items-center justify-center space-x-2">
          <span className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span>Processing unsubscribe request...</span>
        </div>
      )}

      {status === "success" && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 text-sm font-semibold">
          ✅ You have been successfully unsubscribed from this workspace's mailing list.
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-900 text-sm font-semibold">
          ❌ {errorMessage}
        </div>
      )}

      <p className="text-xs text-slate-400">
        GEO Mail Automation Engine • CAN-SPAM / GDPR Compliant
      </p>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-slate-500 text-sm">Loading unsubscribe preferences...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
