import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { GlobalStyles } from "@mui/material";
import App from "./App.tsx"
import { AuthProvider } from "./auth/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <GlobalStyles styles={{ html:{height:"100%"}, body:{margin:0,padding:0}, "#root":{height:"100%"} }} />
      <App />
    </AuthProvider>
  </StrictMode>,
);
