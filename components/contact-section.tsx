import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface ContactSectionProps {
  whatsappNumber: string
}

export function ContactSection({ whatsappNumber }: ContactSectionProps) {
  const whatsappUrl = whatsappNumber 
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Me gustaría hacer un pedido.')}`
    : "#"

  return (
    <section id="contacto" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Haz tu Pedido
          </h2>
          <p className="mt-4 text-muted-foreground text-pretty">
            Contáctanos por WhatsApp para realizar tu pedido personalizado. 
            Estaremos encantados de ayudarte a crear el regalo perfecto.
          </p>
          
          {whatsappNumber ? (
            <Button size="lg" className="mt-8 gap-2" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-5" />
                Contactar por WhatsApp
              </a>
            </Button>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              Próximamente disponible el contacto por WhatsApp.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
