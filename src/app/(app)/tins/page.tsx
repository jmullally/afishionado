import { PageHeader } from "@/components/PageHeader";
import { TinSearch } from "@/components/TinSearch";

export default async function TinsPage({ searchParams }: PageProps<"/tins">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const species = typeof sp.species === "string" ? sp.species : "";

  return (
    <>
      <PageHeader title="Tins" />
      <TinSearch q={q} species={species} basePath="/tins" mode="browse" />
    </>
  );
}
