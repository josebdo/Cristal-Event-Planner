import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CategoryForm } from "@/components/admin/category-form"
import type { Category } from "@/lib/types"

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  if (!category) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Editar Categoría
        </h1>
        <p className="mt-1 text-muted-foreground">
          Modifica la información de la categoría
        </p>
      </div>

      <CategoryForm category={category as Category} />
    </div>
  )
}
