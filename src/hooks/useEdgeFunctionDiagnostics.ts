import { useEffect } from "react";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

/**
 * Runs a series of connectivity checks to Supabase services and logs
 * detailed diagnostics to the browser console. Useful to understand
 * why Edge Function requests may be failing (CORS, network, DNS, etc.).
 */
export function useEdgeFunctionDiagnostics() {
  useEffect(() => {
    const run = async () => {
      const fn = "manual-actions";
      const email = (localStorage.getItem("superAdminEmail") || "").trim().toLowerCase();
      const fnUrl = `${SUPABASE_URL}/functions/v1/${fn}?_t=${Date.now()}`;

      // High-level environment info
      console.groupCollapsed("[Diagnostics] Supabase connectivity");
      console.log("Environment", {
        SUPABASE_URL,
        hasPublishableKey: Boolean(SUPABASE_PUBLISHABLE_KEY),
        origin: window.location.origin,
        online: navigator.onLine,
        userAgent: navigator.userAgent,
        time: new Date().toISOString(),
      });

      // 1) invoke-based health (supabase-js adds required headers)
      try {
        const { data, error } = await supabase.functions.invoke(fn, {
          body: { action: "health", email },
        });
        if (error) throw error;
        console.log("[invoke:health] OK", data);
      } catch (e: any) {
        console.error("[invoke:health] FAILED", {
          name: e?.name,
          message: e?.message,
          stack: e?.stack,
        });
      }

      // 2) direct GET to Edge Function
      try {
        const res = await fetch(fnUrl, {
          method: "GET",
          headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
          mode: "cors",
          cache: "no-store",
        });
        const text = await res.text();
        console.log("[direct GET]", { status: res.status, text });
      } catch (e: any) {
        console.error("[direct GET] FAILED", {
          name: e?.name,
          message: e?.message,
          stack: e?.stack,
        });
      }

      // 3) direct POST health to Edge Function
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action: "health", email }),
          mode: "cors",
          cache: "no-store",
        });
        const text = await res.text();
        console.log("[direct POST health]", { status: res.status, text });
      } catch (e: any) {
        console.error("[direct POST health] FAILED", {
          name: e?.name,
          message: e?.message,
          stack: e?.stack,
        });
      }

      // 4) auth service reachability
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/settings?_t=${Date.now()}`, {
          headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
          mode: "cors",
          cache: "no-store",
        });
        const text = await res.text();
        console.log("[auth settings]", { status: res.status, text });
      } catch (e: any) {
        console.error("[auth settings] FAILED", {
          name: e?.name,
          message: e?.message,
          stack: e?.stack,
        });
      }

      // 5) another Edge Function to validate routing
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-users?_t=${Date.now()}`, {
          method: "GET",
          headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
          mode: "cors",
          cache: "no-store",
        });
        const text = await res.text();
        console.log("[manage-users GET]", { status: res.status, text });
      } catch (e: any) {
        console.error("[manage-users GET] FAILED", {
          name: e?.name,
          message: e?.message,
          stack: e?.stack,
        });
      }

      console.groupEnd();
    };

    run();
  }, []);
}
