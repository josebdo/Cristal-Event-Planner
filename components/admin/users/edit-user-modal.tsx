"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Pencil } from "lucide-react"
import { updateUserRole } from "@/lib/actions/users"
import { useToast } from "@/hooks/use-toast"
import { UserRole } from "@/lib/types"

interface EditUserModalProps {
    userId: string
    currentRole: UserRole
    userEmail: string
}

export function EditUserModal({ userId, currentRole, userEmail }: EditUserModalProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [role, setRole] = useState<UserRole>(currentRole)
    const { toast } = useToast()

    const handleUpdate = async () => {
        if (role === currentRole) {
            setOpen(false)
            return
        }

        setIsLoading(true)

        try {
            const result = await updateUserRole(userId, role)

            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Éxito",
                    description: "Rol actualizado correctamente",
                })
                setOpen(false)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Ocurrió un error inesperado",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="size-4" />
                    <span className="sr-only">Editar Rol</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                        Cambiar el rol para {userEmail}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select
                            value={role}
                            onValueChange={(value) => setRole(value as UserRole)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="editor">Editor (Sin acceso a usuarios)</SelectItem>
                                <SelectItem value="admin">Administrador (Acceso total)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdate} disabled={isLoading}>
                            {isLoading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
