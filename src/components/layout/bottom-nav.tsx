"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MessageSquare, Users, GitBranch, User, CreditCard } from "lucide-react";
import { useTotalUnread } from "@/hooks/use-total-unread";

const bottomNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/pipelines", label: "Deals", icon: GitBranch },
  { href: "/settings?tab=plan", label: "Plan", icon: CreditCard },
  { href: "/settings", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const totalUnread = useTotalUnread();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-800 bg-card pb-safe pt-1 lg:hidden">
      {bottomNavItems.map((item) => {
        const isPlan = item.href.includes('tab=plan');
        const isSettings = item.href === '/settings';
        const tab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("tab") : null;
        
        let isActive = false;
        if (isPlan) {
          isActive = tab === "plan";
        } else if (isSettings) {
          isActive = pathname === "/settings" && tab !== "plan";
        } else {
          isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        }

        const showUnreadBadge = item.href === "/inbox" && totalUnread > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              {showUnreadBadge && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
