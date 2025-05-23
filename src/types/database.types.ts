export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: number;
          category: string[];
          images: string[];
          user_id: string;
          show_in_homepage: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          price: number;
          category: string[];
          images: string[];
          user_id: string;
          show_in_homepage?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          price?: number;
          category?: string[];
          images?: string[];
          user_id?: string;
          show_in_homepage?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type NewPost = Database["public"]["Tables"]["posts"]["Insert"];
export type UpdatePost = Database["public"]["Tables"]["posts"]["Update"];
