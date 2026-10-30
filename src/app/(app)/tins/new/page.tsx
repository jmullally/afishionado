import { Suspense } from "react";
import { AddTinForm } from "@/components/AddTinForm";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/supabase/server";
import Loading from "../../loading";

async function Form({ searchParams }: Pick<PageProps<"/tins/new">, "searchParams">) {
  const sp = await searchParams;
  const { supabase } = await requireUser();
  const { data: brands } = await supabase.from("brands").select("name").order("name");
  const param = (key: string) => (typeof sp[key] === "string" ? sp[key] : "");
  return (
    <AddTinForm
      brands={(brands ?? []).map((b) => b.name)}
      defaults={{ name: param("name"), brand: param("brand"), sizeG: param("size_g"), barcode: param("barcode") }}
    />
  );
}

export default function NewTinPage({ searchParams }: PageProps<"/tins/new">) {
  return (
    <>
      <PageHeader title="Add a tin" back="/tins" />
      <Suspense fallback={<Loading />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </>
  );
}
