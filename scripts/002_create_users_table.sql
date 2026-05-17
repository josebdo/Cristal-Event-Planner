-- Tabla de usuarios pública (respaldo y relación con auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'editor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para public.users
CREATE POLICY "Usuarios pueden ver su propio registro" 
  ON public.users FOR SELECT USING (auth.uid() = id);

-- Administradores y Superadmins pueden ver todos los registros
CREATE POLICY "Administradores pueden ver todos los usuarios" 
  ON public.users FOR SELECT USING (
    (SELECT auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin') OR
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'superadmin')
  );

-- Función y Trigger para sincronizar nuevos usuarios de auth.users a public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'editor')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador que se ejecuta al registrar un nuevo usuario en Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
