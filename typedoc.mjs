export default {
    options: {
        entryPoints: ["src/index.ts"],
        navigation: {
            "includeCategories": false,
            "includeGroups": false,
            "includeFolders": false,
            "compactFolders": false,
            "excludeReferences": true,
        },
        organization: {
            "sidebarLinks": {
                "Example": "http://example.com"
            },
        },
        router: 'category',
        "categorizeByGroup": true
    },
    // outputs: [{
    //     name: 'html',
    //     path: 'docs',
    //     options: {
    //
    //     }
    // }]
}
