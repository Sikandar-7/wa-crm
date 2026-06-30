import { createClient } from "@/lib/supabase/server";

export default async function AdminPlansPage() {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("price", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Plans</h1>
        <p className="text-muted-foreground">View and manage SaaS subscription plans.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan) => (
          <div key={plan.id} className="rounded-lg border border-slate-800 bg-card p-6 flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{plan.description}</p>
            
            <div className="mb-4">
              <span className="text-2xl font-bold text-foreground">${plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <div className="space-y-2 mb-6 text-sm text-muted-foreground">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Max Contacts</span>
                <span className="font-medium text-foreground">{plan.limits?.max_contacts || 'Unlimited'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Max Messages</span>
                <span className="font-medium text-foreground">{plan.limits?.max_messages || 'Unlimited'}</span>
              </div>
            </div>
            
            <button className="w-full rounded-md bg-secondary border-border py-2 text-sm font-medium text-foreground hover:bg-slate-700 transition-colors">
              Edit Limits (Coming Soon)
            </button>
          </div>
        ))}
        {(!plans || plans.length === 0) && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-lg border border-slate-800">
            No plans found. Database migration may not have run yet.
          </div>
        )}
      </div>
    </div>
  );
}
