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
            slug: "sources",
            href: "/sources",
            title: "Prayer Times",
            mobileTitle: "Prayers",
            description: "Configure times, Iqamah and display options",
            icon: Clock,
            color: "bg-primary",
            subItems: [
                "Prayer Source",
                "Iqamah Settings",
                "Display Settings"
            ]
        },
        {
            slug: "theme",
            href: "/theme",
            title: "Theme & Style",
            mobileTitle: "Theme",
            description: "Customize appearance and layout",
            icon: Palette,
            color: "bg-secondary",
            subItems: [
                "Theme Selection",
                "Colors & Fonts",
                "Background"
            ]
        },
        {
            slug: "localization",
            href: "/localization",
            title: "Language & Format",
            mobileTitle: "Language",
            description: "Text, date and time formats",
            icon: Globe,
            color: "bg-info",
            subItems: [
                "Interface Language",
                "Date Format",
                "Time Format"
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
            subItems: [
                "Time Settings",
                "Updates",
                "Advanced"
            ]
        }
    ]
};