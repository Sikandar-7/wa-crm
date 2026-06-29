"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PlanCard() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user's subscription
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("*, plans(*)")
          .eq("user_id", user.id)
          .single();
          
        if (sub && sub.plans) {
          setPlan(sub.plans);
        }
      }
      setLoading(false);
    }
    
    fetchPlan();
  }, []);

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-800 animate-pulse">
        <CardHeader className="h-24 bg-slate-800/50 rounded-t-lg" />
        <CardContent className="h-32" />
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Current Plan</CardTitle>
          <CardDescription className="text-slate-400">
            You are not currently subscribed to any plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full sm:w-auto bg-slate-800 text-slate-400">
            Contact Admin to Upgrade
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">{plan.name}</CardTitle>
            <CardDescription className="text-slate-400">
              {plan.description}
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white">${plan.price}</span>
            <span className="text-slate-500 text-sm">/month</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Plan Limits</h4>
          <div className="flex justify-between items-center py-2 border-b border-slate-800 text-sm text-slate-400">
            <span>Max Contacts</span>
            <span className="font-medium text-white">{plan.limits?.max_contacts || 'Unlimited'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-800 text-sm text-slate-400">
            <span>Max Messages (Monthly)</span>
            <span className="font-medium text-white">{plan.limits?.max_messages || 'Unlimited'}</span>
          </div>
        </div>
        
        <div className="pt-4">
          <Button disabled className="w-full sm:w-auto bg-slate-800 text-slate-400">
            Manage Billing (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
