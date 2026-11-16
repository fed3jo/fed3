-- First create this user in Supabase Authentication > Users.
-- Then run this statement once. It does not create or expose a password.
insert into public.cms_staff(user_id,email,role,active)
select id,email,'manager',true from auth.users where lower(email)=lower('Fed3JoR@proton.me')
on conflict(user_id) do update set role='manager',active=true,email=excluded.email;
