"use server"

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Clave de servicio o URL de Supabase no configuradas')
    }
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            cookies: {
                get(name: string) { return undefined },
                set(name: string, value: string, options: CookieOptions) { },
                remove(name: string, options: CookieOptions) { },
            },
        }
    )
}

async function getCurrentUserRole(supabaseAdmin: ReturnType<typeof getAdminClient>) {
    const supabaseStandard = await createClient()
    const { data: { user: currentUser } } = await supabaseStandard.auth.getUser()

    if (!currentUser) return { currentUser: null, role: null }

    let role = currentUser.user_metadata?.role

    if (!role) {
        try {
            const { data: dbUser } = await supabaseAdmin
                .from('users')
                .select('role')
                .eq('id', currentUser.id)
                .single()
            if (dbUser?.role) {
                role = dbUser.role
            }
        } catch (e) {
            console.error("Error fetching fallback role:", e)
        }
    }

    return { currentUser, role }
}

export async function createUser(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    let supabaseAdmin
    try {
        supabaseAdmin = getAdminClient()
    } catch (e: any) {
        return { error: e.message }
    }

    const { role: currentUserRole } = await getCurrentUserRole(supabaseAdmin)

    // Only superadmin can create superadmins
    if (role === 'superadmin' && currentUserRole !== 'superadmin') {
        return { error: 'No tienes permisos para crear un Super Admin' }
    }

    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { role },
        email_confirm: true, // Auto-confirm email
    })

    if (error) {
        console.error('Error creating user:', error)
        return { error: error.message }
    }

    if (authData?.user) {
        // Sync to public.users table immediately
        const { error: dbError } = await supabaseAdmin.from('users').upsert({
            id: authData.user.id,
            email: email,
            role: role,
            updated_at: new Date().toISOString(),
        })

        if (dbError) {
            console.error('Error syncing user to public.users:', dbError)
        }
    }

    revalidatePath('/admin/users')
    return { success: true }
}

export async function getUsers() {
    let supabaseAdmin
    try {
        supabaseAdmin = getAdminClient()
    } catch (e: any) {
        return { error: e.message, users: [] }
    }

    const { role: currentUserRole } = await getCurrentUserRole(supabaseAdmin)

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
        console.error('Error fetching users:', error)
        return { error: error.message, users: [] }
    }

    // Fetch from public.users to ensure perfect sync
    const { data: dbUsers } = await supabaseAdmin.from('users').select('id, role')
    const roleMap = new Map(dbUsers?.map((u) => [u.id, u.role]) || [])

    const mergedUsers = users.map((u) => {
        const metaRole = u.user_metadata?.role
        const dbRole = roleMap.get(u.id)
        const actualRole = metaRole || dbRole || 'editor'
        if (!u.user_metadata) u.user_metadata = {}
        if (u.user_metadata.role !== actualRole) {
            u.user_metadata.role = actualRole
        }
        return u
    })

    // FILTERING LOGIC
    let filteredUsers = mergedUsers

    if (currentUserRole === 'admin') {
        // Admin cannot see superadmins
        filteredUsers = mergedUsers.filter((u) => u.user_metadata?.role !== 'superadmin')
    } else if (currentUserRole !== 'superadmin') {
        // Editors or others shouldn't see anyone
        return { users: [] }
    }

    return { users: filteredUsers }
}

export async function updateUserRole(userId: string, role: string) {
    let supabaseAdmin
    try {
        supabaseAdmin = getAdminClient()
    } catch (e: any) {
        return { error: e.message }
    }

    const { role: currentUserRole } = await getCurrentUserRole(supabaseAdmin)

    // Only superadmin can assign superadmin role
    if (role === 'superadmin' && currentUserRole !== 'superadmin') {
        return { error: 'No tienes permisos para asignar el rol de Super Admin' }
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { role },
    })

    if (error) {
        console.error('Error updating user role:', error)
        return { error: error.message }
    }

    // Sync to public.users table
    const { error: dbError } = await supabaseAdmin
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)

    if (dbError) {
        console.error('Error syncing role to public.users:', dbError)
    }

    revalidatePath('/admin/users')
    return { success: true }
}
