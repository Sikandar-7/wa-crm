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
      <Card className="bg-card border-slate-800 animate-pulse">
        <CardHeader className="h-24 bg-secondary border-border/50 rounded-t-lg" />
        <CardContent className="h-32" />
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="bg-card border-slate-800">
        <CardHeader>
          <CardTitle className="text-foreground">Current Plan</CardTitle>
          <CardDescription className="text-muted-foreground">
            You are not currently subscribed to any plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full sm:w-auto bg-secondary border-border text-muted-foreground">
            Contact Admin to Upgrade
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">{plan.name}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {plan.description}
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">${plan.price}</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Plan Limits</h4>
          <div className="flex justify-between items-center py-2 border-b border-slate-800 text-sm text-muted-foreground">
            <span>Max Contacts</span>
            <span className="font-medium text-foreground">{plan.limits?.max_contacts || 'Unlimited'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-800 text-sm text-muted-foreground">
            <span>Max Messages (Monthly)</span>
            <span className="font-medium text-foreground">{plan.limits?.max_messages || 'Unlimited'}</span>
          </div>
        </div>
        
        <div className="pt-4">
          <Button disabled className="w-full sm:w-auto bg-secondary border-border text-muted-foreground">
            Manage Billing (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
