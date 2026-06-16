import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import {
  uploadImageImagesPost,
  updateImageImagesImageIdPatch,
  getImageMetadataImagesImageIdGet,
} from "../../client/sdk.gen";
import type { ImageRead } from "../../client/types.gen";
import { useAuth } from "../../auth/AuthContext";

export default function ImageEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user: currentUser } = useAuth();

  const isEdit = Boolean(id);

  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");

  const [existingImage, setExistingImage] = useState<ImageRead | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LOAD EXISTING IMAGE (edit mode)
  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      try {
        setLoading(true);

        const res = await getImageMetadataImagesImageIdGet({
          path: { image_id: id },
          throwOnError: true,
        });

        const data = (res as any)?.data ?? res;
        setExistingImage(data);
        setDisplayName(data.display_name);

        // preview raw image
        setPreviewUrl(`http://localhost:8000/images/${id}/raw`);
      } catch {
        setError("Failed to load image");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  if (!currentUser) {
      return (
        <Box sx={{ mt: 4 }}>
          <Stack spacing={2}>
            <Alert severity="error">
              You are not allowed to edit this user image.
            </Alert>
            <Button
              variant="outlined"
              onClick={() => navigate(`/images/${id}`)}
            >
              Back
            </Button>
          </Stack>
        </Box>
      );
    }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);

    try {
      if (!file && !isEdit) {
        throw new Error("Please select a file");
      }

      // CREATE
      if (!isEdit) {
        await uploadImageImagesPost({
          body: {
            file: file!,
          },
          throwOnError: true,
        });

        navigate("/images/");
        return;
      }

      // UPDATE
      await updateImageImagesImageIdPatch({
        path: { image_id: id! },
        body: {
          file: file ?? new File([], "noop"),
        },
        throwOnError: true,
      });

      navigate(`/images/${id}`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to save image");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {isEdit ? "Edit Image" : "Upload Image"}
        </Typography>

        <Stack spacing={2}>
          {/* Display name (frontend-only editing for now) */}
          <TextField
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            fullWidth
          />

          {/* File input */}
          <Button variant="outlined" component="label">
            Choose file
            <input type="file" hidden onChange={handleFileChange} />
          </Button>

          {/* Preview */}
          {previewUrl && (
            <Box
              component="img"
              src={previewUrl}
              sx={{
                width: "100%",
                maxHeight: 400,
                objectFit: "contain",
                borderRadius: 1,
              }}
            />
          )}

          {/* Metadata (edit mode) */}
          {isEdit && existingImage && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Content type: {existingImage.content_type}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {existingImage.id}
              </Typography>
            </Box>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : isEdit ? "Update Image" : "Upload Image"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
