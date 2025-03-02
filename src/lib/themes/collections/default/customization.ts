import type { IField } from '@ismail424/svelte-formly';
import type { FileMetadata } from '$lib/themes/interfaces/types';

export interface DefaultThemeSettings {
    footer_text: string;
    name_file: FileMetadata[];
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
        "type": "file",
        "name": "name_file",
        "attributes": {
            "id": "image-files",
            "classes": [
                "file-input file-input-bordered file-input-md w-full my-2"
            ],
            "label": "Upload File"
        },
        "extra": {
            "multiple": true
        },
        "rules": ["file"],
        "file": {
            "extensions": ["jpg", "gif", "png"],
            "maxSize": 5
        }
    }
];

export default customization;
