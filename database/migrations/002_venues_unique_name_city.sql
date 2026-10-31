-- Migration 002: two venues cannot have the same name in the same city.
-- LOWER() makes "Innovation Hall" and "innovation hall" count as the same venue.
-- Run once in pgAdmin (Query Tool on event_management_system) or with:
--   psql -U postgres -d event_management_system -f database/migrations/002_venues_unique_name_city.sql

CREATE UNIQUE INDEX IF NOT EXISTS uq_venues_name_city
    ON public.venues (LOWER(name), LOWER(city));