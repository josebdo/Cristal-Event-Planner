"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
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
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ['admin', 'editor', 'superadmin'] },
  { href: "/admin/products", label: "Productos", icon: Package, roles: ['admin', 'editor', 'superadmin'] },
  { href: "/admin/categories", label: "Categorías", icon: Tag, roles: ['admin', 'editor', 'superadmin'] },
  { href: "/admin/promotions", label: "Promociones", icon: Megaphone, roles: ['admin', 'editor', 'superadmin'] },
  { href: "/admin/users", label: "Usuarios", icon: Users, roles: ['admin', 'superadmin'] },
  { href: "/admin/settings", label: "Configuración", icon: Settings, roles: ['admin', 'editor', 'superadmin'] },
]

interface AdminSidebarProps {
  user: User
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>(user.user_metadata?.role || 'editor')

  useEffect(() => {
    async function fetchRole() {
      if (!user.user_metadata?.role) {
        const supabase = createClient()
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (data?.role) {
          setUserRole(data.role)
        }
      }
    }
    fetchRole()
  }, [user])

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
