import { createClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./dashboard-client";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Stats
  const [
    { count: usersCount },
    { count: pendingCount },
    { count: activePlansCount },
    { data: plans },
    { data: users },
    { data: requests },
    { data: messages },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("subscription_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("plans").select("id, name, price, price_pkr, limits"),
    supabase.from("profiles").select("user_id, full_name, email, role, created_at").order("created_at", { ascending: false }),
    supabase.from("subscription_requests").select("*, plans(name, price_pkr), profiles!inner(full_name, email)").order("created_at", { ascending: false }),
    supabase.from("messages").select("id, content_text, created_at, sender_type, conversation_id").order("created_at", { ascending: false }).limit(50),
  ]);

  // Get subscriptions with plan info
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("user_id, plan_id, status, expires_at, payment_method, plans(name, price_pkr)");

  // Compute total revenue from active subscriptions
  const totalRevenue = subscriptions?.reduce((sum, s: any) => {
    if (s.status === "active" && s.plans?.price_pkr) {
      return sum + Number(s.plans.price_pkr);
    }
    return sum;
  }, 0) || 0;

  // Merge subscription data into users
  const usersWithPlans = users?.map(u => {
    const sub = subscriptions?.find(s => s.user_id === u.user_id) as any;
    return { ...u, subscription: sub || null };
  }) || [];

  return (
    <AdminDashboardClient
      stats={{
        totalUsers: usersCount || 0,
        pendingRequests: pendingCount || 0,
        activePlans: activePlansCount || 0,
        totalRevenue,
      }}
      plans={plans || []}
      users={usersWithPlans}
      requests={(requests as any[]) || []}
      messages={messages || []}
    />
  );
}
