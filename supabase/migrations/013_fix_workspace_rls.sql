-- Fix workspace creation RLS (run after 012_workspaces.sql)

DROP POLICY IF EXISTS "workspaces_select" ON public.workspaces;

CREATE POLICY "workspaces_select"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (
    public.is_workspace_member(id, auth.uid())
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS "workspaces_insert" ON public.workspaces;

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

DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;

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
