import LearnContent from "@/components/LearnContent";
import { buildPageMetadata } from "@/lib/seo";
export const metadata = buildPageMetadata({
  title: "Learn OSINT",
  path: "/learn",
  description:
    "Learn to search and verify public information with interactive examples, query templates and a locally saved research note.",
});
export default function LearnPage() {
  return <LearnContent />;
}
