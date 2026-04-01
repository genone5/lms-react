import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { Providers } from "./app/providers";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  );
}

export default App;
