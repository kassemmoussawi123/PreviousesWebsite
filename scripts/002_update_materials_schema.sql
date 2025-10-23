ALTER TABLE materials
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_materials_source ON materials(source);
CREATE INDEX IF NOT EXISTS idx_materials_external_id ON materials(external_id);
