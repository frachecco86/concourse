import Link from "next/link";
import { LogOut, Building, BookOpen, GraduationCap, LayoutDashboard, FileUp, ShoppingCart } from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/concorsi", label: "Concorsi", icon: Building },
  { href: "/admin/materie", label: "Materie", icon: BookOpen },
  { href: "/admin/corsi", label: "Corsi", icon: GraduationCap },
  { href: "/admin/materiali", label: "Materiali", icon: FileUp },
  { href: "/admin/vendite", label: "Vendite", icon: ShoppingCart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r bg-white">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
            CC
          </div>
          <span className="text-sm font-semibold">ConCourse Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t p-3">
          <Link
            href="/logout"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Esci
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
