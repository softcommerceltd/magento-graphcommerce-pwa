import { PageOptions } from '@graphcommerce/framer-next-pages'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { PageMeta, GetStaticProps, LayoutTitle } from '@graphcommerce/next-ui'
import { Container } from '@mui/material'
import {
  CmsPageDocument,
  CmsPageQuery,
  CmsPageListDocument,
  CmsRowRenderer
} from '@softcommerce/graphcommerce-magento-cms'
import { GetStaticPaths } from 'next'
import { LayoutDocument, LayoutNavigation, LayoutNavigationProps } from '../../components'
import { graphqlSsrClient, graphqlSharedClient } from '../../lib/graphql/graphqlSsrClient'

type Props = CmsPageQuery
type RouteProps = { url: string[] }
type GetPageStaticPaths = GetStaticPaths<RouteProps>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props, RouteProps>

function CmsPage(props: Props) {
  const { cmsPage } = props

  return (
    <>
      <PageMeta
        title={cmsPage?.title ?? ''}
        metaDescription={cmsPage?.meta_description ?? cmsPage?.title ?? ''}
        canonical={`/${cmsPage.url_key}`}
      />

      <Container maxWidth="lg">
        <LayoutTitle variant='h1'>{cmsPage?.content_heading ?? cmsPage?.title ?? ''}</LayoutTitle>
        {cmsPage && (
          <CmsRowRenderer cmsRowContent={cmsPage?.cmsRowContent} />
        )}
      </Container>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}
CmsPage.pageOptions = pageOptions

export default CmsPage

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const getStaticPaths: GetPageStaticPaths = async ({ locales = [] }) => {
  if (process.env.NODE_ENV === 'development') return { paths: [], fallback: 'blocking' }

  const path = async (locale: string) => {
    const client = graphqlSsrClient(locale)
    const { data } = await client.query({
      query: CmsPageListDocument
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return data?.CmsPageList?.items.map((page) => ({
      params: { url: page?.identifier?.split('/') }, locale
    }))
  }

  const paths = (await Promise.all(locales.map(path))).flat(1)

  return { paths, fallback: 'blocking' }
}

/**
 * Generate staticProps
 * @param locale
 * @param params
 */
export const getStaticProps: GetPageStaticProps = async ({ locale, params }) => {
  const url = params?.url.join('/')
  if (!url) return { notFound: true }

  const client = graphqlSharedClient(locale)
  const staticClient = graphqlSsrClient(locale)

  const cmsPage = staticClient.query({
    query: CmsPageDocument,
    variables: { url },
  })

  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: 'cache-first',
  })

  if (!(await cmsPage).data?.cmsPage) return { notFound: true }

  return {
    props: {
      ...(await cmsPage).data,
      ...(await layout).data,
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}