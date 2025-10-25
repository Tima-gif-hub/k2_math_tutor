import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import App from "./App";
import Explain from "./pages/Explain";
import Sandbox from "./pages/Sandbox";
import Solve from "./pages/Solve";
import "./index.css";
import "katex/dist/katex.min.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/solve" replace />} />
          <Route path="solve" element={<Solve />} />
          <Route path="explain" element={<Explain />} />
          <Route path="sandbox" element={<Sandbox />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
