import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load = (async () => {
  const componentPath: string = "default";
  return {
    data: {
      fajr: "04:00",
      dhuhr: "13:00",
      asr: "16:00",
      maghrib: "19:00",
      isha: "22:00",
    },
    componentPath: componentPath,
  };
}) satisfies PageServerLoad;
