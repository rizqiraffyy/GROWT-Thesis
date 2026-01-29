/**
 * Revoke ALL Supabase Auth sessions (GLOBAL).
 * - Requires SERVICE ROLE KEY (server-only).
 * - Logs out every user from all devices.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function listAllUsers() {
  const perPage = 200;
  let page = 1;
  const users = [];

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const batch = data?.users ?? [];
    users.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }
  return users;
}

async function main() {
  console.log('🔎 Fetching all users…');
  const users = await listAllUsers();
  console.log(`👥 Total users: ${users.length}`);

  let ok = 0, fail = 0;

  for (const u of users) {
    try {
      const { error } = await admin.auth.admin.signOut(u.id);
      if (error) throw error;
      ok += 1;
      console.log(`✅ revoked: ${u.email ?? u.id}`);
    } catch (e) {
      fail += 1;
      console.log(`❌ failed: ${u.email ?? u.id} — ${e?.message || e}`);
    }
  }

  console.log('---');
  console.log(`DONE. Success=${ok}, Failed=${fail}`);
  console.log(
    'Catatan: access token yang sudah terbit bisa hidup sampai expire, ' +
    'namun refresh token direvoke sehingga session tidak bisa diperpanjang.'
  );
}

main().catch((e) => {
  console.error('💥 Fatal:', e?.message || e);
  process.exit(1);
});
