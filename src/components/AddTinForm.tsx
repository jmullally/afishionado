"use client";

import { useActionState } from "react";
import { addTin, type AddTinState } from "@/app/actions";
import { PACKINGS, SPECIES } from "@/lib/types";

export function AddTinForm({ brands, defaultName }: { brands: string[]; defaultName: string }) {
  const [state, formAction, pending] = useActionState<AddTinState, FormData>(addTin, {});

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Brand</span>
        <input name="brand" list="brand-list" required className="field" placeholder="e.g. Ortiz" autoComplete="off" />
        <datalist id="brand-list">
          {brands.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">Tin name</span>
        <input
          name="name"
          required
          defaultValue={defaultName}
          className="field"
          placeholder="e.g. Sardines in Olive Oil"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Fish</span>
          <select name="species" required className="field capitalize" defaultValue="">
            <option value="" disabled>
              Choose…
            </option>
            {SPECIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Packed in</span>
          <select name="packing" className="field capitalize" defaultValue="">
            <option value="">—</option>
            {PACKINGS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold">
          Size <span className="font-normal text-muted">(grams, optional)</span>
        </span>
        <input name="size_g" type="number" inputMode="numeric" min={1} className="field" placeholder="120" />
      </label>

      {state.error && <p className="rounded-xl bg-coral/10 p-3 text-sm text-coral">{state.error}</p>}

      <button className="btn w-full" disabled={pending}>
        {pending ? "Saving…" : "Add tin and check in"}
      </button>
    </form>
  );
}
