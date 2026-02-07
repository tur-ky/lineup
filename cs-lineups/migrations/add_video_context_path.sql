-- Migration: Add video_context_path column to lineups table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.lineups 
ADD COLUMN IF NOT EXISTS video_context_path text null;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lineups' AND column_name = 'video_context_path';
