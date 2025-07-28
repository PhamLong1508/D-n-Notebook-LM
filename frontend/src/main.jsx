import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, App } from "antd";
import "antd/dist/reset.css";
import "./index.css";
import AppComponent from "./App.jsx";
import { NotebookProvider } from "./contexts/NotebookContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider>
      <App>
        <BrowserRouter>
          <NotebookProvider>
            <AppComponent />
          </NotebookProvider>
        </BrowserRouter>
      </App>
    </ConfigProvider>
  </StrictMode>
);
