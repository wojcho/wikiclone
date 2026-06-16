import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  Button,
  Divider,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { listArticlesArticlesGet } from "../../client/sdk.gen";
import type { ArticleRead } from "../../client/types.gen";

export default function ArticleListView() {
  const [articles, setArticles] = useState<ArticleRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await listArticlesArticlesGet({
          throwOnError: true,
        });

        // hey-api returns response shape like { data, response }
        const data = (res as any)?.data ?? res;

        setArticles(data ?? []);
      } catch (err) {
        setError("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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

        <Button
          component={RouterLink}
          to="/articles/new"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Create Article
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Articles
      </Typography>

      <Stack spacing={2}>
        {articles.map((article) => (
          <Paper key={article.id} sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">
                <RouterLink to={`/articles/${article.id}`}>
                  {article.display_name}
                </RouterLink>
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {new Date(article.created_at).toLocaleString()} · updated{" "}
                {new Date(article.updated_at).toLocaleString()}
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                {article.text.slice(0, 100)}
                {article.text.length > 100 ? "..." : ""}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Typography variant="caption" color="text.secondary">
                Author: {article.creator_id}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
