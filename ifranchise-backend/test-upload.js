// test-upload.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  console.log("URL:", process.env.SUPABASE_URL);

  // 1. Confirm bucket actually exists and is visible to this client
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  console.log("Buckets:", buckets, listErr);

  // 2. Try the simplest possible upload
  const { data, error } = await supabase.storage
    .from("application-documents")
    .upload(`test-${Date.now()}.txt`, Buffer.from("hello world"), { contentType: "text/plain" });

  console.log("Upload result:", data, error);
}

test();