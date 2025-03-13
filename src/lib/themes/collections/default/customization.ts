import type { IField } from '@ismail424/svelte-formly';
import type { FileMetadata } from '$lib/themes/interfaces/types';

export interface DefaultThemeSettings {
    theme_color: string;
    footer_text: string;
    name_file: FileMetadata[];
    slide_delay: number;
}

const customization: IField[] = [
    {
		type: 'select', // required
		name: 'theme_color', // required
		attributes: {
			id: 'theme_color', // required
			classes: ['select select-bordered select-primary w-full'], // optional
			label: 'Select Color Theme', // optional
			disabled: false // optional
		},
		extra: {
			options: [
                { value: 'default', title: 'Default' },
                { value: 'light', title: 'Light' },
                { value: 'dark', title: 'Dark' },
                { value: 'cupcake', title: 'Cupcake' },
                { value: 'bumblebee', title: 'Bumblebee' },
                { value: 'emerald', title: 'Emerald' },
                { value: 'corporate', title: 'Corporate' },
                { value: 'synthwave', title: 'Synthwave' },
                { value: 'retro', title: 'Retro' },
                { value: 'cyberpunk', title: 'Cyberpunk' },
                { value: 'valentine', title: 'Valentine' },
                { value: 'halloween', title: 'Halloween' },
                { value: 'garden', title: 'Garden' },
                { value: 'forest', title: 'Forest' },
                { value: 'aqua', title: 'Aqua' },
                { value: 'lofi', title: 'Lofi' },
                { value: 'pastel', title: 'Pastel' },
                { value: 'fantasy', title: 'Fantasy' },
                { value: 'wireframe', title: 'Wireframe' },
                { value: 'black', title: 'Black' },
                { value: 'luxury', title: 'Luxury' },
                { value: 'dracula', title: 'Dracula' },
                { value: 'cmyk', title: 'CMYK' },
                { value: 'autumn', title: 'Autumn' },
                { value: 'business', title: 'Business' },
                { value: 'acid', title: 'Acid' },
                { value: 'lemonade', title: 'Lemonade' },
                { value: 'night', title: 'Night' },
                { value: 'coffee', title: 'Coffee' },
                { value: 'winter', title: 'Winter' },
                { value: 'dim', title: 'Dim' },
                { value: 'nord', title: 'Nord' },
                { value: 'sunset', title: 'Sunset' }
              ]
		},
        value: 'default',
        rules: ['required']
	},
    {
        "type": "input",
        "name": "footer_text",
        "attributes": {
            "type": "text",
            "id": "footer-text",
            "classes": [
                "input input-bordered input-secondary w-full"
            ], 
            "label": "Footer Text",
            "placeholder": "Enter footer text"
        },
        "rules": [ "required" ],
        "value": "بسم الله الرحمن الرحيم"
    },
    {
        type: 'input', // required
        name: 'slide_delay', // required
        value: '30', // optional
        attributes: {
            type: 'number', // default = text, or password, email, number, tel, optional
            id: 'slide_delay', // optional
            classes: ['input input-bordered input-info w-full'], // optional
            label: 'Slide Show Delay', // optional
            placeholder: 'Number of seconds', // optional
            disabled: false, // optional
            readonly: false // optional
        }
    },
    {
        "type": "file",
        "name": "name_file",
        "attributes": {
            "id": "image-files",
            "classes": [
                "file-input file-input-bordered file-input-md w-full my-2"
            ],
            "label": "Upload Slideshow Images"
        },
        "extra": {
            "multiple": true
        },
        "rules": ["file"],
        "file": {
            "extensions": ["jpg", "jpeg", "png", "gif"],
            "maxSize": 3
        }
    },
];

export default customization;
