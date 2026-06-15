-- Workspaces: top-level groups containing sections and channels

CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT workspaces_name_length CHECK (char_length(name) BETWEEN 1 AND 80),
  CONSTRAINT workspaces_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE UNIQUE INDEX workspaces_slug_unique ON public.workspaces (slug);

CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);

ALTER TABLE public.channel_sections
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.channels
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Backfill: one default workspace for existing data
DO $$
DECLARE
  ws_id UUID;
  first_user UUID;
BEGIN
  SELECT id INTO first_user FROM public.profiles ORDER BY created_at LIMIT 1;
  IF first_user IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.workspaces (name, slug, created_by)
  SELECT 'DevTalk', 'devtalk', first_user
  WHERE NOT EXISTS (SELECT 1 FROM public.workspaces WHERE slug = 'devtalk');

  SELECT id INTO ws_id FROM public.workspaces WHERE slug = 'devtalk';

  UPDATE public.channel_sections SET workspace_id = ws_id WHERE workspace_id IS NULL;
  UPDATE public.channels SET workspace_id = ws_id WHERE kind = 'channel' AND workspace_id IS NULL;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  SELECT ws_id, p.id, CASE WHEN p.id = first_user THEN 'owner' ELSE 'member' END
  FROM public.profiles p
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
END $$;

ALTER TABLE public.channel_sections
  ALTER COLUMN workspace_id SET NOT NULL;

DROP INDEX IF EXISTS channel_sections_name_unique;
CREATE UNIQUE INDEX channel_sections_workspace_name_unique
  ON public.channel_sections (workspace_id, lower(trim(name)));

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID, uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = uid
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');

  INSERT INTO public.channel_sections (name, sort_order, workspace_id)
  VALUES ('Channels', 0, NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();

CREATE OR REPLACE FUNCTION public.workspace_slug_taken(slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces w WHERE w.slug = workspace_slug_taken.slug
  );
$$;

GRANT EXECUTE ON FUNCTION public.workspace_slug_taken(TEXT) TO authenticated;

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspaces_select"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(id, auth.uid())
    OR created_by = auth.uid()
  );

CREATE POLICY "workspaces_insert"
  ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = created_by
    )
  );

CREATE POLICY "workspaces_update"
  ON public.workspaces FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "workspaces_delete"
  ON public.workspaces FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "workspace_members_select"
  ON public.workspace_members FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "workspace_members_insert"
  ON public.workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_members.workspace_id
        AND w.created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_delete"
  ON public.workspace_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "channel_sections_select" ON public.channel_sections;
DROP POLICY IF EXISTS "channel_sections_insert" ON public.channel_sections;
DROP POLICY IF EXISTS "channel_sections_update" ON public.channel_sections;
DROP POLICY IF EXISTS "channel_sections_delete" ON public.channel_sections;

CREATE POLICY "channel_sections_select"
  ON public.channel_sections FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "channel_sections_insert"
  ON public.channel_sections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "channel_sections_update"
  ON public.channel_sections FOR UPDATE
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "channel_sections_delete"
  ON public.channel_sections FOR DELETE
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
