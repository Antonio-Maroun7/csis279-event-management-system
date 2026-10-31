-- Migration 001: one-time backup codes for two-factor authentication.
-- Run once in pgAdmin (Query Tool on event_management_system) or with:
--   psql -U postgres -d event_management_system -f database/migrations/001_two_factor_backup_codes.sql

CREATE TABLE IF NOT EXISTS public.two_factor_backup_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    code_hash VARCHAR(64) NOT NULL,          -- SHA-256 of the code, never the code itself
    used_at TIMESTAMP WITH TIME ZONE,        -- NULL until the code is used once
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_backup_codes_user
    ON public.two_factor_backup_codes (user_id);