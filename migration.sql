-- Création de la table pour enregistrer les visites de la plateforme
CREATE TABLE IF NOT EXISTS public.page_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    path TEXT
);

-- Activation de RLS sur la table des visites
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Autoriser l'insertion pour tout le monde (anonyme et authentifié)
CREATE POLICY "Allow anonymous inserts to page_visits" 
ON public.page_visits 
FOR INSERT 
WITH CHECK (true);

-- Seul les admins (ou les rôles autorisés) peuvent lire les données
-- On suppose que votre API utilise la clé service_role pour lire, ce qui bypass le RLS.
-- Si vous devez y accéder via le client avec le rôle admin, voici la politique (adaptée à votre fonction has_role):
CREATE POLICY "Admins can view page_visits" 
ON public.page_visits 
FOR SELECT 
USING (false);

-- Ajouter la clé de configuration pour le compteur en ligne (si elle n'existe pas déjà)
INSERT INTO public.site_settings (key, value)
VALUES ('show_online_counter', 'false')
ON CONFLICT (key) DO NOTHING;

-- Configuration de Supabase Realtime
-- Il faut activer Realtime pour la base de données (sur les tables si besoin, mais ici on utilisera principalement les Presence Channels qui ne nécessitent pas d'écouter une table spécifique, juste d'activer le module Realtime dans le dashboard).
