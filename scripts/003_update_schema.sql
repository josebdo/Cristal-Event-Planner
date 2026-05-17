-- 1. Crear tabla seasonal_promotions si no existe
CREATE TABLE IF NOT EXISTS seasonal_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  banner_image_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla site_settings si no existe
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Añadir columnas faltantes a la tabla products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS promotion_text TEXT,
  ADD COLUMN IF NOT EXISTS promotion_start DATE,
  ADD COLUMN IF NOT EXISTS promotion_end DATE,
  ADD COLUMN IF NOT EXISTS seasonal_promotion_id UUID REFERENCES seasonal_promotions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- 4. Habilitar RLS y crear políticas para seasonal_promotions y site_settings
ALTER TABLE seasonal_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para seasonal_promotions
DROP POLICY IF EXISTS "Public read access for seasonal_promotions" ON seasonal_promotions;
CREATE POLICY "Public read access for seasonal_promotions" ON seasonal_promotions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users manage seasonal_promotions" ON seasonal_promotions;
CREATE POLICY "Authenticated users manage seasonal_promotions" ON seasonal_promotions FOR ALL TO authenticated USING (true);

-- Políticas para site_settings
DROP POLICY IF EXISTS "Public read access for site_settings" ON site_settings;
CREATE POLICY "Public read access for site_settings" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users manage site_settings" ON site_settings;
CREATE POLICY "Authenticated users manage site_settings" ON site_settings FOR ALL TO authenticated USING (true);

-- Políticas para products y categories por si faltan
DROP POLICY IF EXISTS "Public read access for products" ON products;
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users manage products" ON products;
CREATE POLICY "Authenticated users manage products" ON products FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for categories" ON categories;
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users manage categories" ON categories;
CREATE POLICY "Authenticated users manage categories" ON categories FOR ALL TO authenticated USING (true);

-- 5. Insertar datos por defecto en site_settings
INSERT INTO site_settings (key, value) VALUES
  ('whatsapp_number', ''),
  ('about_title', 'Sobre Nosotros'),
  ('about_text', 'Creamos arreglos únicos y personalizados con amor y dedicación para hacer de cada momento algo especial.'),
  ('hero_title', 'Regalos que Emocionan'),
  ('hero_subtitle', 'Arreglos florales, bandejas de desayuno y bordados personalizados para cada ocasión especial')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE site_settings.value IS NULL OR site_settings.value = '';
