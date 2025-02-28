import type { PageLoad } from "./$types";

export const load = (async () => {
  return {
    title: "Control Panel",
  };
}) satisfies PageLoad;
