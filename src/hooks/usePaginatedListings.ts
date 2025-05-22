import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Post } from "@/types/database.types";

/**
 * Hook para paginación de anuncios con filtros de categoría y búsqueda
 */
export const usePaginatedListings = (
  pageSize: number,
  category: string | "Todos",
  search: string
) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Resetear cuando cambian filtros
  useEffect(() => {
    let isMounted = true;
    setLoadingInitial(true);
    const fetchAndSet = async () => {
      const from = 0;
      const to = pageSize - 1;
      let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (category !== "Todos") {
        query = query.contains("category", [category]);
      }
      if (search) {
        const pattern = `%${search}%`;
        query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
      }
      const { data, error } = await query;
      if (error) {
        setLoadingInitial(false);
        return;
      }
      const filtered = data?.filter((post) => post.show_in_homepage) || [];
      if (isMounted) {
        setPosts(filtered);
        setPage(0);
        setHasMore(filtered.length === pageSize);
        setLoadingInitial(false);
      }
    };
    fetchAndSet();
    return () => {
      isMounted = false;
    };
  }, [category, search, pageSize]);

  // Cargar más (scroll infinito)
  const loadMore = async () => {
    if (loadingInitial || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const from = nextPage * pageSize;
    const to = from + pageSize - 1;
    let query = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (category !== "Todos") {
      query = query.contains("category", [category]);
    }
    if (search) {
      const pattern = `%${search}%`;
      query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
    }
    const { data, error } = await query;
    if (error) {
      setLoadingMore(false);
      return;
    }
    const filtered = data?.filter((post) => post.show_in_homepage) || [];
    setPosts((prev) => [...prev, ...filtered]);
    setPage(nextPage);
    setHasMore(filtered.length === pageSize);
    setLoadingMore(false);
  };

  return { posts, hasMore, loadingInitial, loadingMore, loadMore };
};
