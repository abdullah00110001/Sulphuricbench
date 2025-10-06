export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_attachments: {
        Row: {
          blog_id: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
        }
        Insert: {
          blog_id?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
        }
        Update: {
          blog_id?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_attachments_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      blog_tags_relation: {
        Row: {
          blog_id: string | null
          id: string
          tag_id: string | null
        }
        Insert: {
          blog_id?: string | null
          id?: string
          tag_id?: string | null
        }
        Update: {
          blog_id?: string | null
          id?: string
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_tags_relation_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_tags_relation_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_upvotes: {
        Row: {
          blog_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          blog_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          blog_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_upvotes_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          author_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          author_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          author_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_url: string | null
          course_id: string | null
          id: string
          issued_at: string | null
          user_id: string | null
        }
        Insert: {
          certificate_url?: string | null
          course_id?: string | null
          id?: string
          issued_at?: string | null
          user_id?: string | null
        }
        Update: {
          certificate_url?: string | null
          course_id?: string | null
          id?: string
          issued_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          parent_id: string | null
          target_id: string
          target_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
          target_id: string
          target_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          parent_id?: string | null
          target_id?: string
          target_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          course_id: string | null
          discount_applied: number
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          course_id?: string | null
          discount_applied: number
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          course_id?: string | null
          discount_applied?: number
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_courses: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          discount_type: string
          id: string
          is_active: boolean
          minimum_amount: number | null
          updated_at: string | null
          usage_count: number
          usage_limit: number
          valid_from: string
          valid_until: string
        }
        Insert: {
          applicable_courses?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          discount_type: string
          id?: string
          is_active?: boolean
          minimum_amount?: number | null
          updated_at?: string | null
          usage_count?: number
          usage_limit?: number
          valid_from: string
          valid_until: string
        }
        Update: {
          applicable_courses?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          discount_type?: string
          id?: string
          is_active?: boolean
          minimum_amount?: number | null
          updated_at?: string | null
          usage_count?: number
          usage_limit?: number
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      course_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      course_learning_outcomes: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          outcome: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          outcome: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          outcome?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_learning_outcomes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_materials: {
        Row: {
          course_id: string | null
          created_at: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          content: string | null
          course_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          order_index: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          completed_at: string | null
          course_id: string | null
          created_at: string
          id: string
          last_accessed: string | null
          module_id: string | null
          progress_percentage: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          last_accessed?: string | null
          module_id?: string | null
          progress_percentage?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          last_accessed?: string | null
          module_id?: string | null
          progress_percentage?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_ratings: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          rating: number
          review: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          rating: number
          review?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          rating?: number
          review?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_ratings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_teachers: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          role: string | null
          teacher_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          role?: string | null
          teacher_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          role?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_teachers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          about_course: string | null
          available_batches: string[] | null
          category_id: string | null
          course_validity: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration_hours: number | null
          id: string
          instructor_bio: string | null
          instructor_id: string | null
          instructors: string[] | null
          is_featured: boolean | null
          is_published: boolean | null
          learning_outcomes: string[] | null
          preview_video_url: string | null
          price: number
          secret_group_link: string | null
          teacher_id: string | null
          thumbnail_url: string | null
          title: string
          total_modules: number | null
          total_students: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          about_course?: string | null
          available_batches?: string[] | null
          category_id?: string | null
          course_validity?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          id?: string
          instructor_bio?: string | null
          instructor_id?: string | null
          instructors?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          learning_outcomes?: string[] | null
          preview_video_url?: string | null
          price?: number
          secret_group_link?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          title: string
          total_modules?: number | null
          total_students?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          about_course?: string | null
          available_batches?: string[] | null
          category_id?: string | null
          course_validity?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          id?: string
          instructor_bio?: string | null
          instructor_id?: string | null
          instructors?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          learning_outcomes?: string[] | null
          preview_video_url?: string | null
          price?: number
          secret_group_link?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          title?: string
          total_modules?: number | null
          total_students?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string | null
          enrolled_at: string | null
          id: string
          progress_percentage: number | null
          student_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          student_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments_v2: {
        Row: {
          batch: string | null
          course_id: string
          created_at: string | null
          email: string
          enrollment_status: string | null
          id: string
          institution: string | null
          name: string
          phone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          batch?: string | null
          course_id: string
          created_at?: string | null
          email: string
          enrollment_status?: string | null
          id?: string
          institution?: string | null
          name: string
          phone: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          batch?: string | null
          course_id?: string
          created_at?: string | null
          email?: string
          enrollment_status?: string | null
          id?: string
          institution?: string | null
          name?: string
          phone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_enrollments_v2_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_enrollments_v2_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          created_by: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category: string
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          access_code: string
          amount: number
          course_id: string
          created_at: string | null
          enrollment_id: string | null
          id: string
          invoice_number: string
          issued_at: string | null
          payment_id: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          user_id: string | null
        }
        Insert: {
          access_code: string
          amount: number
          course_id: string
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          invoice_number: string
          issued_at?: string | null
          payment_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          user_id?: string | null
        }
        Update: {
          access_code?: string
          amount?: number
          course_id?: string
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string | null
          payment_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoices_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoices_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_content: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean
          title: string
          type: string
          updated_at: string | null
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          title: string
          type: string
          updated_at?: string | null
          version?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          title?: string
          type?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      manual_payments: {
        Row: {
          amount: number
          bkash_number: string
          course_id: string
          created_at: string
          full_name: string
          id: string
          payment_method: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transaction_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          bkash_number: string
          course_id: string
          created_at?: string
          full_name: string
          id?: string
          payment_method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          bkash_number?: string
          course_id?: string
          created_at?: string
          full_name?: string
          id?: string
          payment_method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_manual_payments_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_manual_payments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          audience: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          recipient_count: number | null
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          audience?: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipient_count?: number | null
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          audience?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipient_count?: number | null
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          bkash_enabled: boolean
          bkash_instructions: string | null
          created_at: string
          id: string
          sslcommerz_enabled: boolean
          sslcommerz_store_id: string | null
          sslcommerz_store_password: string | null
          updated_at: string
        }
        Insert: {
          bkash_enabled?: boolean
          bkash_instructions?: string | null
          created_at?: string
          id?: string
          sslcommerz_enabled?: boolean
          sslcommerz_store_id?: string | null
          sslcommerz_store_password?: string | null
          updated_at?: string
        }
        Update: {
          bkash_enabled?: boolean
          bkash_instructions?: string | null
          created_at?: string
          id?: string
          sslcommerz_enabled?: boolean
          sslcommerz_store_id?: string | null
          sslcommerz_store_password?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          phone_number: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          phone_number?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          phone_number?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_v2: {
        Row: {
          amount: number
          course_id: string
          created_at: string | null
          currency: string | null
          enrollment_id: string | null
          gateway_response: Json | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
          val_id: string | null
        }
        Insert: {
          amount: number
          course_id: string
          created_at?: string | null
          currency?: string | null
          enrollment_id?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          val_id?: string | null
        }
        Update: {
          amount?: number
          course_id?: string
          created_at?: string | null
          currency?: string | null
          enrollment_id?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          val_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_v2_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payments_v2_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_v2_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          email_verified: boolean | null
          full_name: string
          id: string
          level: number | null
          location: string | null
          phone: string | null
          points: number | null
          role: Database["public"]["Enums"]["user_role"]
          social_links: Json | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          email_verified?: boolean | null
          full_name: string
          id: string
          level?: number | null
          location?: string | null
          phone?: string | null
          points?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string
          id?: string
          level?: number | null
          location?: string | null
          phone?: string | null
          points?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          rating: number
          review_text: string
          updated_at: string | null
          user_avatar: string | null
          user_company: string | null
          user_id: string | null
          user_name: string
          user_role: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating: number
          review_text: string
          updated_at?: string | null
          user_avatar?: string | null
          user_company?: string | null
          user_id?: string | null
          user_name: string
          user_role?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating?: number
          review_text?: string
          updated_at?: string | null
          user_avatar?: string | null
          user_company?: string | null
          user_id?: string | null
          user_name?: string
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      teacher_applications: {
        Row: {
          created_at: string
          experience: string
          id: string
          notes: string | null
          portfolio_url: string | null
          qualifications: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          experience: string
          id?: string
          notes?: string | null
          portfolio_url?: string | null
          qualifications: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          experience?: string
          id?: string
          notes?: string | null
          portfolio_url?: string | null
          qualifications?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      teacher_applications_v2: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string
          experience: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          portfolio_url: string | null
          qualifications: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email: string
          experience: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          portfolio_url?: string | null
          qualifications: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string
          experience?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          portfolio_url?: string | null
          qualifications?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_applications_v2_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_applications_v2_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_registrations: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string
          experience: string
          full_name: string
          id: string
          phone: string | null
          portfolio_url: string | null
          qualifications: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email: string
          experience: string
          full_name: string
          id?: string
          phone?: string | null
          portfolio_url?: string | null
          qualifications: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string
          experience?: string
          full_name?: string
          id?: string
          phone?: string | null
          portfolio_url?: string | null
          qualifications?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          experience_years: number | null
          full_name: string
          id: string
          image_url: string | null
          institution: string | null
          is_active: boolean | null
          qualifications: string | null
          specializations: string[] | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          full_name: string
          id?: string
          image_url?: string | null
          institution?: string | null
          is_active?: boolean | null
          qualifications?: string | null
          specializations?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          full_name?: string
          id?: string
          image_url?: string | null
          institution?: string | null
          is_active?: boolean | null
          qualifications?: string | null
          specializations?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          code_type: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used_at: string | null
        }
        Insert: {
          code: string
          code_type?: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          used_at?: string | null
        }
        Update: {
          code?: string
          code_type?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used_at?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string | null
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id?: string | null
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string | null
          vote_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_manual_payment: {
        Args: { course_id: string; payment_id: string; user_id: string }
        Returns: undefined
      }
      change_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          user_id_param: string
        }
        Returns: undefined
      }
      change_user_role_by_admin: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      delete_course_cascade: {
        Args: { course_id_param: string }
        Returns: Json
      }
      delete_teacher_cascade: {
        Args: { teacher_id_param: string }
        Returns: Json
      }
      email_to_uuid: {
        Args: { email_param: string }
        Returns: string
      }
      ensure_super_admin_profile: {
        Args: { admin_email: string; admin_name?: string }
        Returns: string
      }
      generate_access_code: {
        Args: { batch_param: string; user_name: string }
        Returns: string
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_verification_code: {
        Args:
          | { code_type: string; user_id_param: string }
          | { code_type_param?: string; email_param: string }
        Returns: string
      }
      get_course_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          average_progress: number
          completion_rate: number
          course_id: string
          course_title: string
          enrollment_count: number
          instructor_name: string
        }[]
      }
      get_course_with_ratings: {
        Args: { course_id_param?: string }
        Returns: {
          average_rating: number
          category_name: string
          course_id: string
          instructor_name: string
          price: number
          thumbnail_url: string
          title: string
          total_ratings: number
          total_students: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          pending_teachers: number
          today_signups: number
          total_courses: number
          total_students: number
          total_teachers: number
          total_users: number
        }[]
      }
      get_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          completed_courses: number
          full_name: string
          level: number
          points: number
          total_blogs: number
          total_upvotes: number
          user_id: string
        }[]
      }
      get_manual_payments_with_courses: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number
          bkash_number: string
          course_id: string
          courses: Json
          created_at: string
          email: string
          full_name: string
          id: string
          status: string
          transaction_id: string
          user_id: string
        }[]
      }
      get_user_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_courses: number
          daily_signups: number
          pending_teachers: number
          total_students: number
          total_super_admins: number
          total_teachers: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      insert_manual_payment: {
        Args: {
          amount: number
          bkash_number: string
          course_id: string
          full_name: string
          payment_method?: string
          transaction_id: string
          user_id: string
        }
        Returns: undefined
      }
      is_current_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_super_admin_enhanced: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_service_role_or_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin_user: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      reject_manual_payment: {
        Args: { payment_id: string }
        Returns: undefined
      }
      super_admin_login: {
        Args: { email_param: string; password_param: string }
        Returns: {
          message: string
          success: boolean
          user_data: Json
        }[]
      }
      update_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      verify_code: {
        Args: { code_param: string; code_type: string; user_id_param: string }
        Returns: boolean
      }
      verify_email_code: {
        Args: { code_param: string; email_param: string }
        Returns: boolean
      }
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected"
      invoice_status: "valid" | "invalid" | "pending"
      payment_method: "bkash" | "nagad" | "sslcommerz"
      payment_status: "pending" | "completed" | "failed"
      user_role: "student" | "teacher" | "admin" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_status: ["pending", "approved", "rejected"],
      invoice_status: ["valid", "invalid", "pending"],
      payment_method: ["bkash", "nagad", "sslcommerz"],
      payment_status: ["pending", "completed", "failed"],
      user_role: ["student", "teacher", "admin", "super_admin"],
    },
  },
} as const
