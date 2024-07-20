import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { Editor } from "./editor";
import { StrictMode } from "react";

const element = document.getElementById("root");
if (!element) throw new ReferenceError(`react contained doesn't exist`);

const app = createRoot(element);

app.render(
  <StrictMode>
    <Editor />
  </StrictMode>,
);
