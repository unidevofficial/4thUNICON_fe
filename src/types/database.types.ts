/**
 * Supabase 스키마에서 자동 생성된 타입. 직접 수정하지 말 것.
 *
 * 재생성:
 *   npx supabase gen types typescript --project-id wrmmtlzhuhwmcyrhwhiq > src/types/database.types.ts
 */

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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      genre: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inquiry: {
        Row: {
          content: string
          created_at: string | null
          email: string
          id: string
          is_checked: boolean | null
          name: string
          phone: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          email: string
          id?: string
          is_checked?: boolean | null
          name: string
          phone?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          email?: string
          id?: string
          is_checked?: boolean | null
          name?: string
          phone?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project: {
        Row: {
          banner_image: string | null
          created_at: string | null
          description: string | null
          download_url: string | null
          gallery_images: string[] | null
          id: string
          platform: string[] | null
          sheet_no: number | null
          team_name: string | null
          team_type: string
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          banner_image?: string | null
          created_at?: string | null
          description?: string | null
          download_url?: string | null
          gallery_images?: string[] | null
          id?: string
          platform?: string[] | null
          sheet_no?: number | null
          team_name?: string | null
          team_type: string
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          banner_image?: string | null
          created_at?: string | null
          description?: string | null
          download_url?: string | null
          gallery_images?: string[] | null
          id?: string
          platform?: string[] | null
          sheet_no?: number | null
          team_name?: string | null
          team_type?: string
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      project_genre: {
        Row: {
          created_at: string | null
          genre_id: string
          id: string
          project_id: string
        }
        Insert: {
          created_at?: string | null
          genre_id: string
          id?: string
          project_id: string
        }
        Update: {
          created_at?: string | null
          genre_id?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_genre_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genre"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_genre_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_genre_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_with_genres"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      project_with_genres: {
        Row: {
          banner_image: string | null
          created_at: string | null
          description: string | null
          download_url: string | null
          genre_ids: string[] | null
          genres: string[] | null
          id: string | null
          platform: string[] | null
          sheet_no: number | null
          team_name: string | null
          team_type: string | null
          title: string | null
          updated_at: string | null
          video_url: string | null
          gallery_images: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_comment: {
        Args: {
          p_code: string
          p_content: string
          p_edit_pin?: string
          p_hide_org?: boolean
          p_job_title?: string
          p_project_id: string
        }
        Returns: { edit_pin: string; id: string }[]
      }
      delete_comment: {
        Args: { p_code: string; p_comment_id: string; p_edit_pin: string }
        Returns: undefined
      }
      delete_project: { Args: { p_id: string }; Returns: string[] }
      admin_list_comment_orgs: {
        Args: never
        Returns: {
          id: string
          name: string
          code: string
          is_active: boolean
          comment_count: number
          created_at: string
        }[]
      }
      admin_upsert_comment_org: {
        Args: {
          p_code: string
          p_id?: string
          p_is_active?: boolean
          p_name: string
        }
        Returns: string
      }
      admin_delete_comment_org: { Args: { p_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      list_comments: {
        Args: {
          p_code: string
          p_page?: number
          p_page_size?: number
          p_project_id: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          is_edited: boolean
          job_title: string | null
          org_name: string | null
          total_count: number
        }[]
      }
      update_comment: {
        Args: {
          p_code: string
          p_comment_id: string
          p_content: string
          p_edit_pin: string
          p_hide_org?: boolean
          p_job_title?: string
        }
        Returns: undefined
      }
      verify_comment_code: {
        Args: { p_code: string }
        Returns: { org_id: string; org_name: string }[]
      }
      upsert_project: {
        Args: {
          p_banner_image?: string
          p_description?: string
          p_download_url?: string
          p_gallery_images?: string[]
          p_genres?: string[]
          p_id?: string
          p_platform?: string[]
          p_sheet_no?: number
          p_team_name?: string
          p_team_type: string
          p_title: string
          p_video_url?: string
        }
        Returns: string
      }
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
