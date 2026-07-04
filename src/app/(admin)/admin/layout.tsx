import { FileText, Home, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Articles", href: "/admin/articles", icon: FileText },
    { label: "Subscribers", href: "/admin/newsletter", icon: Users },
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col transition-colors duration-300">
      {/* Secondary Admin Navigation Bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            {/* Quick Stats Label */}
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-gold bg-muted-gold/5 border border-muted-gold/20 px-2.5 py-0.5 rounded-md">
                Admin Mode
              </span>
              <nav className="flex items-center gap-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Back Home */}
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              View Site
            </Link>
          </div>
        </div>
      </div>

      {/* Main Admin Workspace Content */}
      <div className="flex-1 bg-background/50">{children}</div>
    </div>
  );
}
