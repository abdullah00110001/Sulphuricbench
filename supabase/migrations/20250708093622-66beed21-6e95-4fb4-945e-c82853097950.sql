
-- Create the delete_teacher_cascade function that's referenced in the code
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
  GET DIAGNOSTICS affected_courses = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{course_teachers}', to_jsonb(affected_courses));

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
  GET DIAGNOSTICS affected_courses = ROW_COUNT;
  deletion_log := jsonb_set(deletion_log, '{teachers}', to_jsonb(affected_courses));

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

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.delete_teacher_cascade(uuid) TO authenticated;
