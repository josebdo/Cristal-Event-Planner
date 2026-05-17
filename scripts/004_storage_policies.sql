-- Políticas de seguridad (RLS) para el almacenamiento de archivos (Supabase Storage) en el bucket 'products'

-- 1. Permitir acceso de lectura público a todas las imágenes del bucket 'products'
DROP POLICY IF EXISTS "Acceso público de lectura a imágenes de productos" ON storage.objects;
CREATE POLICY "Acceso público de lectura a imágenes de productos" 
ON storage.objects FOR SELECT USING (bucket_id = 'products');

-- 2. Permitir a los usuarios autenticados (administradores/editores) subir nuevas imágenes
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir imágenes" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden subir imágenes" 
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');

-- 3. Permitir a los usuarios autenticados actualizar y reemplazar imágenes existentes
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar imágenes" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden actualizar imágenes" 
ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'products');

-- 4. Permitir a los usuarios autenticados eliminar imágenes
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar imágenes" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden eliminar imágenes" 
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'products');
