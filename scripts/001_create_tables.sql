-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_promotion BOOLEAN DEFAULT FALSE,
  promotion_text TEXT,
  promotion_start DATE,
  promotion_end DATE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seasonal promotions table
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

-- Site settings table (for WhatsApp number, about text, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (anyone can view products)
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for seasonal_promotions" ON seasonal_promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for site_settings" ON site_settings FOR SELECT USING (true);

-- Authenticated users can manage all data (for admin panel)
CREATE POLICY "Authenticated users can insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete categories" ON categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select all products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert seasonal_promotions" ON seasonal_promotions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update seasonal_promotions" ON seasonal_promotions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete seasonal_promotions" ON seasonal_promotions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert site_settings" ON site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update site_settings" ON site_settings FOR UPDATE TO authenticated USING (true);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Arreglos Florales', 'arreglos-florales', 'Hermosos arreglos florales para toda ocasión'),
  ('Bandejas de Desayuno', 'bandejas-desayuno', 'Bandejas personalizadas para sorprender'),
  ('Bordados Personalizados', 'bordados-personalizados', 'T-shirts y productos con bordados únicos')
ON CONFLICT (slug) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('whatsapp_number', ''),
  ('about_title', 'Sobre Nosotros'),
  ('about_text', 'Creamos arreglos únicos y personalizados con amor y dedicación para hacer de cada momento algo especial.'),
  ('hero_title', 'Regalos que Emocionan'),
  ('hero_subtitle', 'Arreglos florales, bandejas de desayuno y bordados personalizados para cada ocasión especial')
ON CONFLICT (key) DO NOTHING;
