const siteUrl = "https://www.cinegraficostudios.in";

const publicRoutes = [
  "/",
  "/team",
  "/about",
  "/about/team",
  "/hiring",
  "/portfolio"
];

export default function sitemap() {
  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7
  }));
}
