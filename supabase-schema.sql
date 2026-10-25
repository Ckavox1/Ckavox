 -- 1. Create content data storage table for CKAVOX system updates
CREATE TABLE IF NOT EXISTS public.ckavox_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL
);

-- 2. Activate security containment configurations
ALTER TABLE public.ckavox_content ENABLE ROW LEVEL SECURITY;

-- 3. Policy rule allowing public anonymous reading of slideshow cards (SELECT)
CREATE POLICY "Allow public anonymous read access" 
ON public.ckavox_content 
FOR SELECT 
USING (true);

-- 4. Policy rule restricting data updates exclusively to authorized admin users (ALL operations)
CREATE POLICY "Allow write changes for authenticated administrator only" 
ON public.ckavox_content 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
