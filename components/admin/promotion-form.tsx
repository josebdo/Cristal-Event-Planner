"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { SeasonalPromotion, Product } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"

interface PromotionFormProps {
  promotion?: SeasonalPromotion
  products?: Product[]
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function PromotionForm({ promotion, products = [] }: PromotionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(promotion?.banner_image_url || null)

  // Products selected for this promotion
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(products.filter(p => p.seasonal_promotion_id === promotion?.id).map(p => p.id))
  )
  const [productDiscounts, setProductDiscounts] = useState<Record<string, string>>(
    products.reduce((acc, p) => {
      if (p.seasonal_promotion_id === promotion?.id) {
        acc[p.id] = p.promotion_text || ""
      }
      return acc
    }, {} as Record<string, string>)
  )

  const [formData, setFormData] = useState({
    name: promotion?.name || "",
    slug: promotion?.slug || "",
    description: promotion?.description || "",
    banner_image_url: promotion?.banner_image_url || "",
    start_date: promotion?.start_date || "",
    end_date: promotion?.end_date || "",
    is_active: promotion?.is_active ?? true,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleProductToggle = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const handleDiscountChange = (productId: string, value: string) => {
    setProductDiscounts(prev => ({ ...prev, [productId]: value }))
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: promotion ? formData.slug : generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    let bannerUrl = formData.banner_image_url

    if (selectedImage) {
      setIsUploading(true)
      const fileExt = selectedImage.name.split(".").pop()
      const fileName = `promo-${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, selectedImage)

      if (uploadError) {
        toast.error("Error al subir la imagen")
        setIsUploading(false)
        setIsLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(fileName)

      bannerUrl = publicUrl
      setIsUploading(false)
    }

    const dataToSave = { ...formData, banner_image_url: bannerUrl }

    let promotionId = promotion?.id

    if (promotion) {
      const { error } = await supabase
        .from("seasonal_promotions")
        .update(dataToSave)
        .eq("id", promotion.id)

      if (error) {
        toast.error("Error al actualizar la promoción")
        setIsLoading(false)
        return
      }
      toast.success("Promoción actualizada")
    } else {
      const { data: newPromo, error } = await supabase
        .from("seasonal_promotions")
        .insert(dataToSave)
        .select()
        .single()

      if (error) {
        if (error.code === "23505") {
          toast.error("Ya existe una promoción con ese slug")
        } else {
          toast.error("Error al crear la promoción")
        }
        setIsLoading(false)
        return
      }

      if (newPromo) {
        promotionId = newPromo.id
      }
      toast.success("Promoción creada")
    }

    // Update Products Logic
    // 1. Remove this promotion from products that are no longer selected
    // Note: This matches products that currently have this promo ID but are NOT in selectedProducts
    if (promotionId) {
      // Reset products that were removed
      // We'd ideally need a list of original products, but for now we can rely on what we know
      // Or simpler: Update ALL selected products to have this ID.
      // And potentially we should set NULL to products that had it but were removed.
      // For simplicity in this step, let's just UPDATE selected products. 
      // A more robust solution would handle removals.

      // Handle removals: find products in 'products' prop that are NOT in 'selectedProducts' set but HAD this promo ID
      const productsToRemove = products.filter(p => p.seasonal_promotion_id === promotionId && !selectedProducts.has(p.id))

      if (productsToRemove.length > 0) {
        await supabase.from("products").update({
          seasonal_promotion_id: null,
          is_promotion: false,
          promotion_text: null
        }).in("id", productsToRemove.map(p => p.id))
      }

      // Handle updates/additions
      const updates = Array.from(selectedProducts).map(productId => {
        return supabase.from("products").update({
          seasonal_promotion_id: promotionId,
          is_promotion: true,
          promotion_text: productDiscounts[productId] || formData.name
        }).eq("id", productId)
      })

      await Promise.all(updates)
    }

    router.push("/admin/promotions")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información de la Promoción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: San Valentín 2026"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Describe la promoción..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner_image">Imagen Banner</Label>
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
                id="banner_image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha Inicio *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha Fin *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Promoción activa</Label>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-lg">Productos en Promoción</h3>
            <p className="text-sm text-muted-foreground">
              Selecciona los productos que pertenecen a esta promoción y asigna su descuento.
            </p>

            <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
              {products.map((product) => (
                <div key={product.id} className="flex items-start space-x-3 p-3 border rounded-md">
                  <Checkbox
                    id={`prod-${product.id}`}
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => handleProductToggle(product.id)}
                  />
                  <div className="grid gap-1.5 flex-1">
                    <Label htmlFor={`prod-${product.id}`} className="font-semibold cursor-pointer">
                      {product.name}
                    </Label>
                    {selectedProducts.has(product.id) && (
                      <div className="mt-2">
                        <Label htmlFor={`discount-${product.id}`} className="text-xs">Descuento aplicado</Label>
                        <Input
                          id={`discount-${product.id}`}
                          value={productDiscounts[product.id] || ""}
                          onChange={(e) => handleDiscountChange(product.id, e.target.value)}
                          placeholder="Ej: 20% OFF o $10.00"
                          className="h-8 text-sm mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || isUploading}>
          {isLoading || isUploading ? "Guardando..." : promotion ? "Actualizar" : "Crear Promoción"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
