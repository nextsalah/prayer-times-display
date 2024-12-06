import hourglass from "$lib/assets/svgs/hourglass.svg";
import setting from "$lib/assets/svgs/settings.svg";
import screen from "$lib/assets/svgs/screen.svg";
import theme from "$lib/assets/svgs/theme.svg";

export const navigation = {
  items: [
    {
      slug: "sources",
      href: "/sources",
      title: "Prayer Times",
      description: "Set your preferred prayer time sources",
      icon: hourglass,
    },
    {
      slug: "settings",
      href: "/settings",
      title: "Settings",
      description: "Customize app preferences",
      icon: setting,
    },
    {
      slug: "theme",
      href: "/theme", 
      title: "Theme",
      description: "Customize appearance and colors",
      icon: theme,
    },
    {
      slug: "screen_settings",
      href: "/screen_settings",
      title: "Display",
      description: "Adjust screen orientation and settings",
      icon: screen,
    },
  ],
};