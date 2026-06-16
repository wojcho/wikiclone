import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Avatar,
  CircularProgress,
  Divider,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import { getUserUsersUserIdGet } from "../../client/sdk.gen";
import type { UserRead } from "../../client/types.gen";

export default function UserView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch {
        setError("Failed to load user");
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

  if (error || !user) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">
          {error ?? "User not found"}
        </Typography>

        <Button sx={{ mt: 2 }} onClick={() => navigate("/users/")}>
          Back to users
        </Button>
      </Box>
    );
  }

  const avatarUrl = user.avatar
    ? `http://localhost:8000/images/${user.avatar.id}/raw`
    : undefined;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack>
            <Avatar
              src={avatarUrl}
              sx={{ width: 72, height: 72 }}
            >
              {user.username[0].toUpperCase()}
            </Avatar>

            <Box>
              <Typography variant="h5">
                {user.display_name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          {/* Metadata */}
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              <strong>User ID:</strong> {user.id}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Created:</strong>{" "}
              {new Date(user.created_at).toLocaleString()}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Updated:</strong>{" "}
              {new Date(user.updated_at).toLocaleString()}
            </Typography>
          </Stack>

          <Divider />

          {/* Actions (future-ready) */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/users/${user.id}/edit`)}
            >
              Edit profile
            </Button>

            <Button
              variant="text"
              onClick={() => navigate("/users/")}
            >
              Back
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
