import type { PageLoad } from "./$types";

export const load = (async () => {
  return {
    title: "Screen Settings",
  };
}) satisfies PageLoad;
