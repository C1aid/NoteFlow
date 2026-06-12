CREATE OR REPLACE FUNCTION public.is_note_owner(note_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.notes
    WHERE id = note_uuid AND owner_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_note_collaborator(note_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.collaborators
    WHERE note_id = note_uuid AND user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_premium(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid AND subscription_tier = 'premium'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_write_note(note_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_note_owner(note_uuid, user_uuid)
  OR EXISTS (
    SELECT 1 FROM public.collaborators
    WHERE note_id = note_uuid
    AND user_id = user_uuid
    AND permission = 'write'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_note(note_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_note_owner(note_uuid, user_uuid)
  OR public.is_note_collaborator(note_uuid, user_uuid);
$$;

DROP POLICY IF EXISTS "Premium users can view shared notes" ON public.notes;
DROP POLICY IF EXISTS "Users can view notes via share token when collaborator" ON public.notes;
DROP POLICY IF EXISTS "Collaborators with write can update notes" ON public.notes;
DROP POLICY IF EXISTS "Note owners can manage collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Premium owners can add collaborators" ON public.collaborators;

CREATE POLICY "Collaborators can view shared notes"
  ON public.notes FOR SELECT
  USING (public.is_note_collaborator(id, auth.uid()));

CREATE POLICY "Collaborators with write can update notes"
  ON public.notes FOR UPDATE
  USING (public.can_write_note(id, auth.uid()));

CREATE POLICY "Note owners can manage collaborators"
  ON public.collaborators FOR ALL
  USING (public.is_note_owner(note_id, auth.uid()));

CREATE POLICY "Premium owners can add collaborators"
  ON public.collaborators FOR INSERT
  WITH CHECK (
    public.is_premium(auth.uid())
    AND public.is_note_owner(note_id, auth.uid())
  );
