export type Role =
  | 'citizen'
  | 'super_admin'
  | 'district_climate_officer'
  | 'mandal_climate_officer'
  | 'environmental_survey_officer'
  | 'weather_reporting_manager';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  dob: string; // DDMMYYYY
  aadhaar_number?: string;
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
}

export interface ClimateData {
  id: string;
  district: string;
  mandal: string;
  trees_existing: number;
  trees_cut: number;
  groundwater_level: number;
  air_quality: string;
  industrial_pollution: string;
  rainfall: number;
  temperature: number;
  created_at: string;
}

export interface PlantingLocation {
  id: string;
  name: string;
  district?: string;
  mandal?: string;
  village?: string;
  gps_lat?: number;
  gps_lng?: number;
  assigned: boolean;
  assigned_to?: string;
  created_at: string;
}

export interface TreeRegistration {
  id: string;
  user_id: string;
  location_id?: string;
  plant_id: string;
  location_number: string;
  assigned_tree_count: number;
  status: string;
  planting_locations?: PlantingLocation;
  created_at: string;
}

export interface TreeProgress {
  id: string;
  registration_id: string;
  month_number: number;
  photo_url?: string;
  ai_status: 'Healthy' | 'Moderate' | 'Needs Attention';
  ai_note?: string;
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  month: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
}

export interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  created_at: string;
  users?: { full_name: string; email: string };
}
