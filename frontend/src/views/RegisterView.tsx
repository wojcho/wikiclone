import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  Paper,
  Stack,
} from "@mui/material";
import { createUserUsersPost } from "../client/sdk.gen";

export default function RegisterView() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createUserUsersPost({
        body: {
          username,
          display_name: displayName,
          password,
        },
        throwOnError: true,
      });

      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please change the data or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Typography variant="h5" sx={{ pb: 2}}>
          Create account
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              fullWidth
              required
            />

            <TextField
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              fullWidth
              required
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              fullWidth
              required
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register"}
            </Button>

            <Typography variant="body2">
              Already have an account?{" "}
              <Link component={RouterLink} to="/login">
                Login
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
