import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import jwt from "npm:jsonwebtoken@9.0.2";
import bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const JWT_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!.slice(0, 32);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Password pattern: GreenAndhra@DDMMYYYY
const PASSWORD_RE = /^GreenAndhra@(\d{2})(\d{2})(\d{4})$/;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Simple Express-like router
async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, "");
  const method = req.method;

  // ---------- AUTH ----------
  if (path === "/signup" && method === "POST") {
    const { email, password, fullName, dob } = await req.json();
    if (!email || !password || !fullName || !dob)
      return json({ error: "All fields required" }, 400);
    if (!PASSWORD_RE.test(password))
      return json({ error: "Password must follow GreenAndhra@DDMMYYYY" }, 400);
    if (!password.endsWith("@" + dob))
      return json({ error: "Password DOB must match Date of Birth" }, 400);

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existing) return json({ error: "User already exists" }, 409);

    const hash = bcrypt.hashSync(password, 10);
    const { data: user, error } = await supabase
      .from("users")
      .insert({ email, password_hash: hash, full_name: fullName, dob, role: "citizen" })
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);

    const token = jwt.sign({ id: user.id, email, role: "citizen", dob }, JWT_SECRET, { expiresIn: "7d" });
    return json({ token, user: { id: user.id, email, full_name: fullName, role: "citizen", dob } });
  }

  if (path === "/login" && method === "POST") {
    const { email, password } = await req.json();
    if (!email || !password) return json({ error: "Email and password required" }, 400);
    if (!PASSWORD_RE.test(password))
      return json({ error: "Password must follow GreenAndhra@DDMMYYYY" }, 400);

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error || !user) return json({ error: "Invalid credentials" }, 401);

    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return json({ error: "Invalid credentials" }, 401);

    const token = jwt.sign({ id: user.id, email, role: user.role, dob: user.dob }, JWT_SECRET, { expiresIn: "7d" });
    return json({
      token,
      user: { id: user.id, email, full_name: user.full_name, role: user.role, dob: user.dob },
    });
  }

  // ---------- VERIFY DOB (used across pages) ----------
  if (path === "/verify-dob" && method === "POST") {
    const { dob, userId } = await req.json();
    const { data: user } = await supabase.from("users").select("dob").eq("id", userId).maybeSingle();
    if (!user) return json({ error: "User not found" }, 404);
    if (user.dob !== dob) return json({ valid: false, error: "DOB does not match login DOB" }, 403);
    return json({ valid: true, dob: user.dob });
  }

  // ---------- AUTH MIDDLEWARE ----------
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  let session: { id: string; email: string; role: string; dob: string } | null = null;
  if (token) {
    try {
      session = jwt.verify(token, JWT_SECRET) as typeof session;
    } catch {
      return json({ error: "Invalid token" }, 401);
    }
  }

  if (path === "/me" && method === "GET") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const { data: u } = await supabase
      .from("users")
      .select("id,email,full_name,role,dob,aadhaar_number,state,district,mandal,village,bank_account_number,ifsc_code,account_holder_name")
      .eq("id", session!.id)
      .maybeSingle();
    return json({ user: u });
  }

  // ---------- CITIZEN VERIFICATION ----------
  if (path === "/citizen-verify" && method === "POST") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const { aadhaar, fullName, dob, state, district, mandal, village } = await req.json();
    if (session!.dob !== dob)
      return json({ error: "DOB must match the DOB used at login" }, 403);
    const { data, error } = await supabase
      .from("users")
      .update({ aadhaar_number: aadhaar, full_name: fullName, state, district, mandal, village })
      .eq("id", session!.id)
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);
    await supabase.from("audit_logs").insert({ user_email: session!.email, action: "citizen_verified", detail: aadhaar });
    return json({ user: data });
  }

  // ---------- CLIMATE DATA ----------
  if (path === "/climate" && method === "GET") {
    const { data } = await supabase.from("climate_data").select("*").order("created_at", { ascending: false });
    return json({ data });
  }
  if (path === "/climate" && method === "POST") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const body = await req.json();
    const { data, error } = await supabase.from("climate_data").insert(body).select().single();
    if (error) return json({ error: error.message }, 500);
    return json({ data });
  }

  // ---------- PLANTING LOCATIONS ----------
  if (path === "/locations" && method === "GET") {
    const { data } = await supabase.from("planting_locations").select("*").order("created_at", { ascending: false });
    return json({ data });
  }
  if (path === "/locations" && method === "POST") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const body = await req.json();
    const { data, error } = await supabase.from("planting_locations").insert(body).select().single();
    if (error) return json({ error: error.message }, 500);
    return json({ data });
  }
  if (path.startsWith("/locations/") && method === "PUT") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const id = path.split("/")[2];
    const body = await req.json();
    const { data, error } = await supabase.from("planting_locations").update(body).eq("id", id).select().single();
    if (error) return json({ error: error.message }, 500);
    return json({ data });
  }

  // ---------- TREE REGISTRATIONS ----------
  if (path === "/registrations" && method === "GET") {
    const uid = url.searchParams.get("user_id");
    let q = supabase.from("tree_registrations").select("*,planting_locations(*)");
    if (uid) q = q.eq("user_id", uid);
    const { data } = await q.order("created_at", { ascending: false });
    return json({ data });
  }
  if (path === "/registrations" && method === "POST") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const { locationId, assignedTreeCount, locationNumber } = await req.json();
    const loc = await supabase.from("planting_locations").select("*").eq("id", locationId).maybeSingle();
    if (!loc.data) return json({ error: "Location not found" }, 404);
    if (loc.data.assigned) return json({ error: "Location already assigned" }, 409);

    const plantId = `GAM-${Date.now().toString().slice(-6)}`;
    const { data, error } = await supabase
      .from("tree_registrations")
      .insert({
        user_id: session!.id,
        location_id: locationId,
        plant_id: plantId,
        location_number: locationNumber,
        assigned_tree_count: assignedTreeCount,
        status: "pending",
      })
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);
    await supabase.from("planting_locations").update({ assigned: true, assigned_to: session!.id }).eq("id", locationId);
    return json({ data });
  }

  // ---------- TREE PROGRESS ----------
  if (path === "/progress" && method === "GET") {
    const rid = url.searchParams.get("registration_id");
    const { data } = await supabase
      .from("tree_progress")
      .select("*")
      .eq("registration_id", rid || "")
      .order("month_number", { ascending: true });
    return json({ data });
  }
  if (path === "/progress" && method === "POST") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const { registrationId, monthNumber, photoUrl } = await req.json();
    // Mock AI verification
    const statuses = ["Healthy", "Moderate", "Needs Attention"];
    const aiStatus = statuses[monthNumber % 3];
    const { data, error } = await supabase
      .from("tree_progress")
      .insert({ registration_id: registrationId, month_number: monthNumber, photo_url: photoUrl, ai_status: aiStatus, ai_note: `AI verified — ${aiStatus}` })
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);
    await supabase.from("tree_registrations").update({ status: aiStatus.toLowerCase().replace(" ", "_") }).eq("id", registrationId);
    return json({ data });
  }

  // ---------- REWARDS ----------
  if (path === "/rewards" && method === "GET") {
    const uid = url.searchParams.get("user_id");
    let q = supabase.from("rewards").select("*");
    if (uid) q = q.eq("user_id", uid);
    const { data } = await q.order("month", { ascending: false });
    return json({ data });
  }
  if (path === "/rewards/bank" && method === "POST") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const { bankAccountNumber, ifscCode, accountHolderName } = await req.json();
    const { data, error } = await supabase
      .from("users")
      .update({ bank_account_number: bankAccountNumber, ifsc_code: ifscCode, account_holder_name: accountHolderName })
      .eq("id", session!.id)
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);
    return json({ data });
  }
  if (path === "/rewards" && method === "POST") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const { userId, month, amount } = await req.json();
    const { data, error } = await supabase.from("rewards").insert({ user_id: userId, month, amount, status: "pending" }).select().single();
    if (error) return json({ error: error.message }, 500);
    return json({ data });
  }
  if (path.startsWith("/rewards/") && method === "PUT") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const id = path.split("/")[2];
    const body = await req.json();
    const { data, error } = await supabase.from("rewards").update(body).eq("id", id).select().single();
    if (error) return json({ error: error.message }, 500);
    return json({ data });
  }

  // ---------- SUGGESTIONS ----------
  if (path === "/suggestions" && method === "GET") {
    const { data } = await supabase.from("suggestions").select("*,users(full_name,email)").order("created_at", { ascending: false });
    return json({ data });
  }
  if (path === "/suggestions" && method === "POST") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const { title, description, category } = await req.json();
    const { data, error } = await supabase
      .from("suggestions")
      .insert({ user_id: session!.id, title, description, category })
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);
    return json({ data });
  }
  if (path.startsWith("/suggestions/") && method === "PUT") {
    if (!session) return json({ error: "Unauthorized" }, 401);
    const id = path.split("/")[2];
    const body = await req.json();
    const { data, error } = await supabase.from("suggestions").update(body).eq("id", id).select().single();
    if (error) return json({ error: error.message }, 500);
    return json({ data });
  }

  // ---------- ADMIN ----------
  if (path === "/admin/users" && method === "GET") {
    if (!session || session!.role === "citizen") return json({ error: "Admin only" }, 403);
    const { data } = await supabase.from("users").select("id,email,full_name,role,dob,district,mandal,village,created_at");
    return json({ data });
  }
  if (path === "/admin/logs" && method === "GET") {
    if (!session || session!.role === "citizen") return json({ error: "Admin only" }, 403);
    const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
    return json({ data });
  }

  // ---------- ANALYTICS ----------
  if (path === "/analytics" && method === "GET") {
    const [{ data: regs }, { data: rw }, { data: cl }, { data: sg }, { data: us }] = await Promise.all([
      supabase.from("tree_registrations").select("*"),
      supabase.from("rewards").select("*"),
      supabase.from("climate_data").select("*"),
      supabase.from("suggestions").select("*"),
      supabase.from("users").select("role,district"),
    ]);
    return json({ registrations: regs, rewards: rw, climate: cl, suggestions: sg, users: us });
  }

  return json({ error: "Not found", path }, 404);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    return await router(req);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
