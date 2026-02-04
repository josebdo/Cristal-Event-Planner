import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"
import type { Category, Product } from "@/lib/types"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [productRes, categoriesRes, promotionsRes] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
    supabase.from("seasonal_promotions").select("*").eq("is_active", true).order("start_date", { ascending: false }),
  ])

  if (!productRes.data) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Editar Producto
        </h1>
        <p className="mt-1 text-muted-foreground">
          Modifica la información del producto
        </p>
      </div>

      <ProductForm
        product={productRes.data as Product}
        categories={(categoriesRes.data || []) as Category[]}
        promotions={(promotionsRes.data || []) as any[]}
      />
    </div>
  )
}
