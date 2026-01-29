drop extension if exists "pg_net";

drop policy "Authenticated users can insert memberships" on "public"."memberships";

drop policy "Hosts can view their members" on "public"."memberships";

drop policy "Members can update their own memberships" on "public"."memberships";

alter table "public"."memberships" drop constraint "memberships_status_check";

drop function if exists "public"."add_hosts_to_own_clubs"();

drop index if exists "public"."memberships_status_idx";


  create table "public"."cart_items" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "cart_id" uuid,
    "user_name" text not null,
    "item_name" text not null,
    "item_price" numeric(10,2),
    "is_price_estimate" boolean default false,
    "quantity" integer default 1,
    "notes" text
      );


alter table "public"."cart_items" enable row level security;


  create table "public"."carts" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "menu_id" uuid,
    "tip_percentage" integer default 18
      );


alter table "public"."carts" enable row level security;


  create table "public"."event_attendees" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "status" text default 'registered'::text,
    "registered_at" timestamp with time zone default now()
      );


alter table "public"."event_attendees" enable row level security;


  create table "public"."events" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "event_date" timestamp with time zone not null,
    "end_date" timestamp with time zone,
    "location" text,
    "host_id" uuid not null,
    "max_attendees" integer,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."events" enable row level security;


  create table "public"."menu_corrections" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "menu_id" uuid,
    "item_category" text not null,
    "item_name_original" text not null,
    "field_corrected" text not null,
    "original_value" text,
    "corrected_value" text,
    "correction_count" integer default 1,
    "notes" text
      );


alter table "public"."menu_corrections" enable row level security;


  create table "public"."menus" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "pdf_url" text,
    "restaurant_name" text not null,
    "location_city" text,
    "location_state" text,
    "tax_rate" numeric(5,4) default 0.0,
    "items" jsonb not null default '[]'::jsonb
      );


alter table "public"."menus" enable row level security;


  create table "public"."wines" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "vineyard" text,
    "vintage" integer,
    "varietal" text,
    "region" text,
    "description" text,
    "tasting_notes" text,
    "image_url" text,
    "price" numeric(10,2),
    "is_featured" boolean default false,
    "featured_at" timestamp with time zone,
    "host_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."wines" enable row level security;

alter table "public"."memberships" add column "created_at" timestamp with time zone default now();

alter table "public"."memberships" alter column "status" set default 'active'::text;

alter table "public"."memberships" alter column "status" set data type text using "status"::text;

CREATE UNIQUE INDEX cart_items_pkey ON public.cart_items USING btree (id);

CREATE UNIQUE INDEX carts_pkey ON public.carts USING btree (id);

CREATE INDEX event_attendees_event_id_idx ON public.event_attendees USING btree (event_id);

CREATE UNIQUE INDEX event_attendees_event_id_user_id_key ON public.event_attendees USING btree (event_id, user_id);

CREATE UNIQUE INDEX event_attendees_pkey ON public.event_attendees USING btree (id);

CREATE INDEX event_attendees_user_id_idx ON public.event_attendees USING btree (user_id);

CREATE INDEX events_date_idx ON public.events USING btree (event_date);

CREATE INDEX events_host_id_idx ON public.events USING btree (host_id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE INDEX idx_cart_items_cart_id ON public.cart_items USING btree (cart_id);

CREATE INDEX idx_carts_menu_id ON public.carts USING btree (menu_id);

CREATE INDEX idx_menu_corrections_created_at ON public.menu_corrections USING btree (created_at);

CREATE INDEX idx_menu_corrections_field ON public.menu_corrections USING btree (field_corrected);

CREATE INDEX idx_menu_corrections_menu_id ON public.menu_corrections USING btree (menu_id);

CREATE UNIQUE INDEX menu_corrections_pkey ON public.menu_corrections USING btree (id);

CREATE UNIQUE INDEX menus_pkey ON public.menus USING btree (id);

CREATE INDEX wines_featured_idx ON public.wines USING btree (is_featured, featured_at);

CREATE INDEX wines_host_id_idx ON public.wines USING btree (host_id);

CREATE UNIQUE INDEX wines_pkey ON public.wines USING btree (id);

alter table "public"."cart_items" add constraint "cart_items_pkey" PRIMARY KEY using index "cart_items_pkey";

alter table "public"."carts" add constraint "carts_pkey" PRIMARY KEY using index "carts_pkey";

alter table "public"."event_attendees" add constraint "event_attendees_pkey" PRIMARY KEY using index "event_attendees_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."menu_corrections" add constraint "menu_corrections_pkey" PRIMARY KEY using index "menu_corrections_pkey";

alter table "public"."menus" add constraint "menus_pkey" PRIMARY KEY using index "menus_pkey";

alter table "public"."wines" add constraint "wines_pkey" PRIMARY KEY using index "wines_pkey";

alter table "public"."cart_items" add constraint "cart_items_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE not valid;

alter table "public"."cart_items" validate constraint "cart_items_cart_id_fkey";

alter table "public"."carts" add constraint "carts_menu_id_fkey" FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE not valid;

alter table "public"."carts" validate constraint "carts_menu_id_fkey";

alter table "public"."event_attendees" add constraint "event_attendees_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE not valid;

alter table "public"."event_attendees" validate constraint "event_attendees_event_id_fkey";

alter table "public"."event_attendees" add constraint "event_attendees_event_id_user_id_key" UNIQUE using index "event_attendees_event_id_user_id_key";

alter table "public"."event_attendees" add constraint "event_attendees_status_check" CHECK ((status = ANY (ARRAY['registered'::text, 'attended'::text, 'cancelled'::text]))) not valid;

alter table "public"."event_attendees" validate constraint "event_attendees_status_check";

alter table "public"."event_attendees" add constraint "event_attendees_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."event_attendees" validate constraint "event_attendees_user_id_fkey";

alter table "public"."events" add constraint "events_host_id_fkey" FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_host_id_fkey";

alter table "public"."menu_corrections" add constraint "menu_corrections_menu_id_fkey" FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE not valid;

alter table "public"."menu_corrections" validate constraint "menu_corrections_menu_id_fkey";

alter table "public"."wines" add constraint "wines_host_id_fkey" FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."wines" validate constraint "wines_host_id_fkey";

alter table "public"."memberships" add constraint "memberships_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text]))) not valid;

alter table "public"."memberships" validate constraint "memberships_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
  -- Haversine formula for great-circle distance in miles
  RETURN 3959 * ACOS(
    COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
    COS(RADIANS(lon2) - RADIANS(lon1)) +
    SIN(RADIANS(lat1)) * SIN(RADIANS(lat2))
  );
END;
$function$
;

grant delete on table "public"."cart_items" to "anon";

grant insert on table "public"."cart_items" to "anon";

grant references on table "public"."cart_items" to "anon";

grant select on table "public"."cart_items" to "anon";

grant trigger on table "public"."cart_items" to "anon";

grant truncate on table "public"."cart_items" to "anon";

grant update on table "public"."cart_items" to "anon";

grant delete on table "public"."cart_items" to "authenticated";

grant insert on table "public"."cart_items" to "authenticated";

grant references on table "public"."cart_items" to "authenticated";

grant select on table "public"."cart_items" to "authenticated";

grant trigger on table "public"."cart_items" to "authenticated";

grant truncate on table "public"."cart_items" to "authenticated";

grant update on table "public"."cart_items" to "authenticated";

grant delete on table "public"."cart_items" to "service_role";

grant insert on table "public"."cart_items" to "service_role";

grant references on table "public"."cart_items" to "service_role";

grant select on table "public"."cart_items" to "service_role";

grant trigger on table "public"."cart_items" to "service_role";

grant truncate on table "public"."cart_items" to "service_role";

grant update on table "public"."cart_items" to "service_role";

grant delete on table "public"."carts" to "anon";

grant insert on table "public"."carts" to "anon";

grant references on table "public"."carts" to "anon";

grant select on table "public"."carts" to "anon";

grant trigger on table "public"."carts" to "anon";

grant truncate on table "public"."carts" to "anon";

grant update on table "public"."carts" to "anon";

grant delete on table "public"."carts" to "authenticated";

grant insert on table "public"."carts" to "authenticated";

grant references on table "public"."carts" to "authenticated";

grant select on table "public"."carts" to "authenticated";

grant trigger on table "public"."carts" to "authenticated";

grant truncate on table "public"."carts" to "authenticated";

grant update on table "public"."carts" to "authenticated";

grant delete on table "public"."carts" to "service_role";

grant insert on table "public"."carts" to "service_role";

grant references on table "public"."carts" to "service_role";

grant select on table "public"."carts" to "service_role";

grant trigger on table "public"."carts" to "service_role";

grant truncate on table "public"."carts" to "service_role";

grant update on table "public"."carts" to "service_role";

grant delete on table "public"."event_attendees" to "anon";

grant insert on table "public"."event_attendees" to "anon";

grant references on table "public"."event_attendees" to "anon";

grant select on table "public"."event_attendees" to "anon";

grant trigger on table "public"."event_attendees" to "anon";

grant truncate on table "public"."event_attendees" to "anon";

grant update on table "public"."event_attendees" to "anon";

grant delete on table "public"."event_attendees" to "authenticated";

grant insert on table "public"."event_attendees" to "authenticated";

grant references on table "public"."event_attendees" to "authenticated";

grant select on table "public"."event_attendees" to "authenticated";

grant trigger on table "public"."event_attendees" to "authenticated";

grant truncate on table "public"."event_attendees" to "authenticated";

grant update on table "public"."event_attendees" to "authenticated";

grant delete on table "public"."event_attendees" to "service_role";

grant insert on table "public"."event_attendees" to "service_role";

grant references on table "public"."event_attendees" to "service_role";

grant select on table "public"."event_attendees" to "service_role";

grant trigger on table "public"."event_attendees" to "service_role";

grant truncate on table "public"."event_attendees" to "service_role";

grant update on table "public"."event_attendees" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."menu_corrections" to "anon";

grant insert on table "public"."menu_corrections" to "anon";

grant references on table "public"."menu_corrections" to "anon";

grant select on table "public"."menu_corrections" to "anon";

grant trigger on table "public"."menu_corrections" to "anon";

grant truncate on table "public"."menu_corrections" to "anon";

grant update on table "public"."menu_corrections" to "anon";

grant delete on table "public"."menu_corrections" to "authenticated";

grant insert on table "public"."menu_corrections" to "authenticated";

grant references on table "public"."menu_corrections" to "authenticated";

grant select on table "public"."menu_corrections" to "authenticated";

grant trigger on table "public"."menu_corrections" to "authenticated";

grant truncate on table "public"."menu_corrections" to "authenticated";

grant update on table "public"."menu_corrections" to "authenticated";

grant delete on table "public"."menu_corrections" to "service_role";

grant insert on table "public"."menu_corrections" to "service_role";

grant references on table "public"."menu_corrections" to "service_role";

grant select on table "public"."menu_corrections" to "service_role";

grant trigger on table "public"."menu_corrections" to "service_role";

grant truncate on table "public"."menu_corrections" to "service_role";

grant update on table "public"."menu_corrections" to "service_role";

grant delete on table "public"."menus" to "anon";

grant insert on table "public"."menus" to "anon";

grant references on table "public"."menus" to "anon";

grant select on table "public"."menus" to "anon";

grant trigger on table "public"."menus" to "anon";

grant truncate on table "public"."menus" to "anon";

grant update on table "public"."menus" to "anon";

grant delete on table "public"."menus" to "authenticated";

grant insert on table "public"."menus" to "authenticated";

grant references on table "public"."menus" to "authenticated";

grant select on table "public"."menus" to "authenticated";

grant trigger on table "public"."menus" to "authenticated";

grant truncate on table "public"."menus" to "authenticated";

grant update on table "public"."menus" to "authenticated";

grant delete on table "public"."menus" to "service_role";

grant insert on table "public"."menus" to "service_role";

grant references on table "public"."menus" to "service_role";

grant select on table "public"."menus" to "service_role";

grant trigger on table "public"."menus" to "service_role";

grant truncate on table "public"."menus" to "service_role";

grant update on table "public"."menus" to "service_role";

grant delete on table "public"."wines" to "anon";

grant insert on table "public"."wines" to "anon";

grant references on table "public"."wines" to "anon";

grant select on table "public"."wines" to "anon";

grant trigger on table "public"."wines" to "anon";

grant truncate on table "public"."wines" to "anon";

grant update on table "public"."wines" to "anon";

grant delete on table "public"."wines" to "authenticated";

grant insert on table "public"."wines" to "authenticated";

grant references on table "public"."wines" to "authenticated";

grant select on table "public"."wines" to "authenticated";

grant trigger on table "public"."wines" to "authenticated";

grant truncate on table "public"."wines" to "authenticated";

grant update on table "public"."wines" to "authenticated";

grant delete on table "public"."wines" to "service_role";

grant insert on table "public"."wines" to "service_role";

grant references on table "public"."wines" to "service_role";

grant select on table "public"."wines" to "service_role";

grant trigger on table "public"."wines" to "service_role";

grant truncate on table "public"."wines" to "service_role";

grant update on table "public"."wines" to "service_role";


  create policy "Allow public delete cart_items"
  on "public"."cart_items"
  as permissive
  for delete
  to public
using (true);



  create policy "Allow public insert cart_items"
  on "public"."cart_items"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow public read cart_items"
  on "public"."cart_items"
  as permissive
  for select
  to public
using (true);



  create policy "Allow public update cart_items"
  on "public"."cart_items"
  as permissive
  for update
  to public
using (true);



  create policy "Allow public insert carts"
  on "public"."carts"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow public read carts"
  on "public"."carts"
  as permissive
  for select
  to public
using (true);



  create policy "Allow public update carts"
  on "public"."carts"
  as permissive
  for update
  to public
using (true);



  create policy "Event hosts can view attendees for their events"
  on "public"."event_attendees"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.events
  WHERE ((events.id = event_attendees.event_id) AND (events.host_id = auth.uid())))));



  create policy "Users can register for events"
  on "public"."event_attendees"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own event registrations"
  on "public"."event_attendees"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can view their own event registrations"
  on "public"."event_attendees"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Anyone can view events"
  on "public"."events"
  as permissive
  for select
  to public
using (true);



  create policy "Hosts can delete their own events"
  on "public"."events"
  as permissive
  for delete
  to public
using ((auth.uid() = host_id));



  create policy "Hosts can insert their own events"
  on "public"."events"
  as permissive
  for insert
  to public
with check ((auth.uid() = host_id));



  create policy "Hosts can update their own events"
  on "public"."events"
  as permissive
  for update
  to public
using ((auth.uid() = host_id))
with check ((auth.uid() = host_id));



  create policy "Hosts can view memberships for their clubs"
  on "public"."memberships"
  as permissive
  for select
  to public
using ((auth.uid() = host_id));



  create policy "Members can create their own memberships"
  on "public"."memberships"
  as permissive
  for insert
  to public
with check ((auth.uid() = member_id));



  create policy "Allow public insert menu_corrections"
  on "public"."menu_corrections"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow public read menu_corrections"
  on "public"."menu_corrections"
  as permissive
  for select
  to public
using (true);



  create policy "Allow public insert menus"
  on "public"."menus"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow public read menus"
  on "public"."menus"
  as permissive
  for select
  to public
using (true);



  create policy "Anyone can view wines"
  on "public"."wines"
  as permissive
  for select
  to public
using (true);



  create policy "Hosts can delete their own wines"
  on "public"."wines"
  as permissive
  for delete
  to public
using ((auth.uid() = host_id));



  create policy "Hosts can insert their own wines"
  on "public"."wines"
  as permissive
  for insert
  to public
with check ((auth.uid() = host_id));



  create policy "Hosts can update their own wines"
  on "public"."wines"
  as permissive
  for update
  to public
using ((auth.uid() = host_id))
with check ((auth.uid() = host_id));



  create policy "Members can update their own memberships"
  on "public"."memberships"
  as permissive
  for update
  to public
using ((auth.uid() = member_id))
with check ((auth.uid() = member_id));



  create policy "Public delete access for menu uploads"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'menu-uploads'::text));



  create policy "Public insert access for menu uploads"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'menu-uploads'::text));



  create policy "Public read access for menu uploads"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'menu-uploads'::text));



