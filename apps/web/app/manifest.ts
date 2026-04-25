import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Société",
    short_name: "Société",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f6f1",
    theme_color: "#0b0b0c",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
