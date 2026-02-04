import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { ProductsSection } from "@/components/products-section"
import { AboutSection } from "@/components/about-section"
import { ContactSection } from "@/components/contact-section"
import { PromotionsBanner } from "@/components/promotions-banner"
import type { Category, Product, SeasonalPromotion, SiteSetting } from "@/lib/types"

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

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true })
  return (data || []) as Category[]
}

async function getProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
  return (data || []) as Product[]
}

async function getActivePromotions() {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]
  const { data } = await supabase
    .from("seasonal_promotions")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .order("start_date", { ascending: false })
  return (data || []) as SeasonalPromotion[]
}

export default async function HomePage() {
  const [settings, categories, products, promotions] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts(),
    getActivePromotions(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection
          title={settings.hero_title || "Regalos que Emocionan"}
          subtitle={settings.hero_subtitle || "Arreglos florales, bandejas de desayuno y bordados personalizados para cada ocasión especial"}
          whatsappNumber={settings.whatsapp_number || ""}
        />

        {promotions.length > 0 && (
          <PromotionsBanner
            promotions={promotions}
            whatsappNumber={settings.whatsapp_number || ""}
          />
        )}

        <ProductsSection
          categories={categories}
          products={products}
          whatsappNumber={settings.whatsapp_number}
        />

        <AboutSection
          title={settings.about_title || "Sobre Nosotros"}
          text={settings.about_text || "Creamos arreglos únicos y personalizados con amor y dedicación para hacer de cada momento algo especial."}
        />

        <ContactSection whatsappNumber={settings.whatsapp_number || ""} />
      </main>

      <Footer />
    </div>
  )
}
