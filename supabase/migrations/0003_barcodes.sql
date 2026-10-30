-- Barcode scanning: a safe way for any signed-in user to attach a scanned barcode to an
-- existing catalog tin (products otherwise have no update policy). Barcodes are already
-- unique (products_barcode_unique in 0001).

create or replace function public.set_product_barcode(p_product_id uuid, p_barcode text)
returns boolean
language sql
security definer
set search_path = public
as $$
  with updated as (
    update public.products
       set barcode = p_barcode
     where id = p_product_id
       and barcode is null
       and p_barcode ~ '^[0-9]{8,14}$'
       and (status = 'approved' or created_by = auth.uid())
       and not exists (select 1 from public.products where barcode = p_barcode)
    returning 1
  )
  select exists (select 1 from updated);
$$;

revoke all on function public.set_product_barcode(uuid, text) from public, anon;
grant execute on function public.set_product_barcode(uuid, text) to authenticated;
