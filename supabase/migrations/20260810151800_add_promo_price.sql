-- Ajoute la colonne promo_price à la table contents (idempotente)
ALTER TABLE contents ADD COLUMN IF NOT EXISTS promo_price NUMERIC;
