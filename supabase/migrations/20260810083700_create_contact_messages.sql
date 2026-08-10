CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages" 
ON public.contact_messages 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (
  email <> '' AND length(email) < 255 
  AND name <> '' AND length(name) < 100 
  AND message <> '' AND length(message) < 1000
);

CREATE POLICY "Admins read contact messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'editor')
);

CREATE POLICY "Admins delete contact messages" 
ON public.contact_messages 
FOR DELETE 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'admin')
);
