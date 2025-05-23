import { supabase } from "@/lib/supabase";
import { Post } from "@/types/database.types";

export interface PostsQueryOptions {
  page: number;
  pageSize: number;
  category?: string;
  search?: string;
  showInHomepage?: boolean;
}

export async function fetchPaginatedPosts({
  page,
  pageSize,
  category,
  search,
  showInHomepage = true,
}: // eslint-disable-next-line
PostsQueryOptions): Promise<{ data: Post[]; error: any }> {
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
