"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SettingsFormProps {
  settings: Record<string, string>
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    whatsapp_number: settings.whatsapp_number || "",
    hero_title: settings.hero_title || "Regalos que Emocionan",
    hero_subtitle: settings.hero_subtitle || "Arreglos florales, bandejas de desayuno y bordados personalizados para cada ocasión especial",
    about_title: settings.about_title || "Sobre Nosotros",
    about_text: settings.about_text || "Creamos arreglos únicos y personalizados con amor y dedicación para hacer de cada momento algo especial.",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const updates = Object.entries(formData).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))

    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: update.value, updated_at: update.updated_at })
        .eq("key", update.key)

      if (error) {
        toast.error(`Error al actualizar ${update.key}`)
        setIsLoading(false)
        return
      }
    }

    toast.success("Configuración guardada")
    setIsLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
          <CardDescription>
            Configura la información de contacto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">Número de WhatsApp</Label>
            <Input
              id="whatsapp_number"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="Ej: +57 300 123 4567"
            />
            <p className="text-xs text-muted-foreground">
              Incluye el código de país. Este número se usará para el botón de WhatsApp.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sección Hero</CardTitle>
          <CardDescription>
            El contenido principal que ven los visitantes al entrar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero_title">Título Principal</Label>
            <Input
              id="hero_title"
              value={formData.hero_title}
              onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_subtitle">Subtítulo</Label>
            <Textarea
              id="hero_subtitle"
              value={formData.hero_subtitle}
              onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sección Nosotros</CardTitle>
          <CardDescription>
            Información sobre tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="about_title">Título</Label>
            <Input
              id="about_title"
              value={formData.about_title}
              onChange={(e) => setFormData({ ...formData, about_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about_text">Texto</Label>
            <Textarea
              id="about_text"
              value={formData.about_text}
              onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Guardando..." : "Guardar Configuración"}
      </Button>
    </form>
  )
}
