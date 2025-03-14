import type { IField } from '@ismail424/svelte-formly';

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
];

export default customization;
