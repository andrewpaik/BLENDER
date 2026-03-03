import { ALL_WORKS, getWorkBySlug } from "@/lib/projectData";
import { WorkDetailClient } from "./WorkDetailClient";

export function generateStaticParams() {
  return ALL_WORKS.map((item) => ({ slug: item.slug }));
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  if (!work) {
    return <WorkDetailClient work={null} />;
  }

  return <WorkDetailClient work={work} />;
}
