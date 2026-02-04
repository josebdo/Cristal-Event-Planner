import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Tag, Megaphone, TrendingUp } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const [productsRes, categoriesRes, promotionsRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("seasonal_promotions").select("id", { count: "exact", head: true }).eq("is_active", true),
  ])

  const stats = [
    { 
      label: "Productos", 
      value: productsRes.count || 0, 
      icon: Package,
      href: "/admin/products"
    },
    { 
      label: "Categorías", 
      value: categoriesRes.count || 0, 
      icon: Tag,
      href: "/admin/categories"
    },
    { 
      label: "Promociones Activas", 
      value: promotionsRes.count || 0, 
      icon: Megaphone,
      href: "/admin/promotions"
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Bienvenido al panel de administración
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a
              href="/admin/products/new"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Package className="size-8 text-primary" />
              <div>
                <p className="font-medium">Agregar Producto</p>
                <p className="text-sm text-muted-foreground">Crear un nuevo producto</p>
              </div>
            </a>
            <a
              href="/admin/promotions/new"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Megaphone className="size-8 text-primary" />
              <div>
                <p className="font-medium">Nueva Promoción</p>
                <p className="text-sm text-muted-foreground">Crear promoción de temporada</p>
              </div>
            </a>
            <a
              href="/admin/settings"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Tag className="size-8 text-primary" />
              <div>
                <p className="font-medium">Configuración</p>
                <p className="text-sm text-muted-foreground">Ajustes del sitio</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
