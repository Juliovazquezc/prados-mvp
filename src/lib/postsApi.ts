import { supabase } from "@/lib/supabase";
import { Post } from "@/types/database.types";

export interface PostsQueryOptions {
  page: number;
  pageSize: number;
  category?: string;
  search?: string;
  showInHomepage?: boolean;
}

type ApiResponse<T> = {
  data: T;
  error: Error | null;
};

/**
 * Fetch paginated posts with optional filtering
 */
export async function fetchPaginatedPosts({
  page,
  pageSize,
  category,
  search,
  showInHomepage = true,
}: PostsQueryOptions): Promise<ApiResponse<Post[]>> {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (showInHomepage) {
    query = query.eq("show_in_homepage", true);
  }
  if (category && category !== "Todos") {
    query = query.contains("category", [category]);
  }
  if (search) {
    const pattern = `%${search}%`;
    query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  }
  const { data, error } = await query;
  return { data: data || [], error };
}

/**
 * Search posts by title or description
 */
export async function searchPosts(
  searchTerm: string
): Promise<ApiResponse<Post[]>> {
  const pattern = `%${searchTerm}%`;
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .or(`title.ilike.${pattern},description.ilike.${pattern}`)
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}

/**
 * Get featured posts (show_in_homepage = true)
 */
export async function getFeaturedPosts(
  limit = 10
): Promise<ApiResponse<Post[]>> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("show_in_homepage", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

/**
 * Get recent posts
 */
export async function getRecentPosts(limit = 10): Promise<ApiResponse<Post[]>> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(
  category: string,
  limit = 10
): Promise<ApiResponse<Post[]>> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .contains("category", [category])
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: data || [], error };
}
