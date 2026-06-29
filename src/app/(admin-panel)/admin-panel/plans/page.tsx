import { createClient } from "@/lib/supabase/server";

export default async function AdminPlansPage() {
  const supabase = createClient();

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("price", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Plans</h1>
        <p className="text-slate-400">View and manage SaaS subscription plans.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan) => (
          <div key={plan.id} className="rounded-lg border border-slate-800 bg-slate-900 p-6 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-sm text-slate-400 mb-4 flex-1">{plan.description}</p>
            
            <div className="mb-4">
              <span className="text-2xl font-bold text-white">${plan.price}</span>
              <span className="text-slate-500">/month</span>
            </div>

            <div className="space-y-2 mb-6 text-sm text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Max Contacts</span>
                <span className="font-medium text-white">{plan.limits?.max_contacts || 'Unlimited'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Max Messages</span>
                <span className="font-medium text-white">{plan.limits?.max_messages || 'Unlimited'}</span>
              </div>
            </div>
            
            <button className="w-full rounded-md bg-slate-800 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
              Edit Limits (Coming Soon)
            </button>
          </div>
        ))}
        {(!plans || plans.length === 0) && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900 rounded-lg border border-slate-800">
            No plans found. Database migration may not have run yet.
          </div>
        )}
      </div>
    </div>
  );
}
