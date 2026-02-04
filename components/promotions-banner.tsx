import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { SeasonalPromotion } from "@/lib/types"
import { MessageCircle } from "lucide-react"

interface PromotionsBannerProps {
  promotions: SeasonalPromotion[]
  whatsappNumber: string
}

export function PromotionsBanner({ promotions, whatsappNumber }: PromotionsBannerProps) {
  if (promotions.length === 0) return null

  const activePromotion = promotions[0]
  const whatsappUrl = whatsappNumber 
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Me interesa la promoción de ${activePromotion.name}`)}`
    : "#contacto"

  return (
    <section className="bg-primary/5 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg">
          <div className="flex flex-col md:flex-row">
            {activePromotion.banner_image_url ? (
              <div className="relative aspect-[16/9] w-full md:aspect-auto md:w-1/2">
                <Image
                  src={activePromotion.banner_image_url || "/placeholder.svg"}
                  alt={activePromotion.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/9] w-full items-center justify-center bg-accent md:aspect-auto md:w-1/2">
                <span className="font-serif text-6xl text-primary/20">D</span>
              </div>
            )}
            
            <div className="flex flex-col justify-center p-8 md:w-1/2 md:p-12">
              <span className="text-sm font-medium uppercase tracking-wider text-primary">
                Promoción Especial
              </span>
              <h3 className="mt-2 font-serif text-2xl font-bold text-foreground md:text-3xl">
                {activePromotion.name}
              </h3>
              {activePromotion.description && (
                <p className="mt-3 text-muted-foreground">
                  {activePromotion.description}
                </p>
              )}
              <Button className="mt-6 w-fit gap-2" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  Consultar
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
