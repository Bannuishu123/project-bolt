/*
  # Smart Helmet Monitoring System

  ## Overview
  Creates tables for managing emergency contacts and accident alerts for a smart helmet system
  that detects accidents and sends live location to emergency contacts.

  ## New Tables
  
  ### `emergency_contacts`
  - `id` (uuid, primary key) - Unique identifier for each contact
  - `name` (text) - Contact's full name
  - `phone` (text) - Contact's phone number
  - `email` (text, optional) - Contact's email address
  - `relationship` (text) - Relationship to user (e.g., "Family", "Friend", "Doctor")
  - `is_primary` (boolean) - Whether this is the primary emergency contact
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `accident_alerts`
  - `id` (uuid, primary key) - Unique identifier for each alert
  - `latitude` (numeric) - Location latitude where accident was detected
  - `longitude` (numeric) - Location longitude where accident was detected
  - `severity` (text) - Severity level: "Low", "Medium", "High"
  - `status` (text) - Alert status: "Active", "Resolved", "False Alarm"
  - `impact_force` (numeric, optional) - Simulated impact force value
  - `alerted_contacts` (text[], optional) - Array of contact IDs that were notified
  - `created_at` (timestamptz) - When the accident was detected
  - `resolved_at` (timestamptz, optional) - When the alert was resolved

  ## Security
  - Enable RLS on both tables
  - Public access for emergency contacts (for demo purposes, contacts can be managed by anyone)
  - Public access for accident alerts (for demo purposes, anyone can view/create alerts)
  
  ## Notes
  - This is a demonstration system, so RLS policies are permissive
  - In production, these would be tied to authenticated users
  - Location data is stored in decimal degrees format
*/

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  relationship text NOT NULL DEFAULT 'Emergency Contact',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create accident_alerts table
CREATE TABLE IF NOT EXISTS accident_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  severity text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'Active',
  impact_force numeric,
  alerted_contacts text[],
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Enable RLS
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accident_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emergency_contacts
CREATE POLICY "Anyone can view emergency contacts"
  ON emergency_contacts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert emergency contacts"
  ON emergency_contacts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update emergency contacts"
  ON emergency_contacts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete emergency contacts"
  ON emergency_contacts FOR DELETE
  TO public
  USING (true);

-- RLS Policies for accident_alerts
CREATE POLICY "Anyone can view accident alerts"
  ON accident_alerts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert accident alerts"
  ON accident_alerts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update accident alerts"
  ON accident_alerts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_is_primary ON emergency_contacts(is_primary);
CREATE INDEX IF NOT EXISTS idx_accident_alerts_status ON accident_alerts(status);
CREATE INDEX IF NOT EXISTS idx_accident_alerts_created_at ON accident_alerts(created_at DESC);