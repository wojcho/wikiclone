import { Outlet, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Box, Avatar, Stack, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext";

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Button color="inherit" onClick={() => navigate("/")}>Main</Button>

          <Button color="inherit" onClick={() => navigate("/articles")}>
            Articles
          </Button>

          <Button color="inherit" onClick={() => navigate("/images")}>
            Images
          </Button>
          

          <Button color="inherit" onClick={() => navigate("/users")}>
            Users
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <>
              <Button
                color="inherit"
                onClick={() => navigate(`/users/${user.id}`)}
                sx={{ textTransform: "none" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    sx={{ width: 28, height: 28 }}
                    src={
                      user.avatar
                        ? `http://localhost:8000/images/${user.avatar.id}/raw`
                        : undefined
                    }
                  >
                    {user.username[0].toUpperCase()}
                  </Avatar>

                  <Typography variant="body2" color="inherit">
                    {user.username}
                  </Typography>
                </Stack>
              </Button>

              <Button
                color="inherit"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate("/register")}>
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box>
        <Outlet />
      </Box>
    </Box>
  );
}
