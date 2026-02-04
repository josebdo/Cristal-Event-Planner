import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PromotionForm } from "@/components/admin/promotion-form"
import type { SeasonalPromotion } from "@/lib/types"

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: promotion } = await supabase
    .from("seasonal_promotions")
    .select("*")
    .eq("id", id)
    .single()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name")

  if (!promotion) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Editar Promoción
        </h1>
        <p className="mt-1 text-muted-foreground">
          Modifica la información de la promoción
        </p>
      </div>

      <PromotionForm
        promotion={promotion as SeasonalPromotion}
        products={(products || []) as any[]}
      />
    </div>
  )
}
