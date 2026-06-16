import { Outlet, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
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

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <>
              <Button color="inherit" onClick={() => navigate(`/users/${user.id}`)}>
                {user.username}
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

      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
