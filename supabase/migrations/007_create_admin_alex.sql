-- ═══════════════════════════════════════════════════════════════════════════════
-- DORELLA JEWELRY — MIGRACIÓN 007: CREAR / ACTIVAR ADMIN ALEX
-- ═══════════════════════════════════════════════════════════════════════════════
-- Ejecutar en la consola SQL del Dashboard de Supabase:
-- https://supabase.com/dashboard/project/hszxtkwalgndaovckaug/sql
--
-- Usuario: Alex
-- Email interno: alex.dorellajewelry@gmail.com
-- Rol: admin
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Si el usuario ya fue registrado en auth.users, confirmar su email y otorgarle rol admin:
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb,
  raw_user_meta_data = raw_user_meta_data || '{"name": "Alex", "role": "admin"}'::jsonb
WHERE email = 'alex.dorellajewelry@gmail.com';

-- 2. Verificar que el rol 'admin' quedó asignado correctamente:
SELECT id, email, raw_app_meta_data->>'role' as app_role, email_confirmed_at 
FROM auth.users 
WHERE email = 'alex.dorellajewelry@gmail.com';
