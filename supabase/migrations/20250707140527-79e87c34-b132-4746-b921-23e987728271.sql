
-- Step 1: Clean up conflicting RLS policies for courses
DROP POLICY IF EXISTS "Allow course creation" ON public.courses;
DROP POLICY IF EXISTS "Allow course updates" ON public.courses;
DROP POLICY IF EXISTS "Allow course viewing" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_own" ON public.courses;
DROP POLICY IF EXISTS "courses_insert_any" ON public.courses;
DROP POLICY IF EXISTS "courses_select_own" ON public.courses;
DROP POLICY IF EXISTS "courses_select_published" ON public.courses;
DROP POLICY IF EXISTS "courses_update_own" ON public.courses;

-- Create simplified, non-conflicting RLS policies for courses
CREATE POLICY "Public can view published courses" ON public.courses
FOR SELECT TO public
USING (is_published = true);

CREATE POLICY "Instructors can manage own courses" ON public.courses
FOR ALL TO authenticated
USING (instructor_id = auth.uid())
WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Super admins can manage all courses" ON public.courses
FOR ALL TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Step 2: Create cascade deletion function for courses
CREATE OR REPLACE FUNCTION public.delete_course_cascade(course_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deletion_log jsonb := '{}';
  course_exists boolean := false;
BEGIN
  -- Check if course exists
  SELECT EXISTS(SELECT 1 FROM public.courses WHERE id = course_id_param) INTO course_exists;
  
  IF NOT course_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Course not found',
      'course_id', course_id_param
    );
  END IF;

  -- Delete related records in correct order
  -- 1. Course progress
  DELETE FROM public.course_progress WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{course_progress}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 2. Enrollments v2
  DELETE FROM public.enrollments_v2 WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{enrollments_v2}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 3. Invoices
  DELETE FROM public.invoices WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{invoices}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 4. Payments v2
  DELETE FROM public.payments_v2 WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{payments_v2}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 5. Certificates
  DELETE FROM public.certificates WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{certificates}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 6. Course teachers
  DELETE FROM public.course_teachers WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{course_teachers}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 7. Course learning outcomes
  DELETE FROM public.course_learning_outcomes WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{course_learning_outcomes}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 8. Course materials
  DELETE FROM public.course_materials WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{course_materials}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 9. Course modules
  DELETE FROM public.course_modules WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{course_modules}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 10. Course ratings
  DELETE FROM public.course_ratings WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{course_ratings}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 11. Old enrollments
  DELETE FROM public.enrollments WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{enrollments}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 12. Payments (old table)
  DELETE FROM public.payments WHERE course_id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{payments}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 13. Finally, delete the main course record
  DELETE FROM public.courses WHERE id = course_id_param;
  deletion_log := jsonb_set(deletion_log, '{courses}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Course deleted successfully',
    'course_id', course_id_param,
    'deletion_log', deletion_log
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'course_id', course_id_param,
      'deletion_log', deletion_log
    );
END;
$$;

-- Step 3: Create cascade deletion function for teachers
CREATE OR REPLACE FUNCTION public.delete_teacher_cascade(teacher_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deletion_log jsonb := '{}';
  teacher_exists boolean := false;
  affected_courses integer := 0;
BEGIN
  -- Check if teacher exists
  SELECT EXISTS(SELECT 1 FROM public.teachers WHERE id = teacher_id_param) INTO teacher_exists;
  
  IF NOT teacher_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Teacher not found',
      'teacher_id', teacher_id_param
    );
  END IF;

  -- Delete related records in correct order
  -- 1. Course teachers associations
  DELETE FROM public.course_teachers WHERE teacher_id = teacher_id_param;
  deletion_log := jsonb_set(deletion_log, '{course_teachers}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  -- 2. Update courses.teacher_id to null
  UPDATE public.courses SET teacher_id = null WHERE teacher_id = teacher_id_param;
  GET DIAGNOSTICS affected_courses = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{courses_teacher_id_updated}', to_jsonb(affected_courses));

  -- 3. Update courses.instructor_id to null if it matches the teacher
  UPDATE public.courses SET instructor_id = null WHERE instructor_id = teacher_id_param;
  GET DIAGNOSTICS affected_courses = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{courses_instructor_id_updated}', to_jsonb(affected_courses));

  -- 4. Finally, delete the main teacher record
  DELETE FROM public.teachers WHERE id = teacher_id_param;
  deletion_log := jsonb_set(deletion_log, '{teachers}', to_jsonb(GET DIAGNOSTICS returned_sqlstate = ROW_COUNT));

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Teacher deleted successfully',
    'teacher_id', teacher_id_param,
    'deletion_log', deletion_log
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'teacher_id', teacher_id_param,
      'deletion_log', deletion_log
    );
END;
$$;

-- Step 4: Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.delete_course_cascade(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_teacher_cascade(uuid) TO authenticated;
