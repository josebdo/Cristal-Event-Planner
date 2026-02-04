import { Heart, Gift, Sparkles } from "lucide-react"

interface AboutSectionProps {
  title: string
  text: string
}

export function AboutSection({ title, text }: AboutSectionProps) {
  return (
    <section id="nosotros" className="bg-accent/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
            {text}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-sm">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Heart className="size-7 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Hecho con Amor
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Cada detalle es preparado con cariño y dedicación para crear momentos especiales.
            </p>
          </div>

          <div className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-sm">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Gift className="size-7 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Personalizado
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Creamos arreglos únicos adaptados a tus gustos y la ocasión especial.
            </p>
          </div>

          <div className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-sm">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-7 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              Calidad Premium
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Utilizamos los mejores materiales para garantizar la mejor presentación.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
