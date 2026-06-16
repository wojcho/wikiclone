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
  similarImagesImagesImageIdSimilarGet,
} from "../../client/sdk.gen";

import type { ImageRead } from "../../client/types.gen";

export default function ImageView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image, setImage] = useState<ImageRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [similar, setSimilar] = useState<ImageRead[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

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

        // ---- fetch similar images ----
        setSimilarLoading(true);

        const similarRes = await similarImagesImagesImageIdSimilarGet({
          path: { image_id: id },
          query: { limit: 4 },
          throwOnError: true,
        });

        const similarData =
          (similarRes as any)?.data ?? similarRes;

        setSimilar(similarData ?? []);
      } catch {
        setError("Failed to load image");
      } finally {
        setLoading(false);
        setSimilarLoading(false);
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


          <Divider />

          {/* Similar Images */}
          <Stack spacing={2}>
            <Typography variant="h6">
              Similar images
            </Typography>

            {similarLoading && (
              <CircularProgress size={20} />
            )}

            {!similarLoading && similar.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No similar images found
              </Typography>
            )}

            <Stack direction="row" spacing={2} flexWrap="wrap">
              {similar.map((img) => {
                const url = `http://localhost:8000/images/${img.id}/raw`;

                return (
                  <Box
                    key={img.id}
                    component="img"
                    src={url}
                    alt={img.display_name}
                    onClick={() => navigate(`/images/${img.id}`)}
                    sx={{
                      width: 180,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 1,
                      cursor: "pointer",
                      bgcolor: "#f5f5f5",
                      "&:hover": {
                        opacity: 0.8,
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Stack>
          
        </Stack>
      </Paper>
    </Box>
  );
}
