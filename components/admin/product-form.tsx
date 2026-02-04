"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Product, Category, SeasonalPromotion } from "@/lib/types"

interface ProductFormProps {
  product?: Product
  categories: Category[]
  promotions: SeasonalPromotion[]
}

export function ProductForm({ product, categories, promotions }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.image_url || null)

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    image_url: product?.image_url || "",
    category_id: product?.category_id || "",
    price: product?.price || "",
    is_promotion: product?.is_promotion || false,
    seasonal_promotion_id: product?.seasonal_promotion_id || "",
    promotion_text: product?.promotion_text || "",
    promotion_start: product?.promotion_start || "",
    promotion_end: product?.promotion_end || "",
    is_active: product?.is_active ?? true,
    display_order: product?.display_order || 0,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    let imageUrl = formData.image_url

    // Gestión de subida de imagen a Storage
    if (selectedImage) {
      setIsUploading(true)
      const fileExt = selectedImage.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, selectedImage)

      if (uploadError) {
        toast.error(`Error al subir la imagen: ${uploadError.message}`)
        setIsUploading(false)
        setIsLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(fileName)

      imageUrl = publicUrl
      setIsUploading(false)
    }

    // --- CORRECCIÓN CRÍTICA: Mapeo de tipos para la base de datos ---
    // PostgreSQL no acepta strings vacíos "" para campos UUID o fechas.
    const dataToSubmit = {
      name: formData.name,
      description: formData.description || null,
      image_url: imageUrl || null,
      price: formData.price ? parseFloat(formData.price.toString()) : null,
      category_id: formData.category_id && formData.category_id !== "" ? formData.category_id : null,
      is_promotion: formData.is_promotion,
      is_active: formData.is_active,
      display_order: Number(formData.display_order) || 0,
      // Solo enviamos datos de promoción si el Switch está activo
      promotion_text: formData.is_promotion ? (formData.promotion_text || null) : null,
      promotion_start: formData.is_promotion && formData.promotion_start !== "" ? formData.promotion_start : null,
      promotion_end: formData.is_promotion && formData.promotion_end !== "" ? formData.promotion_end : null,
      seasonal_promotion_id: formData.is_promotion && formData.seasonal_promotion_id !== "" && formData.seasonal_promotion_id !== "none"
        ? formData.seasonal_promotion_id
        : null,
    }

    if (product) {
      const { error } = await supabase
        .from("products")
        .update(dataToSubmit)
        .eq("id", product.id)

      if (error) {
        toast.error(`Error al actualizar el producto: ${error.message}`)
        console.error("Error en Update:", error)
        setIsLoading(false)
        return
      }
      toast.success("Producto actualizado")
    } else {
      // Nota: Pasamos el objeto dentro de un array [dataToSubmit]
      const { error } = await supabase
        .from("products")
        .insert([dataToSubmit])

      if (error) {
        toast.error(`Error al crear el producto: ${error.message}`)
        console.error("Error en Insert detallado:", error)
        setIsLoading(false)
        return
      }
      toast.success("Producto creado exitosamente")
    }

    router.push("/admin/products")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Imagen del Producto</Label>
            <div className="flex flex-col gap-4">
              {previewUrl && (
                <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={formData.category_id || undefined}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Orden de Visualización</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Producto activo</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promoción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              id="is_promotion"
              checked={formData.is_promotion}
              onCheckedChange={(checked) => setFormData({ ...formData, is_promotion: checked })}
            />
            <Label htmlFor="is_promotion">Es promoción</Label>
          </div>

          {formData.is_promotion && (
            <>
              <div className="space-y-2">
                <Label htmlFor="seasonal_promotion">Promoción de Temporada (Opcional)</Label>
                <Select
                  value={formData.seasonal_promotion_id || "none"}
                  onValueChange={(value) => {
                    const promo = promotions.find(p => p.id === value)
                    setFormData({
                      ...formData,
                      seasonal_promotion_id: value === "none" ? "" : value,
                      promotion_start: promo ? promo.start_date : formData.promotion_start,
                      promotion_end: promo ? promo.end_date : formData.promotion_end
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar promoción..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna (Personalizada)</SelectItem>
                    {promotions && promotions.length > 0 && promotions.map((promo) => (
                      <SelectItem key={promo.id} value={promo.id}>
                        {promo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promotion_text">Texto de Promoción / Descuento</Label>
                <Input
                  id="promotion_text"
                  value={formData.promotion_text}
                  onChange={(e) => setFormData({ ...formData, promotion_text: e.target.value })}
                  placeholder="Ej: 20% OFF"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="promotion_start">Fecha Inicio</Label>
                  <Input
                    id="promotion_start"
                    type="date"
                    value={formData.promotion_start}
                    onChange={(e) => setFormData({ ...formData, promotion_start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promotion_end">Fecha Fin</Label>
                  <Input
                    id="promotion_end"
                    type="date"
                    value={formData.promotion_end}
                    onChange={(e) => setFormData({ ...formData, promotion_end: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || isUploading}>
          {isLoading || isUploading ? "Guardando..." : product ? "Actualizar" : "Crear Producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}