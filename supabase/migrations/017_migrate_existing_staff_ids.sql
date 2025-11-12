-- Migrate existing staff records to new ID format (LGUSR001/LGADM001)
-- Preserves order where possible (oldest staff get lower numbers)

DO $$
DECLARE
  v_staff RECORD;
  v_new_id TEXT;
  v_prefix TEXT;
  v_existing_ids TEXT[];
  v_num INTEGER;
  v_max_num INTEGER := 0;
  v_id TEXT;
  v_gap_found BOOLEAN;
  v_gap_num INTEGER;
  v_processed_count INTEGER := 0;
BEGIN
  -- Process staff in order (oldest first to preserve order)
  FOR v_staff IN 
    SELECT id, role, staff_id, created_at
    FROM staff
    ORDER BY created_at ASC, id ASC
  LOOP
    -- Skip if already in correct format
    IF v_staff.staff_id ~ '^(LGUSR|LGADM)[0-9]{3}$' THEN
      CONTINUE;
    END IF;

    -- Determine prefix based on role
    IF v_staff.role = 'Admin' THEN
      v_prefix := 'LGADM';
    ELSE
      v_prefix := 'LGUSR';
    END IF;

    -- Get all existing staff_ids with matching prefix (including already migrated ones)
    SELECT ARRAY_AGG(staff_id)
    INTO v_existing_ids
    FROM staff
    WHERE staff_id LIKE v_prefix || '%'
      AND staff_id ~ ('^' || v_prefix || '[0-9]{3}$');

    -- Initialize variables for gap finding
    v_max_num := 0;
    v_gap_found := false;
    v_new_id := NULL;

    -- If no existing IDs, start with 001
    IF v_existing_ids IS NULL OR array_length(v_existing_ids, 1) IS NULL THEN
      v_new_id := v_prefix || '001';
    ELSE
      -- Find maximum number
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
          v_new_id := v_id;
          EXIT;
        END IF;
      END LOOP;

      -- No gap found, use max + 1
      IF NOT v_gap_found THEN
        v_new_id := v_prefix || LPAD((v_max_num + 1)::TEXT, 3, '0');
      END IF;
    END IF;

    -- Update staff record with new ID
    UPDATE staff
    SET staff_id = v_new_id
    WHERE id = v_staff.id;

    v_processed_count := v_processed_count + 1;
  END LOOP;

  RAISE NOTICE 'Migrated % staff records to new ID format', v_processed_count;
END $$;

