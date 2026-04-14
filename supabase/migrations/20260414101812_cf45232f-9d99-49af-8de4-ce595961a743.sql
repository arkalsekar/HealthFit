CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  fullname TEXT,
  email TEXT,
  phone TEXT,
  age INTEGER,
  weight NUMERIC(5,1),
  height NUMERIC(5,1),
  bmi NUMERIC(4,1),
  dietary_preference TEXT DEFAULT 'none',
  food_preferences TEXT[] DEFAULT '{}',
  health_conditions TEXT[] DEFAULT '{}',
  goals TEXT DEFAULT 'maintenance',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, fullname)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  calories NUMERIC(7,1) DEFAULT 0,
  macros JSONB DEFAULT '{"carbs": 0, "protein": 0, "fats": 0}',
  micros JSONB DEFAULT '{"vitamins": {}, "minerals": {}}',
  glycemic_index INTEGER,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read meals" ON public.meals FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert meals" ON public.meals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE public.user_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id UUID REFERENCES public.meals(id),
  meal_name TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT DEFAULT 'snack',
  total_calories NUMERIC(7,1) DEFAULT 0,
  nutrients JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" ON public.user_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.user_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own logs" ON public.user_logs FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_logs_user_date ON public.user_logs(user_id, date);