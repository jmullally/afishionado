-- Starter catalog. Safe to re-run: existing brands are skipped.
-- Product names are a starting point; edit or add tins in the Supabase table editor.

insert into public.brands (name, country) values
  ('Ortiz', 'Spain'),
  ('José Gourmet', 'Portugal'),
  ('Fishwife', 'USA'),
  ('Patagonia Provisions', 'USA'),
  ('Matiz', 'Spain'),
  ('Conservas de Cambados', 'Spain'),
  ('Nuri', 'Portugal'),
  ('Minerva', 'Portugal'),
  ('Ramón Peña', 'Spain'),
  ('King Oscar', 'Norway'),
  ('Season', 'USA'),
  ('Wild Planet', 'USA'),
  ('Crown Prince', 'USA'),
  ('Cole''s', 'USA'),
  ('Scout', 'Canada'),
  ('Tonnino', 'Italy'),
  ('Ati Manel', 'Portugal'),
  ('Espinaler', 'Spain')
on conflict do nothing;

insert into public.products (brand_id, name, species, packing)
select b.id, p.name, p.species, p.packing
from (values
  ('Ortiz', 'Bonito del Norte', 'tuna', 'olive oil'),
  ('Ortiz', 'Sardines in Olive Oil', 'sardines', 'olive oil'),
  ('Ortiz', 'Anchovies in Olive Oil', 'anchovies', 'olive oil'),
  ('Ortiz', 'Mackerel Fillets in Olive Oil', 'mackerel', 'olive oil'),
  ('José Gourmet', 'Sardines in Olive Oil', 'sardines', 'olive oil'),
  ('José Gourmet', 'Spiced Small Sardines', 'sardines', 'spicy'),
  ('José Gourmet', 'Mackerel Fillets in Olive Oil', 'mackerel', 'olive oil'),
  ('José Gourmet', 'Squid in Ink', 'squid', 'ink'),
  ('Fishwife', 'Smoked Atlantic Salmon', 'salmon', 'olive oil'),
  ('Fishwife', 'Smoked Rainbow Trout', 'trout', 'olive oil'),
  ('Fishwife', 'Slow-Smoked Sardines with Chili Crisp', 'sardines', 'spicy'),
  ('Patagonia Provisions', 'Mussels in Lemon Herb Olive Oil', 'mussels', 'lemon'),
  ('Patagonia Provisions', 'Mussels in Savory Escabeche', 'mussels', 'escabeche'),
  ('Patagonia Provisions', 'Smoked Mussels', 'mussels', 'smoked'),
  ('Matiz', 'Sardines in Olive Oil', 'sardines', 'olive oil'),
  ('Matiz', 'Mussels in Escabeche', 'mussels', 'escabeche'),
  ('Matiz', 'Octopus in Olive Oil', 'octopus', 'olive oil'),
  ('Conservas de Cambados', 'Cockles in Brine', 'cockles', 'brine'),
  ('Conservas de Cambados', 'Razor Clams in Brine', 'clams', 'brine'),
  ('Conservas de Cambados', 'Sardines in Olive Oil', 'sardines', 'olive oil'),
  ('Nuri', 'Sardines in Olive Oil', 'sardines', 'olive oil'),
  ('Nuri', 'Spiced Sardines in Olive Oil', 'sardines', 'spicy'),
  ('Minerva', 'Mackerel Fillets in Olive Oil', 'mackerel', 'olive oil'),
  ('Minerva', 'Sardines in Tomato Sauce', 'sardines', 'tomato sauce'),
  ('Ramón Peña', 'Small Sardines in Olive Oil', 'sardines', 'olive oil'),
  ('Ramón Peña', 'Cockles in Brine', 'cockles', 'brine'),
  ('King Oscar', 'Brisling Sardines in Extra Virgin Olive Oil', 'sardines', 'olive oil'),
  ('King Oscar', 'Mackerel in Tomato Sauce', 'mackerel', 'tomato sauce'),
  ('Season', 'Skinless & Boneless Sardines in Olive Oil', 'sardines', 'olive oil'),
  ('Wild Planet', 'Wild Albacore Tuna', 'tuna', 'water'),
  ('Wild Planet', 'Wild Sardines in Extra Virgin Olive Oil', 'sardines', 'olive oil'),
  ('Crown Prince', 'Smoked Oysters in Olive Oil', 'oysters', 'smoked'),
  ('Cole''s', 'Smoked Rainbow Trout', 'trout', 'olive oil'),
  ('Cole''s', 'Wild Sardines in Olive Oil', 'sardines', 'olive oil'),
  ('Scout', 'PEI Mussels in Wine', 'mussels', 'other'),
  ('Scout', 'Wild Atlantic Lobster', 'other', 'other'),
  ('Tonnino', 'Yellowfin Tuna Fillets in Olive Oil', 'tuna', 'olive oil'),
  ('Ati Manel', 'Sardines in Olive Oil', 'sardines', 'olive oil'),
  ('Espinaler', 'Cockles', 'cockles', 'brine'),
  ('Espinaler', 'Mussels in Pickled Sauce', 'mussels', 'escabeche')
) as p (brand, name, species, packing)
join public.brands b on lower(b.name) = lower(p.brand)
where not exists (
  select 1 from public.products x where x.brand_id = b.id and lower(x.name) = lower(p.name)
);
