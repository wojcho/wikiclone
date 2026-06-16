import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  Divider,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import {
  getImageMetadataImagesImageIdGet,
} from "../../client/sdk.gen";

import type { ImageRead } from "../../client/types.gen";

export default function ImageView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image, setImage] = useState<ImageRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);

        const res = await getImageMetadataImagesImageIdGet({
          path: { image_id: id },
          throwOnError: true,
        });

        const data = (res as any)?.data ?? res;
        setImage(data);
      } catch {
        setError("Failed to load image");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !image) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">
          {error ?? "Image not found"}
        </Typography>

        <Button sx={{ mt: 2 }} onClick={() => navigate("/images/")}>
          Back to images
        </Button>
      </Box>
    );
  }

  const rawUrl = `http://localhost:8000/images/${image.id}/raw`;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Title */}
          <Typography variant="h5">
            {image.display_name}
          </Typography>

          {/* Image */}
          <Box
            component="img"
            src={rawUrl}
            alt={image.display_name}
            sx={{
              width: "100%",
              maxHeight: 600,
              objectFit: "contain",
              borderRadius: 1,
              bgcolor: "#f5f5f5",
            }}
          />

          <Divider />

          {/* Metadata */}
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              <strong>ID:</strong> {image.id}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Content type:</strong> {image.content_type}
            </Typography>
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/images/${image.id}/edit`)}
            >
              Edit
            </Button>

            <Button
              variant="text"
              onClick={() => navigate("/images/")}
            >
              Back
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
