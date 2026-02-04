"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { MessageCircle } from "lucide-react"
import type { Product } from "@/lib/types"

interface ProductModalProps {
    product: Product | null
    isOpen: boolean
    onClose: () => void
    whatsappNumber?: string
}

export function ProductModal({ product, isOpen, onClose, whatsappNumber = "" }: ProductModalProps) {
    if (!product) return null

    // Format price
    const formattedPrice = product.price
        ? new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(product.price)
        : "Precio a consultar"

    const handleBuyClick = () => {
        // Determine number (default or global setting if passed, otherwise none)
        // If no number is configured, maybe show a warning or default placeholder?
        // Let's assume passed prop has it, or we fallback.
        const phone = whatsappNumber.replace(/\D/g, "") || "18290000000" // Fallback or strict requirement

        const message = `Hola! Me interesa el producto *${product.name}*` +
            (product.price ? ` con precio *${formattedPrice}*` : "") +
            `. Me gustaría más información.`

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border-0 shadow-2xl rounded-xl">
                <div className="flex flex-col md:flex-row h-full">
                    {/* Image Side */}
                    <div className="w-full md:w-1/2 relative h-[250px] md:h-auto bg-muted">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <span className="font-serif text-5xl opacity-20">D</span>
                            </div>
                        )}
                        {product.is_promotion && (
                            <Badge className="absolute top-4 left-4 z-10">
                                {product.promotion_text || "En Oferta"}
                            </Badge>
                        )}
                    </div>

                    {/* Content Side */}
                    <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                        <div>
                            <DialogHeader className="mb-4 text-left">
                                <DialogTitle className="font-serif text-2xl font-bold mb-2 leading-tight">
                                    {product.name}
                                </DialogTitle>
                                {product.categories && (
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                        {product.categories.name}
                                    </span>
                                )}
                            </DialogHeader>

                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {product.description || "Sin descripción disponible para este detalle único."}
                                </p>

                                <div className="flex items-baseline gap-2 mt-4">
                                    <span className="text-xl font-bold text-primary">
                                        {formattedPrice}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button onClick={handleBuyClick} className="w-full gap-2 rounded-full font-medium" size="lg">
                                <MessageCircle className="w-5 h-5" />
                                Comprar por WhatsApp
                            </Button>
                            <p className="text-center text-[10px] text-muted-foreground mt-3">
                                Serás redirigido a WhatsApp para coordinar tu pedido.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
