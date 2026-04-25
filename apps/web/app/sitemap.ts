import type { MetadataRoute } from "next";
import { BRAND } from "@societe/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BRAND.domain,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${BRAND.domain}/apply`,
      lastModified: new Date(),
      priority: 0.9,
    },
  ];
}
