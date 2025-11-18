export default {
    options: {
        entryPoints: ["src/index.ts"],
        navigation: {
            includeCategories: true,
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
