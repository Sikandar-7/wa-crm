import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShieldAlert, Users, Layers, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 p-4">
        <ShieldAlert className="mb-4 h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 text-center max-w-md mb-6">
          You do not have permission to view this page. This area is restricted to administrators only.
        </p>
        <Link href="/inbox">
          <Button variant="default">Return to App</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* Admin Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="flex h-14 items-center border-b border-slate-800 px-4">
          <ShieldAlert className="mr-2 h-5 w-5 text-indigo-500" />
          <span className="font-semibold text-white">SaaS Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/admin-panel"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/admin-panel/users"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Users className="mr-3 h-5 w-5" />
            Users
          </Link>
          <Link
            href="/admin-panel/plans"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Layers className="mr-3 h-5 w-5" />
            Plans
          </Link>
        </nav>
        <div className="border-t border-slate-800 p-4">
          <Link
            href="/inbox"
            className="flex w-full items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        {children}
      </main>
    </div>
  );
}
