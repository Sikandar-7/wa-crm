"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function assignPlanAction(userId: string, planId: string) {
  const supabase = createClient();
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Unauthorized" };

  // Upsert subscription
  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: userId,
      plan_id: planId,
      status: "active"
    }, { onConflict: "user_id" });

  if (error) {
    console.error("Error assigning plan:", error);
    return { error: error.message };
  }

  revalidatePath("/admin-panl/users");
  return { success: true };
}
