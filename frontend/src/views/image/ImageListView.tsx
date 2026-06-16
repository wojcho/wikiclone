import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Button,
  Grid,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { listImagesImagesGet } from "../../client/sdk.gen";
import type { ImageRead } from "../../client/types.gen";

export default function ImageListView() {
  const [images, setImages] = useState<ImageRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await listImagesImagesGet({
          throwOnError: true,
        });

        const data = (res as any)?.data ?? res;
        setImages(data ?? []);
      } catch {
        setError("Failed to load images");
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

  if (images.length === 0) {
    return (
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h6">No images yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Upload an image to get started
        </Typography>

        <Button
          component={RouterLink}
          to="/images/new"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Upload Image
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Images
      </Typography>

      <Button
          component={RouterLink}
          to="/images/new"
          variant="contained"
          sx={{ mb: 2 }}
        >
          Upload Image
        </Button>

      <Grid container spacing={2}>
        {images.map((img) => (
          <Grid key={img.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardMedia
                component="img"
                height="160"
                image={`http://localhost:8000/images/${img.id}/raw`}
                alt={img.display_name}
              />

              <CardContent>
                <Typography variant="subtitle1" noWrap>
                  <RouterLink to={`/images/${img.id}`}>
                    {img.display_name}
                  </RouterLink>
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {img.content_type}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  ID: {img.id.slice(0, 8)}...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    </Box>
  );
}
