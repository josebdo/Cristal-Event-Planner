"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Tag,
  Megaphone,
  Settings,
  LogOut,
  ExternalLink,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ['admin', 'editor'] },
  { href: "/admin/products", label: "Productos", icon: Package, roles: ['admin', 'editor'] },
  { href: "/admin/categories", label: "Categorías", icon: Tag, roles: ['admin', 'editor'] },
  { href: "/admin/promotions", label: "Promociones", icon: Megaphone, roles: ['admin', 'editor'] },
  { href: "/admin/users", label: "Usuarios", icon: Users, roles: ['admin'] },
  { href: "/admin/settings", label: "Configuración", icon: Settings, roles: ['admin', 'editor'] },
]

interface AdminSidebarProps {
  user: User
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const userRole = user.user_metadata?.role || 'editor' // Default to editor if no role

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="font-serif text-lg font-semibold text-foreground">
          Admin Panel
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.filter(item => item.roles.includes(userRole)).map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ExternalLink className="size-5" />
          Ver Sitio
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="size-5" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  )
}
