import { useEffect, useMemo, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  CircularProgress,
  Paper,
} from "@mui/material";

import {
  getArticleArticlesArticleIdGet,
  listUsersUsersGet,
} from "../../client/sdk.gen";

import type { ArticleRead, UserRead } from "../../client/types.gen";

export default function ArticleView() {
  const { id } = useParams();

  const [article, setArticle] = useState<ArticleRead | null>(null);
  const [users, setUsers] = useState<UserRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const [articleRes, usersRes] = await Promise.all([
          getArticleArticlesArticleIdGet({
            path: { article_id: id },
            throwOnError: true,
          }),
          listUsersUsersGet({ throwOnError: true }),
        ]);

        const articleData = (articleRes as any)?.data ?? articleRes;
        const usersData = (usersRes as any)?.data ?? usersRes;

        setArticle(articleData);
        setUsers(usersData ?? []);
      } catch {
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

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

  if (error || !article) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">
          {error ?? "Article not found"}
        </Typography>
      </Box>
    );
  }

  const author = userMap.get(article.creator_id);

  return (
    <Box>
      {/* HERO SECTION */}
      <Box sx={{ position: "relative", height: 320, overflow: "hidden" }}>
        {article.background_image && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(http://localhost:8000/images/${article.background_image.id}/raw)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px)",
              transform: "scale(1.2)",
            }}
          />
        )}

        {/* dark overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
        />

        {/* PRIMARY IMAGE */}
        <Box
          sx={{
            position: "relative",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {article.primary_image && (
            <Box
              component="img"
              src={`http://localhost:8000/images/${article.primary_image.id}/raw`}
              sx={{
                maxHeight: 500,
                maxWidth: "90%",
                borderRadius: 2,
                boxShadow: 6,
              }}
            />
          )}
        </Box>
      </Box>

      {/* CONTENT */}
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 3, px: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {article.display_name}
          </Typography>

          {/* metadata */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Created {new Date(article.created_at).toLocaleString()}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Updated {new Date(article.updated_at).toLocaleString()}
            </Typography>
          </Stack>

          {/* author */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <Avatar
              src={
                author?.avatar
                  ? `http://localhost:8000/images/${author.avatar.id}/raw`
                  : undefined
              }
              sx={{ width: 28, height: 28 }}
            >
              {author?.username?.[0]?.toUpperCase()}
            </Avatar>

            {author ? (
              <Typography variant="body2">
                <RouterLink to={`/users/${author.id}`}>
                  {author.display_name}
                </RouterLink>
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Unknown author
              </Typography>
            )}
          </Stack>

          {/* text */}
          <Typography
            variant="body1"
            sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
          >
            {article.text}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
