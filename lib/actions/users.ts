"use server"

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: 'Clave de servicio no configurada' }
    }

    // Create a Supabase client with the SERVICE ROLE key
    // This bypasses RLS and allows creating users without signing out the current admin
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return undefined
                },
                set(name: string, value: string, options: CookieOptions) {
                    // No need to set cookies for service role
                },
                remove(name: string, options: CookieOptions) {
                    // No need to remove cookies for service role
                },
            },
        }
    )

    const { data, error } = await supabase.auth.admin.createUser({
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

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return undefined
                },
                set(name: string, value: string, options: CookieOptions) {
                },
                remove(name: string, options: CookieOptions) {
                },
            },
        }
    )

    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error fetching users:', error)
        return { error: error.message, users: [] }
    }

    return { users }
}

export async function updateUserRole(userId: string, role: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: 'Clave de servicio no configurada' }
    }

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

    const { error } = await supabase.auth.admin.updateUserById(
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
