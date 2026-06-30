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
  const supabase = await createClient();
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

  const navLinks = [
    { href: "/admin-panel", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin-panel/users", label: "Users", icon: Users },
    { href: "/admin-panel/plans", label: "Plans", icon: Layers },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">

      {/* Sidebar — hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900 flex-col">
        <div className="flex h-14 items-center border-b border-slate-800 px-4">
          <ShieldAlert className="mr-2 h-5 w-5 text-indigo-500" />
          <span className="font-semibold text-white">SaaS Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Icon className="mr-3 h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <Link
            href="/inbox"
            className="flex w-full items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Top bar — visible on mobile only */}
        <header className="flex md:hidden h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-500" />
            <span className="font-semibold text-white text-sm">SaaS Admin</span>
          </div>
          <Link
            href="/inbox"
            className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>

        {/* Bottom nav — visible on mobile only */}
        <nav className="fixed bottom-0 left-0 right-0 flex md:hidden h-16 items-center justify-around border-t border-slate-800 bg-slate-900 px-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-slate-400 hover:text-white transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
