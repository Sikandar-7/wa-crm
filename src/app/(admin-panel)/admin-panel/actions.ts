"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
  if (profile?.role !== "admin") return null;
  return supabase;
}

// Approve a subscription request
export async function approveRequestAction(requestId: string) {
  const supabase = await verifyAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { data: req } = await supabase.from("subscription_requests").select("*").eq("id", requestId).single();
  if (!req) return { error: "Request not found" };

  const { error: subError } = await supabase.from("subscriptions").upsert({
    user_id: req.user_id,
    plan_id: req.plan_id,
    status: "active",
    payment_method: req.payment_method,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: "user_id" });

  if (subError) return { error: subError.message };

  await supabase.from("subscription_requests").update({ status: "approved" }).eq("id", requestId);
  revalidatePath("/admin-panel");
  return { success: true };
}

// Reject a subscription request
export async function rejectRequestAction(requestId: string) {
  const supabase = await verifyAdmin();
  if (!supabase) return { error: "Unauthorized" };

  await supabase.from("subscription_requests").update({ status: "rejected" }).eq("id", requestId);
  revalidatePath("/admin-panel");
  return { success: true };
}

// Assign plan directly to user
export async function assignPlanAction(userId: string, planId: string) {
  const supabase = await verifyAdmin();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase.from("subscriptions").upsert({
    user_id: userId,
    plan_id: planId,
    status: "active",
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: "user_id" });

  if (error) return { error: error.message };
  revalidatePath("/admin-panel");
  return { success: true };
}

// Decline (deactivate) a user's subscription
export async function declineUserAction(userId: string) {
  const supabase = await verifyAdmin();
  if (!supabase) return { error: "Unauthorized" };

  await supabase.from("subscriptions").update({ status: "canceled" }).eq("user_id", userId);
  revalidatePath("/admin-panel");
  return { success: true };
}

// Delete a user's subscription entirely
export async function deleteSubscriptionAction(userId: string) {
  const supabase = await verifyAdmin();
  if (!supabase) return { error: "Unauthorized" };

  await supabase.from("subscriptions").delete().eq("user_id", userId);
  revalidatePath("/admin-panel");
  return { success: true };
}
