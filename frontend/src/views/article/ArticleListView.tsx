import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  Button,
  Divider,
  Avatar,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { listArticlesArticlesGet, listUsersUsersGet, searchArticlesArticlesSearchGet } from "../../client/sdk.gen";
import type { ArticleRead, UserRead } from "../../client/types.gen";

export default function ArticleListView() {
  const [articles, setArticles] = useState<ArticleRead[]>([]);
  const [users, setUsers] = useState<UserRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const loadArticles = async () => {
    const res = await listArticlesArticlesGet({ throwOnError: true });
    const data = (res as any)?.data ?? res;
    setArticles(data ?? []);
    setIsSearching(false);
  };

  const searchArticles = async (value: string) => {
    if (!value.trim()) {
      loadArticles();
      return;
    }

    setLoading(true);
    setIsSearching(true);

    try {
      const res = await searchArticlesArticlesSearchGet({
        query: {
          query: value,
          limit: 20,
        },
        throwOnError: true,
      });

      const data = (res as any)?.data ?? res;

      // backend returns: ArticleSearchResult[]
      setArticles(data.map((r: any) => r.article));
    } catch {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [articlesRes, usersRes] = await Promise.all([
          listArticlesArticlesGet({ throwOnError: true }),
          listUsersUsersGet({ throwOnError: true }),
        ]);

        const articlesData = (articlesRes as any)?.data ?? articlesRes;
        const usersData = (usersRes as any)?.data ?? usersRes;

        setArticles(articlesData ?? []);
        setUsers(usersData ?? []);
      } catch {
        setError("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const userMap = useMemo(() => {
    return new Map(users.map((u) => [u.id, u]));
  }, [users]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (articles.length === 0) {
    return (
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h6">No articles yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Be the first to create one
        </Typography>

        <Button component={RouterLink} to="/articles/new" variant="contained" sx={{ mt: 2 }}>
          Create Article
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Articles
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") searchArticles(search);
          }}
        />

        <Button variant="contained" onClick={() => searchArticles(search)}>
          Search
        </Button>

        {isSearching && (
          <Button
            variant="text"
            onClick={() => {
              setSearch("");
              loadArticles();
            }}
          >
            Reset
          </Button>
        )}
      </Box>

      <Button component={RouterLink} to="/articles/new" variant="contained" sx={{ mb: 2 }}>
        Create Article
      </Button>

      <Stack spacing={2}>
        {articles.map((article) => {
          const author = userMap.get(article.creator_id);

          return (
            <Paper key={article.id} sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="h6">
                  <RouterLink to={`/articles/${article.id}`}>
                    {article.display_name}
                  </RouterLink>
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {new Date(article.created_at).toLocaleString()} updated {new Date(article.updated_at).toLocaleString()}
                </Typography>

                <Typography variant="body2">
                  {article.text.slice(0, 100)}
                  {article.text.length > 100 ? "..." : ""}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    src={
                      author?.avatar
                        ? `http://localhost:8000/images/${author.avatar.id}/raw`
                        : undefined
                    }
                    sx={{ width: 24, height: 24 }}
                  >
                    {author?.username?.[0]?.toUpperCase()}
                  </Avatar>

                  {author ? (
                    <Typography variant="caption">
                      <RouterLink to={`/users/${author.id}`}>
                        {author.display_name}
                      </RouterLink>
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Unknown author
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
