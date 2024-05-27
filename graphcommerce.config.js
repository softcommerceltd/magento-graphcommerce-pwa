// @ts-check

/**
 * Docs: https://graphcommerce.org/docs/framework/config
 *
 * @type {import('@graphcommerce/next-config/src/generated/config').GraphCommerceConfig}
 */
const config = {
    hygraphEndpoint: 'https://eu-west-2.cdn.hygraph.com/content/clsad7p14000008jv0zy13wk7/master',
    magentoEndpoint: 'https://gc-backend.softcommerce.dev/graphql',
    canonicalBaseUrl: 'https://gc-frontend.softcommerce.dev',
    storefront: [
        { locale: 'en', magentoStoreCode: 'en', defaultLocale: true },
        { locale: 'de', magentoStoreCode: 'de' },
    ],
    productFiltersPro: true,
    productFiltersLayout: 'DEFAULT',
    compareVariant: 'ICON',
    robotsAllow: false,

    demoMode: true,
    limitSsg: true,
    compare: true,
    sidebarGallery: { paginationVariant: 'DOTS' },
    configurableVariantForSimple: true,
    configurableVariantValues: { url: true, content: true, gallery: true },
    recentlyViewedProducts: { enabled: true, maxCount: 20 },
}

module.exports = config
