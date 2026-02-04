import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface HeroSectionProps {
  title: string
  subtitle: string
  whatsappNumber: string
}

export function HeroSection({ title, subtitle, whatsappNumber }: HeroSectionProps) {
  const whatsappUrl = whatsappNumber 
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Me gustaría hacer un pedido.')}`
    : "#contacto"

  return (
    <section className="relative overflow-hidden bg-accent/30">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:gap-12 md:py-24 lg:py-32">
        <div className="order-2 md:order-1">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
            {title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl text-pretty">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-5" />
                Hacer Pedido
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#productos">Ver Productos</a>
            </Button>
          </div>
        </div>
        
        <div className="relative order-1 aspect-square overflow-hidden rounded-2xl md:order-2">
          <Image
            src="/images/hero-flowers.jpg"
            alt="Hermoso arreglo floral"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  )
}
