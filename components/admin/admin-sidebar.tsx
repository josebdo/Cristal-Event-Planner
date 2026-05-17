"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Tag,
  Megaphone,
  Settings,
  LogOut,
  ExternalLink,
  Users,
  Menu
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
  const [isOpen, setIsOpen] = useState(false)

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

  const renderNavContent = (onNavClick?: () => void) => (
    <>
      <div className="flex h-16 items-center border-b px-6 shrink-0">
        <Link href="/admin" className="font-serif text-lg font-semibold text-foreground" onClick={onNavClick}>
          Admin Panel
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.filter(item => item.roles.includes(userRole)).map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="size-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4 space-y-2 shrink-0">
        <Link
          href="/"
          target="_blank"
          onClick={onNavClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ExternalLink className="size-5 shrink-0" />
          Ver Sitio
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="size-5 shrink-0" />
          Cerrar Sesión
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Top Navigation */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-card px-4 md:hidden">
        <Link href="/admin" className="font-serif text-lg font-semibold text-foreground">
          Admin Panel
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menú de navegación">
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-64 flex-col p-0 border-r bg-card">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de navegación del panel</SheetTitle>
            </SheetHeader>
            {renderNavContent(() => setIsOpen(false))}
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden md:flex h-screen w-64 flex-col border-r bg-card shrink-0">
        {renderNavContent()}
      </aside>
    </>
  )
}
