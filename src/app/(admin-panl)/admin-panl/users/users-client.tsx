"use client";

import { useState } from "react";
import { assignPlanAction } from "../actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type UserType = {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  plan_id: string | null;
  status: string;
};

type PlanType = {
  id: string;
  name: string;
};

export function UsersClientPage({ users, plans }: { users: UserType[], plans: PlanType[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAssignPlan = async (userId: string, planId: string) => {
    setLoadingId(userId);
    const result = await assignPlanAction(userId, planId);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Plan updated successfully");
    }
    setLoadingId(null);
  };

  return (
    <div className="rounded-md border border-slate-800 bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Current Plan</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="px-6 py-4 font-medium text-white">{user.full_name || "N/A"}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                    user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    className="bg-slate-950 border border-slate-700 text-sm rounded-md focus:ring-primary focus:border-primary block p-2"
                    defaultValue={user.plan_id || ""}
                    onChange={(e) => handleAssignPlan(user.user_id, e.target.value)}
                    disabled={loadingId === user.user_id}
                  >
                    <option value="" disabled>No Plan</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  {loadingId === user.user_id ? (
                    <span className="text-xs text-slate-400">Updating...</span>
                  ) : (
                    <span className="text-xs text-emerald-500">{user.status === 'active' ? 'Active' : ''}</span>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
