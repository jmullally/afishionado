import { AddTinForm } from "@/components/AddTinForm";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/supabase/server";

export default async function NewTinPage({ searchParams }: PageProps<"/tins/new">) {
  const sp = await searchParams;
  const { supabase } = await requireUser();
  const { data: brands } = await supabase.from("brands").select("name").order("name");

  return (
    <>
      <PageHeader title="Add a tin" back="/tins" />
      <AddTinForm
        brands={(brands ?? []).map((b) => b.name)}
        defaultName={typeof sp.name === "string" ? sp.name : ""}
      />
    </>
  );
}
