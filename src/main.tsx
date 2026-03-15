import React from "react";
import ReactDOM from "react-dom/client";
import { HomePage } from "./pages/HomePage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { CvPage } from "./pages/CvPage";
import { AtsCvPage } from "./pages/AtsCvPage";

function renderPage() {
  const page = document.body.dataset.page ?? "home";

  switch (page) {
    case "project":
      return <ProjectDetailPage />;
    case "cv":
      return <CvPage language="vi" />;
    case "cv-en":
      return <CvPage language="en" />;
    case "cv-ats":
      return <AtsCvPage language="vi" />;
    case "cv-ats-en":
      return <AtsCvPage language="en" />;
    case "home":
    default:
      return <HomePage />;
  }
}

async function bootstrap() {
  const page = document.body.dataset.page ?? "home";

  if (page === "home" || page === "project") {
    await import("./styles.css");
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>{renderPage()}</React.StrictMode>,
  );
}

void bootstrap();
