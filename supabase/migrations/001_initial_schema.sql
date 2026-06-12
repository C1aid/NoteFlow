CREATE TYPE subscription_tier AS ENUM ('free', 'premium');
CREATE TYPE collaborator_permission AS ENUM ('read', 'write');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content JSONB NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  share_token UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission collaborator_permission NOT NULL DEFAULT 'write',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_owner_id ON public.notes(owner_id);
CREATE INDEX idx_notes_share_token ON public.notes(share_token);
CREATE INDEX idx_collaborators_note_id ON public.collaborators(note_id);
CREATE INDEX idx_collaborators_user_id ON public.collaborators(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_premium(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid AND subscription_tier = 'premium'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_access_note(note_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.notes n
    WHERE n.id = note_uuid
    AND (
      n.owner_id = user_uuid
      OR EXISTS (
        SELECT 1 FROM public.collaborators c
        WHERE c.note_id = note_uuid AND c.user_id = user_uuid
      )
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_write_note(note_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.notes n
    WHERE n.id = note_uuid AND n.owner_id = user_uuid
  )
  OR EXISTS (
    SELECT 1 FROM public.collaborators c
    WHERE c.note_id = note_uuid
    AND c.user_id = user_uuid
    AND c.permission = 'write'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own notes"
  ON public.notes FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Premium users can view shared notes"
  ON public.notes FOR SELECT
  USING (
    public.is_premium(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.collaborators c
      WHERE c.note_id = id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view notes via share token when collaborator"
  ON public.notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collaborators c
      WHERE c.note_id = id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own notes"
  ON public.notes FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Collaborators with write can update notes"
  ON public.notes FOR UPDATE
  USING (public.can_write_note(id, auth.uid()));

CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE
  USING (owner_id = auth.uid());

CREATE POLICY "Note owners can manage collaborators"
  ON public.collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.notes n
      WHERE n.id = note_id AND n.owner_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can view their collaborations"
  ON public.collaborators FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Premium owners can add collaborators"
  ON public.collaborators FOR INSERT
  WITH CHECK (
    public.is_premium(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.notes n
      WHERE n.id = note_id AND n.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
