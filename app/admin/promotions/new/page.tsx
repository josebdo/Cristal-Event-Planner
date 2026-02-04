import { PromotionForm } from "@/components/admin/promotion-form"

import { createClient } from "@/lib/supabase/server"

export default async function NewPromotionPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name")
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Nueva Promoción
        </h1>
        <p className="mt-1 text-muted-foreground">
          Crea una nueva promoción de temporada
        </p>
      </div>

      <PromotionForm products={(products || []) as any[]} />
    </div>
  )
}
