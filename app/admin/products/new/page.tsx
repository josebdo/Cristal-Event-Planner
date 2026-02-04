import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"
import type { Category } from "@/lib/types"

export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  const { data: promotions } = await supabase
    .from("seasonal_promotions")
    .select("*")
    .eq("is_active", true)
    .order("start_date", { ascending: false })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Nuevo Producto
        </h1>
        <p className="mt-1 text-muted-foreground">
          Agrega un nuevo producto al catálogo
        </p>
      </div>

      <ProductForm
        categories={(categories || []) as Category[]}
        promotions={(promotions || []) as any[]}
      />
    </div>
  )
}