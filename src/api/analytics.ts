import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Helper to get an admin client for server-side only operations
function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

// 1. Get total users count
export const getTotalUsersCount = createServerFn({ method: "GET" }).handler(async () => {
  const adminClient = getSupabaseAdminClient();
  // Using the admin auth api to list users, we can just get the total
  const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    console.error("Error fetching total users:", error);
    return 0;
  }
  return data.total || 0;
});

// 2. Record a page visit
export const recordVisit = createServerFn({ method: "POST" })
  .validator((data: { sessionId: string; path: string }) => data)
  .handler(async ({ data: { sessionId, path } }) => {
    const adminClient = getSupabaseAdminClient();
    
    // We insert the visit. RLS allows anonymous inserts, but using admin client here is also fine.
    const { error } = await adminClient.from("page_visits").insert({
      session_id: sessionId,
      path: path,
    });

    if (error) {
      console.error("Error recording visit:", error);
    }
    return { success: !error };
  });

// 3. Get visits stats for the dashboard
export const getVisitsStats = createServerFn({ method: "GET" })
  .validator((data: { period: "day" | "month" | "year" }) => data)
  .handler(async ({ data: { period } }) => {
    const adminClient = getSupabaseAdminClient();
    
    // Fetch visits from the last 365 days to do aggregation in JS
    // (In a real massive app, you'd do an RPC, but this is fine for now)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 365); // Fetch 1 year for all views

    const { data, error } = await adminClient
      .from("page_visits")
      .select("id, visited_at, session_id")
      .gte("visited_at", thirtyDaysAgo.toISOString())
      .order("visited_at", { ascending: true });

    if (error) {
      console.error("Error fetching visits stats:", error);
      return [];
    }

    // Grouping by date
    const stats = new Map<string, Set<string>>(); // date -> set of session_ids (for unique visits)
    
    data.forEach(visit => {
      const date = new Date(visit.visited_at);
      let key = "";
      if (period === "day") {
        // e.g. "2026-08-11"
        key = date.toISOString().split("T")[0];
      } else if (period === "month") {
        // e.g. "2026-08"
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // e.g. "2026"
        key = `${date.getFullYear()}`;
      }

      if (!stats.has(key)) {
        stats.set(key, new Set());
      }
      stats.get(key)!.add(visit.session_id);
    });

    // Format for recharts
    const result = Array.from(stats.entries()).map(([name, sessions]) => ({
      name,
      visiteurs: sessions.size,
    }));

    // For "day", we only want the last 30 days
    if (period === "day") {
       return result.slice(-30);
    }
    // For "month", we only want the last 12 months
    if (period === "month") {
       return result.slice(-12);
    }

    return result;
  });
