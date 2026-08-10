CREATE POLICY "Media are readable by everyone"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'media');

CREATE POLICY "Editors can upload media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));

CREATE POLICY "Editors can update media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')))
WITH CHECK (bucket_id = 'media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));

CREATE POLICY "Editors can delete media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')));