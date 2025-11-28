import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/client/index.tsx',
  output: {
    file: 'dist/client/index.js',
    format: 'amd',
    exports: 'named',
    intro: 'var process = { env: { NODE_ENV: "production" }, browser: true };',
    globals: {
      '@nocobase/client': 'NocoBaseClient',
      'react': 'React',
      'react-dom': 'ReactDOM',
      'react-i18next': 'ReactI18next',
      'react-router-dom': 'ReactRouterDOM',
      'antd': 'Antd',
      '@ant-design/icons': 'AntdIcons',
      'pdfjs-dist': 'pdfjsLib',
      'react-pdf': 'ReactPDF',
      'file-saver': 'FileSaver'
    },
  },
  plugins: [
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      ignore: ['canvas', 'jsdom']
    }),
    babel({
      babelHelpers: 'bundled',
      presets: [
        ['@babel/preset-env', { modules: false }],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      include: ['src/client/**/*'],
      exclude: 'node_modules/**',
    }),
  ],
  external: [
    '@nocobase/client',
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react-i18next',
    'react-router-dom',
    'antd',
    '@ant-design/icons',
    'canvas',
    'jsdom'
  ],
};
