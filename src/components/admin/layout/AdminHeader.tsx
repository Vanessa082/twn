"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminNavItems } from "./AdminSidebar";

export default function AdminHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simple title generator from pathname
  const getPageTitle = () => {
    if (pathname === "/admin") return "Overview";
    if (pathname?.startsWith("/admin/articles")) return "Articles";
    if (pathname?.startsWith("/admin/content/notebook")) return "Notebook Entries";
    if (pathname?.startsWith("/admin/content/shared-pages")) return "Shared Pages";
    if (pathname?.startsWith("/admin/content/margin-notes")) return "Margin Notes";
    if (pathname?.startsWith("/admin/newsletter")) return "Subscribers";
    return "Dashboard";
  };

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger - hidden on desktop */}
          <button
            type="button"
            className="md:hidden text-muted-foreground hover:text-foreground p-1 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">System Online</span>
          </div>

          <div className="flex items-center justify-center">
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-in Menu (Sheet) */}
          <div className="relative w-3/4 max-w-sm h-full bg-card border-r border-border shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <span className="font-serif font-bold text-xl tracking-wide flex items-center gap-2">
                TWN{" "}
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-gold bg-muted-gold/5 border border-muted-gold/20 px-2 py-0.5 rounded">
                  Admin
                </span>
              </span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
                      isActive
                        ? "bg-foreground text-background font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="p-6 border-t border-border">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center w-full bg-muted text-muted-foreground hover:text-foreground py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                View Live Website
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
