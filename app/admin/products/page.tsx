import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Product } from "@/lib/types"
import { DeleteProductButton } from "@/components/admin/delete-product-button"

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("display_order", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Productos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona tu catálogo de productos
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 size-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {!products || products.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No hay productos aún. Crea el primero.
            </p>
          ) : (
            <div className="divide-y">
              {products.map((product: Product & { categories: { name: string } | null }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="relative size-16 overflow-hidden rounded-lg bg-muted">
                    {product.image_url ? (
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <span className="font-serif text-xl text-muted-foreground">D</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{product.name}</p>
                      {!product.is_active && (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                      {product.is_promotion && (
                        <Badge>Promoción</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.categories?.name || "Sin categoría"}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/products/${product.id}`}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </Link>
                    </Button>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
