import { 
    Clock, 
    Settings, 
    Palette, 
    Languages,
    CalendarClock,
    Layout,
    Bell,
    Monitor,
    Sliders,
    Globe
} from 'lucide-svelte';

export const navigation = {
    items: [
        {
            slug: "theme",
            href: "/theme",
            title: "Theme & Style",
            mobileTitle: "Theme",
            description: "Customize appearance and layout",
            icon: Palette,
            color: "bg-secondary",
            badgeColor: "badge-secondary",
            subItems: [
                "Theme Selection",
                "Colors & Fonts",
                "Background"
            ]
        },
        {
            slug: "prayertimes",
            href: "/prayertimes",
            title: "Prayer Times",
            mobileTitle: "Prayers",
            description: "Configure times, Iqamah and display options",
            icon: Clock,
            color: "bg-primary",
            badgeColor: "badge-primary",
            subItems: [
                "Prayer Source",
                "Iqamah Settings",
                "Display Settings"
            ]
        },
        {
            slug: "localization",
            href: "/localization",
            title: "Language & Format",
            mobileTitle: "Language",
            description: "Customize language, date, and time settings",
            icon: Globe,
            color: "bg-info",
            badgeColor: "badge-info",
            subItems: [
                "Language",
                "Date & Time",
                "Location"
            ]
        },
        {
            slug: "system",
            href: "/system",
            title: "System",
            mobileTitle: "System",
            description: "Updates and maintenance",
            icon: Settings,
            color: "bg-warning",
            badgeColor: "badge-warning",
            subItems: [
                "Updates",
                "Advanced"
            ]
        }
    ]
};