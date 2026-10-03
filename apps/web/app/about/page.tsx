import AboutContent from "@/components/AboutContent";
import { buildPageMetadata } from "@/lib/seo";
export const metadata = buildPageMetadata({
  title: "About OSINT Hub",
  path: "/about",
  description:
    "Learn about OSINT Hub, its public research resources, educational purpose, attribution and responsible use.",
});
export default function AboutPage() {
  return <AboutContent />;
}
