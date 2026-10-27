
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Smriti Notes",
    short_name: "Smriti",
    description: "Your notebook, reimagined.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f0e8",
    theme_color: "#f5f0e8",
    orientation: "any",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icons/smriti-exp.jpg",
        sizes: "192x192",
        type: "image/png",
        
      },
      {
        src: "/icons/smriti-exp.jpg",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/smriti-exp.jpg",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
