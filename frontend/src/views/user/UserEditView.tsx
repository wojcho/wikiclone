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
import { useParams, useNavigate } from "react-router-dom";

import ImagePickerModal from "../image/ImagePickerModal";
import { useAuth } from "../../auth/AuthContext";

import {
  getUserUsersUserIdGet,
  updateUserUsersUserIdPatch,
} from "../../client/sdk.gen";

import type { UserRead } from "../../client/types.gen";

export default function UserEditView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user: currentUser, loading: authLoading } = useAuth();

  const [user, setUser] = useState<UserRead | null>(null);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);

        const res = await getUserUsersUserIdGet({
          path: { user_id: id },
          throwOnError: true,
        });

        const data = (res as any)?.data ?? res;

        setUser(data);
        setUsername(data.username);
        setDisplayName(data.display_name);
        setAvatarId(data.avatar?.id ?? null);
      } catch {
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);
    setError(null);

    try {
      const res = await updateUserUsersUserIdPatch({
        path: { user_id: id },
        body: {
          username,
          display_name: displayName,
          avatar_id: avatarId,
          password: null, // not changing password here
        },
        throwOnError: true,
      });

      const data = (res as any)?.data ?? res;
      setUser(data);

      navigate(`/users/${id}`);
    } catch {
      setError("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const isForbidden =
    currentUser &&
    id &&
    currentUser.id !== id;

  if (authLoading || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isForbidden) {
    return (
      <Box sx={{ mt: 4 }}>
        <Stack spacing={2}>
          <Alert severity="error">
            You are not allowed to edit this user profile.
          </Alert>
          <Button
            variant="outlined"
            onClick={() => navigate(`/users/${id}`)}
          >
            Back
          </Button>
        </Stack>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">User not found</Alert>
      </Box>
    );
  }


  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Edit User
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />

          <TextField
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            fullWidth
          />

          {avatarId && (
            <Box
                component="img"
                src={`http://localhost:8000/images/${avatarId}/raw`}
                sx={{ width: 80, height: 80, borderRadius: "50%" }}
              />
            )}


          <Button
            variant="outlined"
            onClick={() => setPickerOpen(true)}
          >
            Choose avatar
          </Button>

          <ImagePickerModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={(img) => {
              setAvatarId(img.id);
            }}
          />

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
              onClick={() => navigate(`/users/${id}`)}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
