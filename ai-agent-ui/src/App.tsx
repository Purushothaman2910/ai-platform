import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme/theme";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatPage />
    </ThemeProvider>
  );
}

export default App;
