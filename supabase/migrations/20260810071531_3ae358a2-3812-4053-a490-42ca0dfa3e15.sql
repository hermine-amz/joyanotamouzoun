-- 1) Restrict public read of site_settings to an explicit list of display keys
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;

CREATE POLICY "Public can read display settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (
  key LIKE 'image_%'
  OR key IN (
    'contact_email',
    'contact_phone',
    'whatsapp_number',
    'contact_address_fr',
    'contact_address_en',
    'contact_maps_query',
    'newsletter_intro_fr',
    'newsletter_intro_en'
  )
);

-- 2) has_role: keep SECURITY DEFINER (needed by RLS) but prevent role enumeration
--    of other users by signed-in callers. All policies call it with auth.uid().
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    )
  END
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;