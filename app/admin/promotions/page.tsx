import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil } from "lucide-react"
import type { SeasonalPromotion } from "@/lib/types"
import { DeletePromotionButton } from "@/components/admin/delete-promotion-button"

export default async function PromotionsPage() {
  const supabase = await createClient()
  const { data: promotions } = await supabase
    .from("seasonal_promotions")
    .select("*")
    .order("start_date", { ascending: false })

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Promociones de Temporada
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona las promociones especiales
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/promotions/new">
            <Plus className="mr-2 size-4" />
            Nueva Promoción
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Promociones</CardTitle>
        </CardHeader>
        <CardContent>
          {!promotions || promotions.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No hay promociones aún. Crea la primera.
            </p>
          ) : (
            <div className="divide-y">
              {(promotions as SeasonalPromotion[]).map((promotion) => {
                const isActive = 
                  promotion.is_active && 
                  promotion.start_date <= today && 
                  promotion.end_date >= today

                return (
                  <div
                    key={promotion.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="relative size-16 overflow-hidden rounded-lg bg-muted">
                      {promotion.banner_image_url ? (
                        <Image
                          src={promotion.banner_image_url || "/placeholder.svg"}
                          alt={promotion.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <span className="font-serif text-xl text-muted-foreground">P</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{promotion.name}</p>
                        {isActive ? (
                          <Badge className="bg-green-500 text-white">Activa</Badge>
                        ) : !promotion.is_active ? (
                          <Badge variant="secondary">Desactivada</Badge>
                        ) : (
                          <Badge variant="outline">Programada</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(promotion.start_date).toLocaleDateString("es")} - {new Date(promotion.end_date).toLocaleDateString("es")}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/promotions/${promotion.id}`}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Link>
                      </Button>
                      <DeletePromotionButton promotionId={promotion.id} promotionName={promotion.name} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
