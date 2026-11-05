import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* HashRouter：GitHub Pages 对子路径返回 404；hash 路由只请求首页，安卓不会因 404 卡死 */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
