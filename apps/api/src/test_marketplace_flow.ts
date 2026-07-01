import { createApp } from "./app.js";
import type { Server } from "http";

const TASKER_ID = "586aa545-2a33-4531-a1ab-e57844f05943";
const APPROVED_BUDDY_ID = "7c738a3f-df4e-4799-95bb-103cc032fdef";
const PENDING_BUDDY_ID = "6331eaa1-6d8f-4482-9999-573739a8c727";

const TASKER_TOKEN = `Bearer TEST_tasker_${TASKER_ID}`;
const APPROVED_BUDDY_TOKEN = `Bearer TEST_buddy_${APPROVED_BUDDY_ID}`;
const PENDING_BUDDY_TOKEN = `Bearer TEST_buddy_${PENDING_BUDDY_ID}`;

async function runTestFlow() {
  const app = createApp();
  let server: Server | undefined;

  const baseUrl = await new Promise<string>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const addr = server!.address() as any;
      resolve(`http://127.0.0.1:${addr.port}`);
    });
  });

  console.log(`\n=============================================================`);
  console.log(`  STARTING 9-STEP MARKETPLACE INTEGRATION VERIFICATION FLOW  `);
  console.log(`=============================================================\n`);
  console.log(`Server listening on ${baseUrl}\n`);

  let createdTaskId: string = "";
  let createdBidId: string = "";

  try {
    // ── Step 1: Verify GET /v1/tasks returns status = open only and bidCount field
    console.log("▶ Step 1: Fetching initial open marketplace feed...");
    const res1 = await fetch(`${baseUrl}/v1/tasks`);
    const data1 = await res1.json();
    if (!res1.ok || !data1.success) throw new Error(`Step 1 failed: ${JSON.stringify(data1)}`);
    console.log(`✅ Step 1 Passed: Retrieved ${data1.data.length} open tasks. Sample bidCount field present: ${data1.data[0]?.bidCount !== undefined ? "Yes" : "N/A (empty feed)"}`);

    // ── Step 2: Tasker creates a new task
    console.log("\n▶ Step 2: Tasker creating a new chore...");
    const newTaskPayload = {
      title: "Deep Clean Kitchen & Balcony",
      description: "Need thorough cleaning of grease from kitchen chimney and scrubbing balcony tiles.",
      category: "Home Cleaning",
      zone: "Koramangala",
      budgetMin: 500,
      budgetMax: 800,
    };
    const res2 = await fetch(`${baseUrl}/v1/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: TASKER_TOKEN,
      },
      body: JSON.stringify(newTaskPayload),
    });
    const data2 = await res2.json();
    if (!res2.ok || !data2.success) throw new Error(`Step 2 failed: ${JSON.stringify(data2)}`);
    createdTaskId = data2.data.id;
    console.log(`✅ Step 2 Passed: Task created successfully (ID: ${createdTaskId}, Status: ${data2.data.status})`);

    // ── Step 3: Verify GET /v1/tasks now includes newly created task with bidCount = 0
    console.log("\n▶ Step 3: Verifying new task in feed with bidCount = 0...");
    const res3 = await fetch(`${baseUrl}/v1/tasks`);
    const data3 = await res3.json();
    const foundTask = data3.data.find((t: any) => t.id === createdTaskId);
    if (!foundTask || foundTask.bidCount !== 0) {
      throw new Error(`Step 3 failed: Task not found or bidCount incorrect (${JSON.stringify(foundTask)})`);
    }
    console.log(`✅ Step 3 Passed: Task verified in feed with bidCount = ${foundTask.bidCount}`);

    // ── Step 4: Approved Buddy places a bid
    console.log("\n▶ Step 4: Approved Buddy placing a bid on the task...");
    const res4 = await fetch(`${baseUrl}/v1/tasks/${createdTaskId}/bids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: APPROVED_BUDDY_TOKEN,
      },
      body: JSON.stringify({ amount: 600, message: "I have professional cleaning equipment!" }),
    });
    const data4 = await res4.json();
    if (!res4.ok || !data4.success) throw new Error(`Step 4 failed: ${JSON.stringify(data4)}`);
    createdBidId = data4.data.id;
    console.log(`✅ Step 4 Passed: Bid placed successfully (ID: ${createdBidId}, Amount: ₹${data4.data.amount})`);

    // ── Step 5: Unapproved Buddy attempts to place a bid (must receive 403)
    console.log("\n▶ Step 5: Unapproved Buddy attempting to place a bid...");
    const res5 = await fetch(`${baseUrl}/v1/tasks/${createdTaskId}/bids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: PENDING_BUDDY_TOKEN,
      },
      body: JSON.stringify({ amount: 550, message: "Can I do it?" }),
    });
    const data5 = await res5.json();
    if (res5.status !== 403) {
      throw new Error(`Step 5 failed: Expected 403 Forbidden, got ${res5.status}: ${JSON.stringify(data5)}`);
    }
    console.log(`✅ Step 5 Passed: Properly blocked unapproved buddy (Code: ${data5.error?.code}, Msg: ${data5.error?.message})`);

    // ── Step 6: Verify GET /v1/tasks shows bidCount = 1
    console.log("\n▶ Step 6: Verifying feed updated bidCount = 1...");
    const res6 = await fetch(`${baseUrl}/v1/tasks`);
    const data6 = await res6.json();
    const updatedTask = data6.data.find((t: any) => t.id === createdTaskId);
    if (!updatedTask || updatedTask.bidCount !== 1) {
      throw new Error(`Step 6 failed: Expected bidCount=1, got ${updatedTask?.bidCount}`);
    }
    console.log(`✅ Step 6 Passed: Verified bidCount = ${updatedTask.bidCount} in marketplace feed`);

    // ── Step 7: Buddy updates bid amount
    console.log("\n▶ Step 7: Buddy updating bid amount to ₹550...");
    const res7 = await fetch(`${baseUrl}/v1/bids/${createdBidId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: APPROVED_BUDDY_TOKEN,
      },
      body: JSON.stringify({ amount: 550, message: "Updated my offer to ₹550!" }),
    });
    const data7 = await res7.json();
    if (!res7.ok || !data7.success || data7.data.amount !== 550) {
      throw new Error(`Step 7 failed: ${JSON.stringify(data7)}`);
    }
    console.log(`✅ Step 7 Passed: Bid updated successfully (New Amount: ₹${data7.data.amount})`);

    // ── Step 8: Tasker accepts bid (triggers fn_accept_bid)
    console.log("\n▶ Step 8: Tasker accepting the bid via fn_accept_bid stored procedure...");
    const res8 = await fetch(`${baseUrl}/v1/bids/${createdBidId}/accept`, {
      method: "POST",
      headers: {
        Authorization: TASKER_TOKEN,
      },
    });
    const data8 = await res8.json();
    if (!res8.ok || !data8.success) throw new Error(`Step 8 failed: ${JSON.stringify(data8)}`);
    console.log(`✅ Step 8 Passed: Bid accepted atomically via database stored procedure`);

    // ── Step 9: Verify GET /v1/tasks no longer includes task in open feed
    console.log("\n▶ Step 9: Verifying accepted task is no longer in open marketplace feed...");
    const res9 = await fetch(`${baseUrl}/v1/tasks`);
    const data9 = await res9.json();
    const acceptedInFeed = data9.data.find((t: any) => t.id === createdTaskId);
    if (acceptedInFeed) {
      throw new Error(`Step 9 failed: Accepted task still visible in open feed!`);
    }
    console.log(`✅ Step 9 Passed: Accepted task excluded from open feed as expected.`);

    console.log(`\n=============================================================`);
    console.log(`  🎉 ALL 9 STEPS PASSED SUCCESSFULLY! MARKETPLACE VALIDATED!  `);
    console.log(`=============================================================\n`);
  } catch (error: any) {
    console.error(`\n❌ TEST FAILED:`, error.message || error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    process.exit(process.exitCode || 0);
  }
}

runTestFlow();
