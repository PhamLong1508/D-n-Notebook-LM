import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, App } from "antd";
import "antd/dist/reset.css";
import "./index.css";
import AppComponent from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider>
      <App>
        <BrowserRouter>
          <AppComponent />
        </BrowserRouter>
      </App>
    </ConfigProvider>
  </StrictMode>
);
