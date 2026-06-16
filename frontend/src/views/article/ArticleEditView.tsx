import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import ImagePickerModal from "../image/ImagePickerModal";

import {
  createArticleArticlesPost,
  updateArticleArticlesArticleIdPatch,
  getArticleArticlesArticleIdGet,
} from "../../client/sdk.gen";

import type { ArticleRead } from "../../client/types.gen";
import type { ImageRead } from "../../client/types.gen";

export default function ArticleEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [article, setArticle] = useState<ArticleRead | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [text, setText] = useState("");

  const [primaryImage, setPrimaryImage] = useState<ImageRead | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<ImageRead | null>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [picker, setPicker] = useState<{
    type: "primary" | "background" | null;
    open: boolean;
  }>({ type: null, open: false });

  // LOAD (edit mode)
  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      try {
        setLoading(true);

        const res = await getArticleArticlesArticleIdGet({
          path: { article_id: id },
          throwOnError: true,
        });

        const data = (res as any)?.data ?? res;

        setArticle(data);
        setDisplayName(data.display_name);
        setText(data.text);
        setPrimaryImage(data.primary_image);
        setBackgroundImage(data.background_image);
      } catch {
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      if (isEdit && id) {
        const res = await updateArticleArticlesArticleIdPatch({
          path: { article_id: id },
          body: {
            display_name: displayName,
            text,
            primary_image_id: primaryImage?.id ?? null,
            background_image_id: backgroundImage?.id ?? null,
          },
          throwOnError: true,
        });

        const data = (res as any)?.data ?? res;
        setArticle(data);

        navigate(`/articles/${id}`);
      } else {
        const res = await createArticleArticlesPost({
          body: {
            display_name: displayName,
            text,
            primary_image_id: primaryImage?.id ?? null,
            background_image_id: backgroundImage?.id ?? null,
          },
          throwOnError: true,
        });

        const data = (res as any)?.data ?? res;
        navigate(`/articles/${data.id}`);
      }
    } catch {
      setError("Failed to save article");
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
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {isEdit ? "Edit Article" : "New Article"}
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Title"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            fullWidth
            multiline
            minRows={6}
          />

          {/* PRIMARY IMAGE */}
          <Box>
            <Typography variant="subtitle2">Primary image</Typography>

            {primaryImage && (
              <Box
                component="img"
                src={`http://localhost:8000/images/${primaryImage.id}/raw`}
                sx={{ width: 120, mt: 1, borderRadius: 1 }}
              />
            )}

            <Button
              sx={{ mt: 1 }}
              variant="outlined"
              onClick={() =>
                setPicker({ open: true, type: "primary" })
              }
            >
              Choose primary image
            </Button>
          </Box>

          {/* BACKGROUND IMAGE */}
          <Box>
            <Typography variant="subtitle2">Background image</Typography>

            {backgroundImage && (
              <Box
                component="img"
                src={`http://localhost:8000/images/${backgroundImage.id}/raw`}
                sx={{ width: 120, mt: 1, borderRadius: 1 }}
              />
            )}

            <Button
              sx={{ mt: 1 }}
              variant="outlined"
              onClick={() =>
                setPicker({ open: true, type: "background" })
              }
            >
              Choose background image
            </Button>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>

            <Button
              variant="outlined"
              onClick={() =>
                navigate(isEdit ? `/articles/${id}` : "/articles")
              }
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* IMAGE PICKER MODAL */}
      <ImagePickerModal
        open={picker.open}
        onClose={() => setPicker({ open: false, type: null })}
        onSelect={(img) => {
          if (picker.type === "primary") {
            setPrimaryImage(img);
          } else if (picker.type === "background") {
            setBackgroundImage(img);
          }
        }}
      />
    </Box>
  );
}
