import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        project: "project.html",
        cv: "cv.html",
        cvEn: "cv-en.html",
        cvAts: "cv-ats.html",
        cvAtsEn: "cv-ats-en.html",
      },
    },
  },
});
