"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface OtherBranchesListProps {
  currentBranchId: Id<"branches"> | null;
}

export function OtherBranchesList({ currentBranchId }: OtherBranchesListProps) {
  const branches = useQuery(api.modules.branches.queries.listPublished);

  if (branches === undefined) {
    return (
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>Načítám...</li>
      </ul>
    );
  }

  const others = branches.filter((b) => b._id !== currentBranchId);
  const regionCount = new Set(
    branches.map((b) => b.region).filter(Boolean)
  ).size;

  return (
    <>
      {/* Živý síťový počet — čerpá z publikovaných poboček, mění se sám. */}
      <p className="mt-2 text-xs font-semibold text-warm">
        {branches.length}{" "}
        {branches.length === 1
          ? "pobočka"
          : branches.length >= 2 && branches.length <= 4
            ? "pobočky"
            : "poboček"}
        {regionCount > 0 ? ` v ${regionCount} krajích` : ""}
      </p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {others.map((b) => (
          <li key={b._id}>
            <a
              href={`https://${b.slug}.ahc.cz`}
              className="text-brand-foreground/80 hover:text-warm"
            >
              {b.short_name}
            </a>
          </li>
        ))}
        {others.length === 0 ? (
          <li className="text-brand-foreground/50">—</li>
        ) : null}
      </ul>
    </>
  );
}
