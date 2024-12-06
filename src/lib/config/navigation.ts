import hourglass from "$lib/assets/svgs/hourglass.svg";
import setting from "$lib/assets/svgs/settings.svg";
import theme from "$lib/assets/svgs/theme.svg";

export const navigation = {
  items: [
    {
      slug: "screen_settings",
      href: "/screen_settings",
      title: "Screen Setting",
      description: "Adjust display preferences like text size and brightness",
      icon: hourglass,
    },
    {
      slug: "sources",
      href: "/sources",
      title: "Prayertime Sources",
      description: "Manage prayer time data sources and settings",
      icon: hourglass,
    },
    {
      slug: "settings",
      href: "/settings",
      title: "Settings",
      description: "Configure general app settings and preferences",
      icon: setting,
    },
    {
      slug: "theme",
      href: "/theme", 
      title: "Theme",
      description: "Customize the app's color scheme and appearance",
      icon: theme,
    },
  ],
};