import { PageOptions } from '@graphcommerce/framer-next-pages'
import { CmsPageMeta } from "@graphcommerce/magento-cms/CmsPageMeta";
import { ProductListDocument, ProductListQuery } from '@graphcommerce/magento-product'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { GetStaticProps, LayoutHeader, MetaRobots, PageMeta } from '@graphcommerce/next-ui'
import { CmsPageDocument, CmsPageQuery, CmsRowRenderer } from '@softcommerce/graphcommerce-magento-cms'
import { LayoutDocument, LayoutNavigation, LayoutNavigationProps, RowProduct } from '../../components'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'

type Props = CmsPageQuery & {
  latestList: ProductListQuery
  favoritesList: ProductListQuery
  swipableList: ProductListQuery
}
type RouteProps = { url: string }
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props, RouteProps>

function CmsPage(props: Props) {
  const { cmsPage, latestList, favoritesList, swipableList } = props

  const latest = latestList?.products?.items?.[0]
  const favorite = favoritesList?.products?.items?.[0]
  const swipeable = swipableList?.products?.items?.[0]

  return (
    <>
      <CmsPageMeta
        title={cmsPage?.content_heading}
        meta_title={cmsPage?.meta_title}
        meta_description={cmsPage?.meta_description}
      />

      <LayoutHeader floatingMd floatingSm />

      {cmsPage && (
        <CmsRowRenderer
          cmsRowContent={cmsPage?.cmsRowContent}
          renderer={{
            CmsRowProduct: (rowProps) => {
              const { title } = rowProps
              /*
              if (identity === 'home-favorites')
                return (
                  <CmsRowProduct {...rowProps} {...favorite} items={favoritesList.products?.items} />
                )
               */
              /*
              if (identity === 'home-latest')
                return <CmsRowProduct {...rowProps} {...latest} items={latestList.products?.items} />
              if (identity === 'home-swipable')
                return (
                  <CmsRowProduct {...rowProps} {...swipable} items={swipableList.products?.items} />
                )
               */
              if (title === 'Latest designs')
                return <RowProduct {...rowProps} {...latest} items={latestList.products?.items} />
              if (title === 'Power to the Women')
                return (
                  <RowProduct {...rowProps} {...swipeable} items={swipableList.products?.items} />
                )
              return (
                <RowProduct {...rowProps} {...favorite} items={favoritesList.products?.items} />
              )
            },
          }}
        />
      )}
    </>
  )
}

CmsPage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default CmsPage

export const getStaticProps: GetPageStaticProps = async ({ locale }) => {
  const client = graphqlSharedClient(locale)
  const staticClient = graphqlSsrClient(locale)

  const url = 'customer-service'
  const conf = client.query({ query: StoreConfigDocument })
  const cmsPage = staticClient.query({
    query: CmsPageDocument,
    variables: { url },
  })
  const layout = staticClient.query({ query: LayoutDocument, fetchPolicy: 'cache-first' })

  // todo(paales): Remove when https://github.com/Urigo/graphql-mesh/issues/1257 is resolved
  const favoritesList = staticClient.query({
    query: ProductListDocument,
    variables: { pageSize: 8, filters: { category_uid: { eq: 'NA==' } } },
  })

  const latestList = staticClient.query({
    query: ProductListDocument,
    variables: { pageSize: 8, filters: { category_uid: { eq: 'Mw==' } } },
  })

  const swipableList = staticClient.query({
    query: ProductListDocument,
    variables: { pageSize: 8, filters: { category_uid: { eq: 'MjI=' } } },
  })

  // if (!(await page).data.pages?.[0]) return { notFound: true }
  if (!(await cmsPage).data?.cmsPage) return { notFound: true }

  return {
    props: {
      ...(await cmsPage).data,
      ...(await layout).data,
      latestList: (await latestList).data,
      favoritesList: (await favoritesList).data,
      swipableList: (await swipableList).data,
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}
