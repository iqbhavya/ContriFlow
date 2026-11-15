import { Analytics } from "@vercel/analytics/react";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <>
      <AppRouter />
      <Analytics />
    </>
  );
}

export default App;