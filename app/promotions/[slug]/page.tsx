import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ProductsSection } from "@/components/products-section"
import { Category, SiteSetting } from "@/lib/types"

async function getSettings() {
    const supabase = await createClient()
    const { data } = await supabase.from("site_settings").select("*")

    const settings: Record<string, string> = {}
    if (data) {
        for (const setting of data as SiteSetting[]) {
            settings[setting.key] = setting.value || ""
        }
    }
    return settings
}

export default async function PromotionDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch settings for WhatsApp number
    const settings = await getSettings()

    // 1. Fetch promotion
    const { data: promotion } = await supabase
        .from("seasonal_promotions")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single()

    if (!promotion) {
        notFound()
    }

    // 2. Fetch products in this promotion
    // Note: We need to manually filter or ensuring query is correct.
    // We use seasonal_promotion_id to find products linked to this promotion
    const { data: products } = await supabase
        .from("products")
        .select("*, categories(*)")
        .eq("seasonal_promotion_id", promotion.id)
        .eq("is_active", true)

    // 3. Helper to mock 'categories' for the reusable ProductsSection if needed
    // Or we can just build a custom grid here. Let's use custom grid for flexibility
    // but ProductsSection is good if we want filtering. 
    // Given we just want to show "products in this promotion", a simple grid is likely better 
    // to emphasize the promotion context.

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />

            <main className="flex-1">
                {/* Banner Section */}
                <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
                    {promotion.banner_image_url ? (
                        <Image
                            src={promotion.banner_image_url}
                            alt={promotion.name}
                            fill
                            priority
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <h1 className="text-4xl font-serif">{promotion.name}</h1>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center text-white p-4">
                            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{promotion.name}</h1>
                            <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">{promotion.description}</p>
                        </div>
                    </div>
                </div>

                <section className="container mx-auto px-4 py-12">
                    <h2 className="text-3xl font-serif font-bold text-center mb-10">Productos en Promoción</h2>

                    {products && products.length > 0 ? (
                        // We can reuse ProductsSection but passing only these products.
                        // However, ProductsSection expects full categories. Let's try to reuse it 
                        // to keep UI consistent, passing a dummy 'All' category if needed or just rendering the grid.
                        // Actually, the user asked for: "clik se abra una ventas con los detalles del producto"
                        // which implies we need the modal logic everywhere.
                        // So I should update ProductsSection OR create a Reusable ProductGrid component.
                        // For now, let's reuse ProductsSection passing a synthetic category list if implied,
                        // or better, let's Render the ProductsSection with a Prop.

                        // Wait, ProductsSection handles filtering. Here we usually just want to see the list.
                        // Let's render the ProductsSection with just these products and NO category filter 
                        // if we can refactor it, or just use it as is.
                        // Let's look at ProductsSection again... it takes categories and products.
                        // We can pass empty categories to hide tabs? Let's check ProductsSection logic later.
                        // For now, I will use ProductsSection directly as it seems robust.
                        <ProductsSection
                            categories={[]} // No extra categories tabs needed for a specific promo page usually
                            products={products}
                            title="Ofertas Disponibles"
                            whatsappNumber={settings.whatsapp_number}
                        />
                    ) : (
                        <p className="text-center text-muted-foreground py-10">
                            No hay productos disponibles en esta promoción actualmente.
                        </p>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    )
}
