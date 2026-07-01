"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface NextRouter {
  push: (href: string) => void;
  refresh: () => void;
}

/**
 * Clears all application state from localStorage matching prefix "buddy_" or Supabase auth keys "sb-".
 */
export function clearBuddyStorage() {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("buddy_") || key.startsWith("sb-"))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    document.cookie = "buddy_bypass_token=; path=/; max-age=0";
    document.cookie = "buddy_bypass_role=; path=/; max-age=0";
  } catch (e) {
    console.error("Failed to clear app storage:", e);
  }
}

/**
 * Terminates Supabase session, clears prefix-based localStorage state, and redirects to login.
 */
export async function performLogout(router?: NextRouter) {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Error signing out from Supabase:", e);
  } finally {
    clearBuddyStorage();
    if (router) {
      router.push("/login");
      router.refresh();
    } else if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}

/**
 * Hook to synchronize Supabase auth state across tabs and trigger prefix-based cleanup on logout.
 */
export function useAuthSync() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearBuddyStorage();
        router.push("/login");
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);
}

