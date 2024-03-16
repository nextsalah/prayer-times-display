import hourglass from '$lib/assets/svgs/hourglass.svg';
import setting from '$lib/assets/svgs/settings.svg';
import theme from '$lib/assets/svgs/theme.svg';

export const navigation = {
	items: [
		{
			slug: '',
			href: '/',
			title: 'Home',
            icon : hourglass,
		},
        {
			slug: 'prayertimes_sources',
			href: '/prayertimes_sources',
			title: 'Prayertime Sources',
            icon : hourglass,
		},
		{
			slug: 'settings',
			href: '/settings',
			title: 'Settings',
            icon : setting,
		},
		{
			slug: 'theme',
			href: '/theme',
			title: 'Theme',
            icon : theme,
		}
	]
};