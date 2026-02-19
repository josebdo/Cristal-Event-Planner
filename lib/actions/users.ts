"use server"

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createUser(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    // Verify permissions
    const supabaseStandard = await createClient()
    const { data: { user: currentUser } } = await supabaseStandard.auth.getUser()

    // Check metadata role, fallback to DB if needed
    let currentUserRole = currentUser?.user_metadata?.role
    if (!currentUserRole && currentUser) {
        try {
            // We need a temporary service client to check the DB role if metadata is missing
            // because the standard client might not have permissions to read public.users depending on RLS
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                const tempClient = createServerClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!,
                    {
                        cookies: {
                            get(name: string) { return undefined },
                            set(name: string, value: string, options: CookieOptions) { },
                            remove(name: string, options: CookieOptions) { },
                        },
                    }
                )
                const { data: dbUser } = await tempClient
                    .from('users')
                    .select('role')
                    .eq('id', currentUser.id)
                    .single()
                currentUserRole = dbUser?.role
            }
        } catch (e) {
            console.error("Error fetching fallback role:", e)
        }
    }

    // Only superadmin can create superadmins
    if (role === 'superadmin' && currentUserRole !== 'superadmin') {
        return { error: 'No tienes permisos para crear un Super Admin' }
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: 'Clave de servicio no configurada' }
    }

    // Create a Supabase client with the SERVICE ROLE key
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) { return undefined },
                set(name: string, value: string, options: CookieOptions) { },
                remove(name: string, options: CookieOptions) { },
            },
        }
    )

    const { error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { role },
        email_confirm: true, // Auto-confirm email
    })

    if (error) {
        console.error('Error creating user:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
}

export async function getUsers() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: 'Clave de servicio no configurada', users: [] }
    }

    // 1. Get current user to check permissions
    const supabaseStandard = await createClient()
    const { data: { user: currentUser } } = await supabaseStandard.auth.getUser()

    let currentUserRole = currentUser?.user_metadata?.role

    // Fallback: Check role in DB if metadata is missing
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) { return undefined },
                set(name: string, value: string, options: CookieOptions) { },
                remove(name: string, options: CookieOptions) { },
            },
        }
    )

    if (!currentUserRole && currentUser) {
        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', currentUser.id)
            .single()
        currentUserRole = dbUser?.role
    }

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
        console.error('Error fetching users:', error)
        return { error: error.message, users: [] }
    }

    // FILTERING LOGIC
    let filteredUsers = users

    if (currentUserRole === 'admin') {
        // Admin cannot see superadmins
        filteredUsers = users.filter(u => u.user_metadata?.role !== 'superadmin')
    } else if (currentUserRole !== 'superadmin') {
        // Editors or others shouldn't see anyone
        return { users: [] }
    }

    return { users: filteredUsers }
}

export async function updateUserRole(userId: string, role: string) {
    // Verify permissions
    const supabaseStandard = await createClient()
    const { data: { user: currentUser } } = await supabaseStandard.auth.getUser()

    // Check role/fallback
    let currentUserRole = currentUser?.user_metadata?.role

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: 'Clave de servicio no configurada' }
    }

    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) { return undefined },
                set(name: string, value: string, options: CookieOptions) { },
                remove(name: string, options: CookieOptions) { },
            },
        }
    )

    if (!currentUserRole && currentUser) {
        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', currentUser.id)
            .single()
        currentUserRole = dbUser?.role
    }

    // Only superadmin can assign superadmin role
    if (role === 'superadmin' && currentUserRole !== 'superadmin') {
        return { error: 'No tienes permisos para asignar el rol de Super Admin' }
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { user_metadata: { role } }
    )

    if (error) {
        console.error('Error updating user role:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
}
