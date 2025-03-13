import type { IField } from '@ismail424/svelte-formly';
import type { FileMetadata } from '$lib/themes/interfaces/types';

export interface DefaultThemeSettings {
    footer_text: string;
    name_file: FileMetadata[];
    slide_delay: number;
}

const customization: IField[] = [
    {
        "type": "input",
        "name": "footer_text",
        "attributes": {
            "type": "text",
            "id": "footer-text",
            "classes": [
                "input input-bordered input-primary w-full"
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
            classes: ['input input-bordered input-primary w-full'], // optional
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
