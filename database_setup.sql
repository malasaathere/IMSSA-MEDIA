-- IMSSA Media Database Schema & RLS Policies

-- 1. Profiles Table (Stores user details, roles, and gamification points)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp_number TEXT,
    role TEXT DEFAULT 'Member' CHECK (role IN ('Super Admin', 'Admin', 'Event Coordinator', 'Member')),
    skill_level TEXT DEFAULT 'Beginner' CHECK (skill_level IN ('Beginner', 'Intermediate', 'Pro')),
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
-- Super Admins can update any profile (role changes)
CREATE POLICY "Super Admins can update all profiles." ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Super Admin')
);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, email, role, skill_level)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'username', 
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    'Member', 
    'Beginner'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Events Table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    coordinator_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable by everyone." ON events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events." ON events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Super Admin', 'Admin', 'Event Coordinator'))
);

-- 3. Projects Table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    assigned_to UUID REFERENCES profiles(id),
    monitoring_admin_id UUID REFERENCES profiles(id),
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Ongoing' CHECK (status IN ('Ongoing', 'Completed', 'Overdue')),
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects viewable by everyone." ON projects FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects." ON projects FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Super Admin', 'Admin', 'Event Coordinator'))
);
-- Designers can update status of their own assigned projects
CREATE POLICY "Designers can update own projects." ON projects FOR UPDATE USING (
    assigned_to = auth.uid()
);

-- 4. Revisions & Comments Table
CREATE TABLE project_revisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    text_content TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE project_revisions ENABLE ROW LEVEL SECURITY;
-- All users can see all revisions
CREATE POLICY "Revisions viewable by everyone." ON project_revisions FOR SELECT USING (true);
CREATE POLICY "Users can insert revisions." ON project_revisions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Global Chat Table
CREATE TABLE global_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE global_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages viewable by everyone." ON global_messages FOR SELECT USING (true);
CREATE POLICY "Users can insert messages." ON global_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
