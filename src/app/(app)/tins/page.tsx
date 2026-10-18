import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TinSearch } from "@/components/TinSearch";
import Loading from "../loading";

async function Results({ searchParams }: Pick<PageProps<"/tins">, "searchParams">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const species = typeof sp.species === "string" ? sp.species : "";
  return <TinSearch q={q} species={species} basePath="/tins" mode="browse" />;
}

export default function TinsPage({ searchParams }: PageProps<"/tins">) {
  return (
    <>
      <PageHeader title="Tins" />
      <Suspense fallback={<Loading />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </>
  );
}
