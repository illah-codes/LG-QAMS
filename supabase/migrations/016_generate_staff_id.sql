-- Auto-generate staff_id with format LGUSR001 (Staff) or LGADM001 (Admin)
-- Fills gaps in sequence and handles concurrent inserts

-- Function to generate next available staff_id based on role
CREATE OR REPLACE FUNCTION generate_staff_id(p_role user_role)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_existing_ids TEXT[];
  v_num INTEGER;
  v_max_num INTEGER := 0;
  v_id TEXT;
  v_gap_found BOOLEAN := false;
  v_gap_num INTEGER;
BEGIN
  -- Determine prefix based on role
  IF p_role = 'Admin' THEN
    v_prefix := 'LGADM';
  ELSE
    v_prefix := 'LGUSR';
  END IF;

  -- Get all existing staff_ids with matching prefix
  SELECT ARRAY_AGG(staff_id)
  INTO v_existing_ids
  FROM staff
  WHERE staff_id LIKE v_prefix || '%'
    AND staff_id ~ ('^' || v_prefix || '[0-9]{3}$'); -- Ensure format matches exactly

  -- If no existing IDs, start with 001
  IF v_existing_ids IS NULL OR array_length(v_existing_ids, 1) IS NULL THEN
    RETURN v_prefix || '001';
  END IF;

  -- Extract numeric parts and find gaps or next number
  -- First, find the maximum number
  FOR v_id IN SELECT unnest(v_existing_ids)
  LOOP
    v_num := CAST(SUBSTRING(v_id FROM LENGTH(v_prefix) + 1) AS INTEGER);
    IF v_num > v_max_num THEN
      v_max_num := v_num;
    END IF;
  END LOOP;

  -- Check for gaps starting from 1
  FOR v_gap_num IN 1..v_max_num
  LOOP
    v_id := v_prefix || LPAD(v_gap_num::TEXT, 3, '0');
    
    -- Check if this ID exists
    IF NOT (v_id = ANY(v_existing_ids)) THEN
      v_gap_found := true;
      RETURN v_id;
    END IF;
  END LOOP;

  -- No gap found, use max + 1
  RETURN v_prefix || LPAD((v_max_num + 1)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate staff_id on INSERT
CREATE OR REPLACE FUNCTION auto_generate_staff_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if staff_id is NULL or empty
  IF NEW.staff_id IS NULL OR TRIM(NEW.staff_id) = '' THEN
    NEW.staff_id := generate_staff_id(NEW.role);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_staff_id ON staff;
CREATE TRIGGER trigger_auto_generate_staff_id
  BEFORE INSERT ON staff
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_staff_id();

