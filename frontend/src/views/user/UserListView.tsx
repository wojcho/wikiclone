import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

import { listUsersUsersGet } from "../../client/sdk.gen";
import type { UserRead } from "../../client/types.gen";

export default function UserListView() {
  const [users, setUsers] = useState<UserRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await listUsersUsersGet({
          throwOnError: true,
        });

        const data = (res as any)?.data ?? res;
        setUsers(data ?? []);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const isSelf = (id: string) => currentUser?.id === id;

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

  if (users.length === 0) {
    return (
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h6">No users found</Typography>
        <Typography variant="body2" color="text.secondary">
          Users will appear here once they register.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Users
      </Typography>

      <Stack spacing={2}>
        {users.map((user) => (
          <Card
            key={user.id}
            sx={{
              display: "flex",
              p: 2,
              gap: 2,
              bgcolor: isSelf(user.id) ? "action.selected" : "background.paper",
              border: isSelf(user.id) ? "1px solid" : "none",
              borderColor: "primary.main",
            }}
          >
            <Avatar
              src={
                user.avatar
                  ? `http://localhost:8000/images/${user.avatar.id}/raw`
                  : undefined
              }
              sx={{ width: 56, height: 56 }}
            >
              {!user.avatar && user.username.toUpperCase()}
            </Avatar>

            <CardContent sx={{ flex: 1, p: 0 }}>
              <Typography variant="h6">
                <RouterLink to={`/users/${user.id}`}>
                  {user.display_name}
                </RouterLink>
              </Typography>

              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
