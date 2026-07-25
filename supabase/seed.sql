-- Sample data for local development. Run after schema.sql.
-- NOTE: app_users rows require a matching auth.users row (create real accounts
-- via Supabase Auth first, then update the UUIDs below to match).

insert into tenants (type, name, slug, reference_code, theme_config) values
  ('restaurant', 'Anadolu Sofrası', 'anadolu-sofrasi', 'RST8K2Q1',
    '{"primary": "#DC2626", "secondary": "#F59E0B", "background": "#FFFFFF", "text": "#1F2937", "logo": null}'),
  ('dopq', 'Mega Telefon', 'mega-telefon', 'DPQ4M9X7',
    '{"primary": "#3B82F6", "secondary": "#10B981", "background": "#FFFFFF", "text": "#1F2937", "logo": null}');

insert into menu_categories (tenant_id, name, sort_order)
select id, 'Ana Yemekler', 1 from tenants where slug = 'anadolu-sofrasi';

insert into menu_items (tenant_id, category_id, name, description, price)
select t.id, c.id, 'Adana Kebap', 'Acılı, közlenmiş biber ve domates ile', 320.00
from tenants t join menu_categories c on c.tenant_id = t.id
where t.slug = 'anadolu-sofrasi';

insert into phones (tenant_id, brand, model, ram_gb, storage_gb, price, condition, description)
select id, 'Apple', 'iPhone 17', 8, 256, 64999.00, 'new', 'Sıfır kutu, faturalı'
from tenants where slug = 'mega-telefon';

insert into phones (tenant_id, brand, model, ram_gb, storage_gb, price, condition, description)
select id, 'Apple', 'iPhone 16', 6, 128, 42999.00, 'used', 'İkinci el, temiz'
from tenants where slug = 'mega-telefon';
