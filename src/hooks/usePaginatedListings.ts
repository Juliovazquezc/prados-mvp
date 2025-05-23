import { useState, useEffect } from "react";
import { Post } from "@/types/database.types";
import { fetchPaginatedPosts } from "@/lib/postsApi";

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

  useEffect(() => {
    let isMounted = true;
    setLoadingInitial(true);

    const fetchAndSet = async () => {
      const { data, error } = await fetchPaginatedPosts({
        page: 0,
        pageSize,
        category,
        search,
        showInHomepage: true,
      });
      if (error) {
        setLoadingInitial(false);
        return;
      }
      if (isMounted) {
        setPosts(data);
        setPage(0);
        setHasMore(data.length === pageSize);
        setLoadingInitial(false);
      }
    };
    fetchAndSet();
    return () => {
      isMounted = false;
    };
  }, [category, search, pageSize]);

  const loadMore = async () => {
    if (loadingInitial || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data, error } = await fetchPaginatedPosts({
      page: nextPage,
      pageSize,
      category,
      search,
      showInHomepage: true,
    });
    if (error) {
      setLoadingMore(false);
      return;
    }
    setPosts((prev) => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(data.length === pageSize);
    setLoadingMore(false);
  };

  return { posts, hasMore, loadingInitial, loadingMore, loadMore };
};
