import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Avatar,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import {
  listArticlesArticlesGet,
  listUsersUsersGet,
  listImagesImagesGet,
} from "../client/sdk.gen";

import type {
  ArticleRead,
  UserRead,
  ImageRead,
} from "../client/types.gen";

export default function MainView() {
  const [articles, setArticles] = useState<ArticleRead[]>([]);
  const [users, setUsers] = useState<UserRead[]>([]);
  const [images, setImages] = useState<ImageRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [a, u, i] = await Promise.all([
          listArticlesArticlesGet({ throwOnError: true }),
          listUsersUsersGet({ throwOnError: true }),
          listImagesImagesGet({ throwOnError: true }),
        ]);

        setArticles(((a as any)?.data ?? a)?.slice(0, 5) ?? []);
        setUsers(((u as any)?.data ?? u)?.slice(0, 5) ?? []);
        setImages(((i as any)?.data ?? i)?.slice(0, 6) ?? []);
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

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Stack spacing={3}>
        {/* ARTICLES */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Random Articles</Typography>
          <Divider sx={{ my: 1 }} />

          <Stack spacing={1}>
            {articles.map((a) => (
              <Box key={a.id}>
                <Typography
                  component={RouterLink}
                  to={`/articles/${a.id}`}
                  sx={{ textDecoration: "none", fontWeight: 500 }}
                >
                  {a.display_name}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {a.text.slice(0, 80)}...
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* IMAGES */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Random Images</Typography>
          <Divider sx={{ my: 1 }} />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {images.map((img) => (
              <Box
                key={img.id}
                component="img"
                src={`http://localhost:8000/images/${img.id}/raw`}
                sx={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 1,
                }}
              />
            ))}
          </Stack>
        </Paper>

        {/* USERS */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Random Users</Typography>
          <Divider sx={{ my: 1 }} />

          <Stack direction="row" spacing={2}>
            {users.map((u) => (
              <Stack
                key={u.id}
                alignItems="center"
                component={RouterLink}
                to={`/users/${u.id}`}
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <Avatar
                  src={
                    u.avatar
                      ? `http://localhost:8000/images/${u.avatar.id}/raw`
                      : undefined
                  }
                >
                  {u.username[0]?.toUpperCase()}
                </Avatar>

                <Typography variant="caption">
                  {u.display_name}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

      </Stack>
    </Box>
  );
}
