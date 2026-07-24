"use client";

import {
  BookOpen,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Share2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const adminNavItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Articles", href: "/admin/articles", icon: FileText },
  { label: "Notebook", href: "/admin/content/notebook", icon: BookOpen },
  { label: "Shared Pages", href: "/admin/content/shared-pages", icon: Share2 },
  { label: "Margin Notes", href: "/admin/content/margin-notes", icon: MessageSquare },
  { label: "Subscribers", href: "/admin/newsletter", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link
          href="/admin"
          className="font-serif font-bold text-xl tracking-wide flex items-center gap-2"
        >
          TWN{" "}
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-gold bg-muted-gold/5 border border-muted-gold/20 px-2 py-0.5 rounded">
            Admin
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Website
        </Link>
      </div>
    </aside>
  );
}
