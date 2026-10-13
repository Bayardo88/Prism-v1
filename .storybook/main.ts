import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)', '../docs/**/*.mdx'],
  addons: [
    '@storybook/addon-a11y',
    // GitHub-flavoured Markdown in the MDX spec pages (tables) — without it pipe tables render as raw text.
    { name: '@storybook/addon-docs', options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } } },
    '@storybook/addon-vitest'
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  typescript: { reactDocgen: 'react-docgen-typescript' },
};
export default config;
