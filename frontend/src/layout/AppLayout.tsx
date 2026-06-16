import { Outlet, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Box } from "@mui/material";

export default function AppLayout() {
  const navigate = useNavigate();

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Button color="inherit" onClick={() => navigate("/")}>
            Main
          </Button>

          <Button color="inherit" onClick={() => navigate("/articles/")}>
            Articles
          </Button>

          <Button color="inherit" onClick={() => navigate("/images/")}>
            Images
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button color="inherit" onClick={() => navigate("/login")}>
            Login
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
