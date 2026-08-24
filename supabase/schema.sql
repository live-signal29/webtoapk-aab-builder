-- 1. UUID Extension Enable karein
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Users & Plans)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'free', -- Options: 'free', 'starter_3', 'pro_7', 'vip_15'
    builds_remaining INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BUILDS TABLE (Application Conversion Requests)
CREATE TABLE IF NOT EXISTS public.builds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    app_name TEXT NOT NULL,
    website_url TEXT NOT NULL,
    package_name TEXT NOT NULL,
    app_version TEXT DEFAULT '1.0.0',
    icon_url TEXT,
    splash_url TEXT,
    onesignal_id TEXT,
    admob_id TEXT,
    build_format TEXT NOT NULL, -- Options: 'apk', 'aab', 'both'
    status TEXT DEFAULT 'pending', -- Options: 'pending', 'building', 'completed', 'failed'
    apk_download_url TEXT,
    aab_download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can view own builds" 
ON public.builds FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own builds" 
ON public.builds FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. STORAGE BUCKETS (Icons & Generated Files)
INSERT INTO storage.buckets (id, name, public) VALUES ('app-assets', 'app-assets', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('build-outputs', 'build-outputs', true) ON CONFLICT DO NOTHING;
