import { eq } from "drizzle-orm";
import { db } from "./config/database.js";
import { users } from "./db/schema.js";
import { supabaseAdmin } from "./config/supabase.js";

const TARGET_USER_ID = process.argv[2] || "607f4543-c82d-4302-9726-ddcc980d70b9";

async function promoteToAdmin() {
  console.log(`\nPromoting user ${TARGET_USER_ID} to admin...\n`);

  try {
    // 1. Update Postgres database users table
    const updatedDb = await db
      .update(users)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(users.id, TARGET_USER_ID))
      .returning();

    if (updatedDb.length > 0) {
      console.log("✅ Updated public.users table:");
      console.log(`   ID: ${updatedDb[0].id} | Email: ${updatedDb[0].email} | Role: ${updatedDb[0].role}`);
    } else {
      console.log("⚠️ User not found in public.users table. Proceeding to update Supabase Auth...");
    }

    // 2. Update Supabase Auth app_metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      TARGET_USER_ID,
      { app_metadata: { role: "admin" } }
    );

    if (error) {
      console.error("❌ Failed to update Supabase Auth metadata:", error.message);
      process.exit(1);
    }

    console.log("✅ Updated Supabase Auth app_metadata:");
    console.log(`   ID: ${data.user.id} | Email: ${data.user.email} | app_metadata:`, data.user.app_metadata);
    console.log("\n🚀 Promotion complete! Please log out and log back in (or refresh session) to update your browser JWT.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error promoting user:", err);
    process.exit(1);
  }
}

promoteToAdmin();
