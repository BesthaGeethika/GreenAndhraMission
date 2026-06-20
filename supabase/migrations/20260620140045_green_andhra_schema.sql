-- Green Andhra Mission schema

-- USERS (citizens + officers)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  dob text NOT NULL, -- DDMMYYYY format used in password
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen','super_admin','district_climate_officer','mandal_climate_officer','environmental_survey_officer','weather_reporting_manager')),
  aadhaar_number text,
  state text DEFAULT 'Andhra Pradesh',
  district text,
  mandal text,
  village text,
  bank_account_number text,
  ifsc_code text,
  account_holder_name text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- We also need public read for officer dashboards via service role; client uses anon for auth flow.
-- For demo simplicity allow authenticated select on users list (officers).
CREATE POLICY "users_select_all_authenticated" ON users FOR SELECT TO authenticated USING (true);

-- CLIMATE DATA per mandal (Module 5)
CREATE TABLE IF NOT EXISTS climate_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  mandal text NOT NULL,
  trees_existing int DEFAULT 0,
  trees_cut int DEFAULT 0,
  groundwater_level numeric DEFAULT 0,
  air_quality text,
  industrial_pollution text,
  rainfall numeric DEFAULT 0,
  temperature numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE climate_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "climate_select" ON climate_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "climate_insert" ON climate_data FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "climate_update" ON climate_data FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "climate_delete" ON climate_data FOR DELETE TO authenticated USING (true);

-- PLANTING LOCATIONS (Module 7)
CREATE TABLE IF NOT EXISTS planting_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district text,
  mandal text,
  village text,
  gps_lat numeric,
  gps_lng numeric,
  assigned boolean DEFAULT false,
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE planting_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loc_select" ON planting_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "loc_insert" ON planting_locations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "loc_update" ON planting_locations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "loc_delete" ON planting_locations FOR DELETE TO authenticated USING (true);

-- TREE REGISTRATIONS (Module 6 + 8)
CREATE TABLE IF NOT EXISTS tree_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  location_id uuid REFERENCES planting_locations(id),
  plant_id text NOT NULL,
  location_number text,
  assigned_tree_count int DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','healthy','moderate','needs_attention','dead')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE tree_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tr_select" ON tree_registrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "tr_insert" ON tree_registrations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tr_update" ON tree_registrations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tr_delete" ON tree_registrations FOR DELETE TO authenticated USING (true);

-- TREE PROGRESS PHOTOS (Module 8)
CREATE TABLE IF NOT EXISTS tree_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES tree_registrations(id) NOT NULL,
  month_number int NOT NULL,
  photo_url text,
  ai_status text DEFAULT 'Healthy' CHECK (ai_status IN ('Healthy','Moderate','Needs Attention')),
  ai_note text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE tree_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tp_select" ON tree_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY "tp_insert" ON tree_progress FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tp_update" ON tree_progress FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tp_delete" ON tree_progress FOR DELETE TO authenticated USING (true);

-- REWARDS (Module 9)
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  month text,
  amount int DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid'))
);
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rw_select" ON rewards FOR SELECT TO authenticated USING (true);
CREATE POLICY "rw_insert" ON rewards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rw_update" ON rewards FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "rw_delete" ON rewards FOR DELETE TO authenticated USING (true);

-- SUGGESTIONS (Module 11)
CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  title text NOT NULL,
  description text,
  category text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','reviewed','approved','rejected')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sg_select" ON suggestions FOR SELECT TO authenticated USING (true);
CREATE POLICY "sg_insert" ON suggestions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sg_update" ON suggestions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sg_delete" ON suggestions FOR DELETE TO authenticated USING (true);

-- AUDIT LOGS (Module 15)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text,
  action text,
  detail text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "al_select" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "al_insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
