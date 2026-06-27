import postgres from 'postgres';

const sql = postgres("postgresql://postgres.vbesyjbxclatvsqypnmc:HZfj3z943pQqLJ6N@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres");

async function checkDb() {
  try {
    console.log("=========================================");
    console.log("       LIVE POSTGRESQL DATABASE          ");
    console.log("=========================================\n");

    const users = await sql`SELECT id, email, phone, full_name, role FROM users`;
    console.log(`[TABLE: users] (${users.length} rows)`);
    console.table(users);

    const profiles = await sql`SELECT id, user_id, city, kyc_status FROM buddy_profiles`;
    console.log(`\n[TABLE: buddy_profiles] (${profiles.length} rows)`);
    console.table(profiles);

    const kyc = await sql`SELECT id, buddy_id, status, submitted_ago FROM kyc_submissions`;
    console.log(`\n[TABLE: kyc_submissions] (${kyc.length} rows)`);
    console.table(kyc);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

checkDb();
