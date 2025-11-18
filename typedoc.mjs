export default {
    entryPoints: ["src/index.ts"],
    navigation: {
        "includeCategories": true,
        "includeGroups": false,
        "includeFolders": false,
        "compactFolders": false,
        "excludeReferences": true,
    },

    // router: 'category',
    "categorizeByGroup": false,
    typePrintWidth: 120,
    includeVersion: true,
    sidebarLinks: {
        'npm': 'https://www.npmjs.com/package/@ginden/blinkstick-v2',
        'GitHub': 'https://github.com/Ginden/blinkstick-node-v2'
    },
    categoryOrder: [
        "Discovery",
        "Core",
        "Animation",
        "Utils",
        "*"
    ]

    // outputs: [{
    //     name: 'html',
    //     path: 'docs',
    //     options: {
    //
    //     }
    // }]
}
