import { LastUpdated, Layout, Navbar } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import './styles.css';
import { commonStructs, apiCategories } from './common';
import { Banner, Head, Search } from 'nextra/components';
import { milkyPackageVersion, milkyVersion } from '@saltify/milky-types';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '🥛 Milky',
  description: 'Milky 协议文档',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          banner={
            <Banner storageKey={'milky-1.1.0'}>🎉 Milky 1.1 已发布！ 🎉</Banner>
          }
          navbar={
            <Navbar
              logo={
                <div style={{ fontSize: '1.15rem' }}>
                  <b>Milky</b> v{milkyVersion} 文档 <div style={{ fontSize: '0.75rem' }}>{milkyPackageVersion}</div>
                </div>
              }
              projectLink={'https://github.com/SaltifyDev/milky'}
            ></Navbar>
          }
          pageMap={[
            ...(await getPageMap()).filter(p => !('route' in p) || p.route !== '/raw-preview'),
            {
              name: 'api',
              route: '/api',
              title: 'API',
              children: Object.entries(apiCategories).map(([name, apiCategory]) => ({
                name,
                route: `/api/${name}`,
                title: apiCategory.name,
              })),
            },
            {
              name: 'struct',
              route: '/struct',
              title: '结构体',
              children: Object.entries(commonStructs).map(([name, struct]) => ({
                name,
                route: `/struct/${name}`,
                title: struct.description,
                frontMater: {},
              })),
            },
          ]}
          docsRepositoryBase="https://github.com/SaltifyDev/milky/tree/main/docs/"
          search={
            <Search
              placeholder="搜索内容..."
              emptyResult="没有找到相关内容"
              errorText="加载索引失败"
              loading="加载中..."
            />
          }
          editLink="在 GitHub 上编辑此页"
          feedback={{
            content: '有问题？提交反馈',
          }}
          lastUpdated={<LastUpdated locale="zh">最后更新于</LastUpdated>}
          themeSwitch={{
            dark: '暗色',
            light: '亮色',
            system: '跟随系统',
          }}
          toc={{
            title: '目录',
            backToTop: '返回顶部',
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
