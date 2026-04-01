import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./App.tsx";
import "./index.css";
import "./admin.css";

// We use the ID provided by the user
const GOOGLE_CLIENT_ID = "683485852302-63lv989d55r2ftbih6t0rtapitpif6qe.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
