import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <Link href="/" className="font-serif text-xl font-semibold text-foreground">
            Detalles con Amor
          </Link>
          <p className="max-w-md text-sm text-muted-foreground">
            Creamos arreglos únicos y personalizados con amor y dedicación para hacer de cada momento algo especial.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Hecho con</span>
            <Heart className="size-4 fill-primary text-primary" />
            <span>para ti</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
