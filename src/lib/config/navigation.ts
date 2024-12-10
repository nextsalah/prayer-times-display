import { 
    Clock, 
    Settings, 
    Palette, 
    Languages
} from 'lucide-svelte';

export const navigation = {
    items: [
        {
            slug: "display",
            href: "/display",
            title: "Display & Theme",
            mobileTitle: "Theme",
            description: "Customize appearance and layout",
            icon: Palette,
            color: "bg-secondary",
            subItems: [
                "Theme Selection",
                "Background Settings",
                "Screen Orientation"
            ]
        },
        {
            slug: "sources",
            href: "/sources",
            title: "Prayer Times",
            mobileTitle: "Times",
            description: "Configure prayer times and Iqamah",
            icon: Clock,
            color: "bg-primary",
            subItems: [
                "Prayer Time Source",
                "Iqamah Settings",
                "Time Adjustments"
            ]
        },
        {
            slug: "language",
            href: "/language",
            title: "Language",
            mobileTitle: "Language",
            description: "Set interface and prayer languages",
            icon: Languages,
            color: "bg-accent",
            subItems: [
                "Interface Language",
                "Prayer Text",
                "Font Settings"
            ]
        },
        {
            slug: "system",
            href: "/system",
            title: "System",
            mobileTitle: "System",
            description: "Updates and configurations",
            icon: Settings,
            color: "bg-info",
            subItems: [
                "Check Updates",
                "Backup Settings",
                "System Info"
            ]
        }
    ]
};