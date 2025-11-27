"use client";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error("Failed");
    return r.json();
  });

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR("/api/me", fetcher, { revalidateOnFocus: false });
  return { me: data as { id:string; email:string|null; name:string; avatar:string; phone:string; created_at:string } | undefined, error, isLoading, mutate };
}
