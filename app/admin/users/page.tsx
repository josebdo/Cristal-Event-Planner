import { Suspense } from "react"
import { getUsers } from "@/lib/actions/users"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreateUserModal } from "@/components/admin/users/create-user-modal"
import { EditUserModal } from "@/components/admin/users/edit-user-modal"
import { UserRole } from "@/lib/types"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserCog } from "lucide-react"

export default async function UsersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userRole = user?.user_metadata?.role

    if (!userRole && user) {
        // Fallback: Check in the public.users table if not in metadata
        const { data: dbUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        userRole = dbUser?.role
    }

    if (userRole !== 'admin' && userRole !== 'superadmin') {
        redirect('/admin')
    }

    const { users, error } = await getUsers()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-3xl font-bold tracking-tight">Usuarios</h1>
                <CreateUserModal currentUserRole={userRole} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>
                        Administra los usuarios que tienen acceso al panel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="text-red-500">Error al cargar usuarios: {error}</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Último Acceso</TableHead>
                                    <TableHead>Creado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.user_metadata?.role === 'admin' ? "default" : "secondary"}>
                                                {user.user_metadata?.role || 'editor'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.last_sign_in_at
                                                ? new Date(user.last_sign_in_at).toLocaleDateString()
                                                : 'Nunca'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <EditUserModal
                                                userId={user.id}
                                                currentRole={(user.user_metadata?.role || 'editor') as UserRole}
                                                userEmail={user.email || ''}
                                                currentUserRole={userRole}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
