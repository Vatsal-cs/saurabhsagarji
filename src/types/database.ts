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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about_sections: {
        Row: {
          body_en: string | null
          body_hi: string | null
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          intro_en: string | null
          intro_hi: string | null
          is_published: boolean
          photo_1_url: string | null
          photo_2_url: string | null
          published_at: string | null
          slug: string
          title_en: string | null
          title_hi: string
          updated_at: string
        }
        Insert: {
          body_en?: string | null
          body_hi?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          intro_en?: string | null
          intro_hi?: string | null
          is_published?: boolean
          photo_1_url?: string | null
          photo_2_url?: string | null
          published_at?: string | null
          slug: string
          title_en?: string | null
          title_hi: string
          updated_at?: string
        }
        Update: {
          body_en?: string | null
          body_hi?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          intro_en?: string | null
          intro_hi?: string | null
          is_published?: boolean
          photo_1_url?: string | null
          photo_2_url?: string | null
          published_at?: string | null
          slug?: string
          title_en?: string | null
          title_hi?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "about_sections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      about_section_videos: {
        Row: {
          about_section_id: string
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          youtube_video_id: string
        }
        Insert: {
          about_section_id: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          youtube_video_id: string
        }
        Update: {
          about_section_id?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "about_section_videos_about_section_id_fkey"
            columns: ["about_section_id"]
            isOneToOne: false
            referencedRelation: "about_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "about_section_videos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      bhajans: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          is_published: boolean
          published_at: string | null
          updated_at: string
          youtube_url: string
          youtube_video_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          published_at?: string | null
          updated_at?: string
          youtube_url: string
          youtube_video_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          published_at?: string | null
          updated_at?: string
          youtube_url?: string
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bhajans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description_en: string | null
          description_hi: string | null
          display_order: number
          download_url: string | null
          id: string
          is_home_pinned: boolean
          is_published: boolean
          pdf_url: string | null
          preview_pdf_url: string | null
          publication_year: number | null
          published_at: string | null
          purchase_url: string | null
          search_vector: unknown
          slug: string
          title_en: string | null
          title_hi: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_hi?: string | null
          display_order?: number
          download_url?: string | null
          id?: string
          is_home_pinned?: boolean
          is_published?: boolean
          pdf_url?: string | null
          preview_pdf_url?: string | null
          publication_year?: number | null
          published_at?: string | null
          purchase_url?: string | null
          search_vector?: unknown
          slug: string
          title_en?: string | null
          title_hi: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_hi?: string | null
          display_order?: number
          download_url?: string | null
          id?: string
          is_home_pinned?: boolean
          is_published?: boolean
          pdf_url?: string | null
          preview_pdf_url?: string | null
          publication_year?: number | null
          published_at?: string | null
          purchase_url?: string | null
          search_vector?: unknown
          slug?: string
          title_en?: string | null
          title_hi?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          applies_to: string
          created_at: string
          description_en: string | null
          description_hi: string | null
          id: string
          name_en: string | null
          name_hi: string
          slug: string
          updated_at: string
        }
        Insert: {
          applies_to: string
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          id?: string
          name_en?: string | null
          name_hi: string
          slug: string
          updated_at?: string
        }
        Update: {
          applies_to?: string
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          id?: string
          name_en?: string | null
          name_hi?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: unknown
          is_read: boolean
          message: string
          name: string
          phone: string | null
          subject: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          subject?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description_en: string | null
          description_hi: string | null
          end_datetime: string | null
          gallery_album_id: string | null
          id: string
          is_published: boolean
          published_at: string | null
          search_vector: unknown
          slug: string
          start_datetime: string
          title_en: string | null
          title_hi: string
          updated_at: string
          venue_address: string | null
          venue_map_url: string | null
          venue_name: string | null
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_hi?: string | null
          end_datetime?: string | null
          gallery_album_id?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          search_vector?: unknown
          slug: string
          start_datetime: string
          title_en?: string | null
          title_hi: string
          updated_at?: string
          venue_address?: string | null
          venue_map_url?: string | null
          venue_name?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_hi?: string | null
          end_datetime?: string | null
          gallery_album_id?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          search_vector?: unknown
          slug?: string
          start_datetime?: string
          title_en?: string | null
          title_hi?: string
          updated_at?: string
          venue_address?: string | null
          venue_map_url?: string | null
          venue_name?: string | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_gallery_album_fk"
            columns: ["gallery_album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_albums: {
        Row: {
          album_date: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description_en: string | null
          description_hi: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title_en: string | null
          title_hi: string
          updated_at: string
        }
        Insert: {
          album_date?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_hi?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title_en?: string | null
          title_hi: string
          updated_at?: string
        }
        Update: {
          album_date?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_hi?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title_en?: string | null
          title_hi?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_albums_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_photos: {
        Row: {
          album_id: string
          alt_text: string | null
          caption_en: string | null
          caption_hi: string | null
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          image_url: string
        }
        Insert: {
          album_id: string
          alt_text?: string | null
          caption_en?: string | null
          caption_hi?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          image_url: string
        }
        Update: {
          album_id?: string
          alt_text?: string | null
          caption_en?: string | null
          caption_hi?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_photos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          body_en: string | null
          body_hi: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          published_at: string | null
          search_vector: unknown
          slug: string
          title_en: string | null
          title_hi: string
          updated_at: string
        }
        Insert: {
          body_en?: string | null
          body_hi?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          search_vector?: unknown
          slug: string
          title_en?: string | null
          title_hi: string
          updated_at?: string
        }
        Update: {
          body_en?: string | null
          body_hi?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          search_vector?: unknown
          slug?: string
          title_en?: string | null
          title_hi?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value_en: string | null
          value_hi: string | null
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value_en?: string | null
          value_hi?: string | null
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value_en?: string | null
          value_hi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_content_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      teachings: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          is_published: boolean
          pravachan_date: string | null
          published_at: string | null
          updated_at: string
          youtube_url: string
          youtube_video_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          pravachan_date?: string | null
          published_at?: string | null
          updated_at?: string
          youtube_url: string
          youtube_video_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          pravachan_date?: string | null
          published_at?: string | null
          updated_at?: string
          youtube_url?: string
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
