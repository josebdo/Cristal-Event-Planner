import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/admin/settings-form"
import type { SiteSetting } from "@/lib/types"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settingsData } = await supabase.from("site_settings").select("*")

  const settings: Record<string, string> = {}
  if (settingsData) {
    for (const setting of settingsData as SiteSetting[]) {
      settings[setting.key] = setting.value || ""
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Configuración del Sitio
        </h1>
        <p className="mt-1 text-muted-foreground">
          Personaliza el contenido de tu sitio web
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  )
}
