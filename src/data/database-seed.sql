-- Database schema and seed data for Growth Path Genius

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_number TEXT UNIQUE NOT NULL,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  overall_progress INTEGER NOT NULL DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning records table
CREATE TABLE IF NOT EXISTS learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
  learning_date DATE NOT NULL,
  demo_date DATE,
  demo_status TEXT CHECK (demo_status IN ('pending', 'completed', 'yes-to-do')),
  quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
  xmp_topic TEXT,
  xmp_assignment TEXT,
  xmp_status TEXT CHECK (xmp_status IN ('pending', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('performance', 'recommendation', 'trend')),
  content TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Students policies
CREATE POLICY "Students can view their own record" ON students
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'instructor')
  );

CREATE POLICY "Students can update their own record" ON students
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Instructors can view all students" ON students
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'instructor')
  );

-- Learning records policies
CREATE POLICY "Students can manage their own learning records" ON learning_records
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'instructor')
  );

-- Attendance records policies
CREATE POLICY "Students can manage their own attendance" ON attendance_records
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'instructor')
  );

-- AI insights policies
CREATE POLICY "Students can view their own insights" ON ai_insights
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'instructor')
  );

CREATE POLICY "System can insert AI insights" ON ai_insights
  FOR INSERT WITH CHECK (true);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_records_updated_at BEFORE UPDATE ON learning_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (50 students)
DO $$
DECLARE
  instructor_id UUID;
  student_user_id UUID;
  student_id UUID;
  i INTEGER;
  topics TEXT[] := ARRAY[
    'Introduction to HTML',
    'CSS Fundamentals', 
    'JavaScript Basics',
    'React Fundamentals',
    'Node.js Basics',
    'Database Design',
    'API Development',
    'Testing & Debugging',
    'Deployment Strategies',
    'Version Control with Git'
  ];
  statuses TEXT[] := ARRAY['not-started', 'in-progress', 'completed'];
  demo_statuses TEXT[] := ARRAY['pending', 'completed', 'yes-to-do'];
  attendance_statuses TEXT[] := ARRAY['present', 'absent', 'late'];
BEGIN
  -- Create instructor user (for demo purposes)
  INSERT INTO auth.users (id, email) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'instructor@demo.com')
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO users (id, email, full_name, role) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'instructor@demo.com', 'Demo Instructor', 'instructor')
  ON CONFLICT (id) DO NOTHING;

  -- Generate 50 sample students
  FOR i IN 1..50 LOOP
    -- Create auth user
    student_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (id, email) VALUES 
      (student_user_id, 'student' || i || '@demo.com')
    ON CONFLICT (email) DO NOTHING;
    
    -- Create user profile
    INSERT INTO users (id, email, full_name, role) VALUES 
      (student_user_id, 'student' || i || '@demo.com', 'Student ' || i, 'student')
    ON CONFLICT (id) DO NOTHING;
    
    -- Create student record
    INSERT INTO students (user_id, student_number, overall_progress, streak_days, last_activity)
    VALUES (
      student_user_id,
      'STU' || LPAD(i::TEXT, 4, '0'),
      (RANDOM() * 100)::INTEGER,
      (RANDOM() * 30)::INTEGER,
      CURRENT_DATE - (RANDOM() * 7)::INTEGER
    )
    RETURNING id INTO student_id;
    
    -- Create 3-8 learning records per student
    FOR j IN 1..(3 + (RANDOM() * 5)::INTEGER) LOOP
      INSERT INTO learning_records (
        student_id,
        topic,
        status,
        learning_date,
        demo_date,
        demo_status,
        quiz_score,
        xmp_topic,
        xmp_assignment,
        xmp_status
      ) VALUES (
        student_id,
        topics[(RANDOM() * (array_length(topics, 1) - 1))::INTEGER + 1],
        statuses[(RANDOM() * (array_length(statuses, 1) - 1))::INTEGER + 1],
        CURRENT_DATE - (RANDOM() * 30)::INTEGER,
        CASE WHEN RANDOM() > 0.5 THEN CURRENT_DATE - (RANDOM() * 20)::INTEGER ELSE NULL END,
        CASE WHEN RANDOM() > 0.5 THEN demo_statuses[(RANDOM() * (array_length(demo_statuses, 1) - 1))::INTEGER + 1] ELSE NULL END,
        CASE WHEN RANDOM() > 0.3 THEN (60 + RANDOM() * 40)::INTEGER ELSE NULL END,
        CASE WHEN RANDOM() > 0.6 THEN 'Professional Development' ELSE NULL END,
        CASE WHEN RANDOM() > 0.6 THEN 'Project Assignment ' || j ELSE NULL END,
        CASE WHEN RANDOM() > 0.5 THEN 'completed' ELSE 'pending' END
      );
    END LOOP;
    
    -- Create attendance records for the last 30 days
    FOR j IN 0..29 LOOP
      IF RANDOM() > 0.1 THEN -- 90% chance of having attendance record
        INSERT INTO attendance_records (student_id, date, status)
        VALUES (
          student_id,
          CURRENT_DATE - j,
          attendance_statuses[(RANDOM() * (array_length(attendance_statuses, 1) - 1))::INTEGER + 1]
        );
      END IF;
    END LOOP;
    
  END LOOP;
END $$;