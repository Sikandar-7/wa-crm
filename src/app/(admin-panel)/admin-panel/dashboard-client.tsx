"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Layers, TrendingUp, Clock, Check, X, Pencil, Trash2, RefreshCw, MessageSquare, Search } from "lucide-react";
import { approveRequestAction, rejectRequestAction, assignPlanAction, declineUserAction, deleteSubscriptionAction } from "./actions";
import { format } from "date-fns";

type Stats = { totalUsers: number; pendingRequests: number; activePlans: number; totalRevenue: number };
type Plan = { id: string; name: string; price: number; price_pkr: number; limits: any };
type User = { user_id: string; full_name: string; email: string; role: string; created_at: string; subscription: any };
type Request = { id: string; user_id: string; status: string; payment_method: string; created_at: string; plans: any; profiles: any };
type Message = { id: string; content_text: string; created_at: string; sender_type: string; conversation_id: string };

type Tab = "requests" | "users" | "messages";

export function AdminDashboardClient({
  stats, plans, users, requests, messages
}: { stats: Stats; plans: Plan[]; users: User[]; requests: Request[]; messages: Message[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("requests");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const r = await approveRequestAction(id);
    r?.error ? toast.error(r.error) : toast.success("Request approved!");
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    const r = await rejectRequestAction(id);
    r?.error ? toast.error(r.error) : toast.success("Request rejected!");
    setLoadingId(null);
  };

  const handleAssign = async (userId: string, planId: string) => {
    if (!planId) return;
    setLoadingId(userId);
    const r = await assignPlanAction(userId, planId);
    r?.error ? toast.error(r.error) : toast.success("Plan assigned!");
    setLoadingId(null);
  };

  const handleDecline = async (userId: string) => {
    setLoadingId(userId + "-decline");
    const r = await declineUserAction(userId);
    r?.error ? toast.error(r.error) : toast.success("Subscription declined!");
    setLoadingId(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user's subscription?")) return;
    setLoadingId(userId + "-delete");
    const r = await deleteSubscriptionAction(userId);
    r?.error ? toast.error(r.error) : toast.success("Subscription deleted!");
    setLoadingId(null);
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || u.subscription?.plan_id === planFilter;
    return matchSearch && matchPlan;
  });

  const pendingRequests = requests.filter(r => r.status === "pending");

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={<Users className="h-5 w-5 text-blue-400" />} label="Total Users" value={stats.totalUsers} color="blue" />
        <StatCard icon={<Clock className="h-5 w-5 text-orange-400" />} label="Pending Requests" value={stats.pendingRequests} color="orange" />
        <StatCard icon={<Layers className="h-5 w-5 text-green-400" />} label="Active Plans" value={stats.activePlans} color="green" />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-emerald-400" />} label="Total Revenue" value={`Rs.${stats.totalRevenue.toLocaleString()}`} color="emerald" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card p-1 rounded-lg w-full overflow-x-auto">
        <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")} badge={stats.pendingRequests}>
          Subscription Requests
        </TabButton>
        <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>
          All Users
        </TabButton>
        <TabButton active={activeTab === "messages"} onClick={() => setActiveTab("messages")}>
          Messages Log
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === "requests" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Pending Subscription Requests</h2>
            <button onClick={() => window.location.reload()} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
          <div className="rounded-lg border border-slate-800 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map(req => (
                    <tr key={req.id} className="border-b border-slate-800 hover:bg-secondary border-border/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0">
                            {req.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{req.profiles?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{req.profiles?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">
                          {req.plans?.name}
                        </span>
                        {req.plans?.price_pkr > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">Rs.{req.plans.price_pkr}/mo</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{req.payment_method}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">Pending</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={loadingId === req.id}
                            className="h-7 w-7 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5 text-foreground" />
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={loadingId === req.id}
                            className="h-7 w-7 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5 text-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No pending requests.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-between">
            <h2 className="text-lg font-semibold text-foreground">All Registered Users</h2>
            <button onClick={() => window.location.reload()} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card border border-slate-700 rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              className="bg-card border border-slate-700 text-sm rounded-md px-3 py-2 text-foreground"
            >
              <option value="all">All Plans</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-slate-800 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden md:table-cell">Joined</th>
                    <th className="px-4 py-3 hidden md:table-cell">Expiry</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.user_id} className="border-b border-slate-800 hover:bg-secondary border-border/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0">
                            {u.full_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-foreground text-sm truncate max-w-[100px]">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.subscription?.plans?.name ? (
                          <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                            {u.subscription.plans.name}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No Plan</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.subscription?.status === "active" ? (
                          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                            <Check className="h-3 w-3" /> Approved
                          </span>
                        ) : u.subscription?.status === "canceled" ? (
                          <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-full w-fit">Declined</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                        {u.created_at ? format(new Date(u.created_at), "dd MMM yyyy") : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                        {u.subscription?.expires_at ? format(new Date(u.subscription.expires_at), "dd MMM yyyy") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {u.subscription?.status === "active" && (
                            <button
                              onClick={() => handleDecline(u.user_id)}
                              disabled={loadingId === u.user_id + "-decline"}
                              className="px-2 py-1 text-[10px] font-medium rounded bg-red-600 hover:bg-red-500 text-foreground transition-colors disabled:opacity-50"
                            >
                              Decline
                            </button>
                          )}
                          <select
                            defaultValue={u.subscription?.plan_id || ""}
                            onChange={e => handleAssign(u.user_id, e.target.value)}
                            disabled={loadingId === u.user_id}
                            className="px-1.5 py-1 text-[10px] rounded bg-blue-600 hover:bg-blue-500 text-foreground border-0 focus:outline-none cursor-pointer"
                          >
                            <option value="" disabled>Pass Plan</option>
                            {plans.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDelete(u.user_id)}
                            disabled={loadingId === u.user_id + "-delete"}
                            className="px-2 py-1 text-[10px] font-medium rounded bg-slate-700 hover:bg-slate-600 text-foreground transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Recent Messages Log</h2>
          <div className="rounded-lg border border-slate-800 bg-card divide-y divide-slate-800">
            {messages.map(msg => (
              <div key={msg.id} className="px-4 py-3 flex items-start gap-3">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender_type === 'agent' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                  <MessageSquare className="h-3.5 w-3.5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${msg.sender_type === 'agent' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {msg.sender_type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{msg.created_at ? format(new Date(msg.created_at), "dd MMM yyyy, HH:mm") : ""}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{msg.content_text || "(media)"}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="px-4 py-10 text-center text-muted-foreground">No messages found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: any; color: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        {icon}
      </div>
      <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, children, badge }: { active: boolean; onClick: () => void; children: React.ReactNode; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active ? "bg-indigo-600 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary border-border"
      }`}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="h-5 min-w-5 px-1 rounded-full bg-red-500 text-foreground text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}
