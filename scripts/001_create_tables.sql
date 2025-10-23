-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  semester VARCHAR(20),
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_materials_course_id ON materials(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);

-- Insert some sample courses
INSERT INTO courses (code, name, department, description) VALUES
  ('CMPS200', 'Introduction to Computer Science', 'Computer Science', 'Fundamental concepts of computer science and programming'),
  ('MATH201', 'Calculus I', 'Mathematics', 'Limits, derivatives, and integrals'),
  ('PHYS210', 'General Physics I', 'Physics', 'Mechanics and thermodynamics'),
  ('ECON201', 'Principles of Economics', 'Economics', 'Microeconomics and macroeconomics fundamentals'),
  ('ENGL202', 'English Composition', 'English', 'Academic writing and critical thinking')
ON CONFLICT (code) DO NOTHING;
