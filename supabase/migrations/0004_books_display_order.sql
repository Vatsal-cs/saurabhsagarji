-- Lets an admin manually control the order books appear in on the public
-- site (previously always sorted by published_at) via a drag-to-reorder
-- grid in the admin books page.
alter table public.books
  add column if not exists display_order integer not null default 0;

create index if not exists books_display_order_idx on public.books(display_order);

-- Backfill existing rows with a stable order matching the previous default
-- sort (most recently published first), so nothing visibly reshuffles on
-- the public site until an admin actually reorders.
with ordered as (
  select id, row_number() over (order by published_at desc nulls last, created_at desc) - 1 as rn
  from public.books
)
update public.books
set display_order = ordered.rn
from ordered
where books.id = ordered.id;
