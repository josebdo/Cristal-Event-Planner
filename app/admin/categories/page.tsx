import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Category } from "@/lib/types"
import { DeleteCategoryButton } from "@/components/admin/delete-category-button"

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Categorías
          </h1>
          <p className="mt-1 text-muted-foreground">
            Organiza tus productos por categorías
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 size-4" />
            Nueva Categoría
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          {!categories || categories.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No hay categorías aún. Crea la primera.
            </p>
          ) : (
            <div className="divide-y">
              {(categories as Category[]).map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <span className="font-serif text-lg text-primary">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {category.description || "Sin descripción"}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/categories/${category.id}`}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </Link>
                    </Button>
                    <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
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
