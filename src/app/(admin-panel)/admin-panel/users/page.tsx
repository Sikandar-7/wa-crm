import { createClient } from "@/lib/supabase/server";
import { UsersClientPage } from "./users-client";

export default async function AdminUsersPage() {
  const supabase = createClient();

  // Fetch all profiles
  const { data: users } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  // Fetch all plans
  const { data: plans } = await supabase
    .from("plans")
    .select("id, name");

  // Fetch all subscriptions
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("user_id, plan_id, status");

  // Map subscriptions to users
  const usersWithPlans = users?.map(user => {
    const sub = subscriptions?.find(s => s.user_id === user.user_id);
    return {
      ...user,
      plan_id: sub?.plan_id || null,
      status: sub?.status || "none"
    };
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Users</h1>
        <p className="text-slate-400">Manage users and assign SaaS plans.</p>
      </div>
      
      <UsersClientPage users={usersWithPlans} plans={plans || []} />
    </div>
  );
}
