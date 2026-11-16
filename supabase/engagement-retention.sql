-- Supabase-specific scheduler; separate from the portable schema used by tests.
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
select cron.schedule('fed3-engagement-retention','17 * * * *',$$select public.eng_cleanup(); delete from cron.job_run_details where jobid=(select jobid from cron.job where jobname='fed3-engagement-retention') and end_time<now()-interval '7 days';$$);
select public.eng_cleanup();
