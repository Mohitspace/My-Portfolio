import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwinhlaobgacnmoxraus.supabase.co'
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_d78FsEQirjTNChHeCZ_ZCg_jt3R1eFF'

export const createClient = () => createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
