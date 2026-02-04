import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default async function PromotionsPage() {
    const supabase = await createClient()

    // Fetch active promotions
    const today = new Date().toISOString().split("T")[0]
    const { data: promotions } = await supabase
        .from("seasonal_promotions")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", today)
        .gte("end_date", today)
        .order("start_date", { ascending: false })

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="font-serif text-4xl font-bold text-center mb-8 text-foreground">
                    Promociones Especiales
                </h1>

                {promotions && promotions.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {promotions.map((promo) => (
                            <Link key={promo.id} href={`/promotions/${promo.slug}`} className="group">
                                <article className="overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg">
                                    <div className="relative aspect-video overflow-hidden">
                                        {promo.banner_image_url ? (
                                            <Image
                                                src={promo.banner_image_url}
                                                alt={promo.name}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
                                                Sin imagen
                                            </div>
                                        )}
                                        <Badge className="absolute top-2 right-2">
                                            Activa
                                        </Badge>
                                    </div>
                                    <div className="p-4">
                                        <h2 className="text-xl font-bold font-serif mb-2">{promo.name}</h2>
                                        <p className="text-muted-foreground line-clamp-2 text-sm">{promo.description}</p>
                                        <div className="mt-4 text-sm font-medium text-primary">Ver productos &rarr;</div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                            No hay promociones activas en este momento.
                            <br />¡Vuelve pronto para ver nuestras ofertas!
                        </p>
                        <Link href="/" className="inline-block mt-4 text-primary underline">
                            Volver al inicio
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
