-- Remove legacy notes schema (run after 005_devtalk_chat.sql)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notes'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.notes;
  END IF;
END $$;

DROP TABLE IF EXISTS public.knowledge_items CASCADE;
DROP TABLE IF EXISTS public.collaborators CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;

DROP TYPE IF EXISTS knowledge_item_type;
DROP TYPE IF EXISTS collaborator_permission;

DROP FUNCTION IF EXISTS public.match_knowledge_items(vector, int, uuid);
DROP FUNCTION IF EXISTS public.search_knowledge_items_text(text, uuid);
DROP FUNCTION IF EXISTS public.is_note_collaborator(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_note_owner(uuid, uuid);
DROP FUNCTION IF EXISTS public.can_access_note(uuid, uuid);
DROP FUNCTION IF EXISTS public.can_write_note(uuid, uuid);
