const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
          new WorkboxWebpackPlugin.GenerateSW({
            swDest: './sw.bundle.js',
            skipWaiting: true,
            clientsClaim: true,
            runtimeCaching: [
              {
                urlPattern: ({ url }) => url.href.startsWith('https://restaurant-api.dicoding.dev/list'),
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'restoran-api',
                },
              },
              {
                urlPattern: ({ url }) => url.href.startsWith('https://restaurant-api.dicoding.dev/images/medium/'),
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'restoran-image-api',
                },
              },
              {
                urlPattern: ({ url }) => url.href.startsWith('https://restaurant-api.dicoding.dev/detail/'),
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'restoran-detail-api',
                },
              },
              {
                urlPattern: ({ url }) => url.href.startsWith('https://restaurant-api.dicoding.dev//search?q='),
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'restoran-search-api',
                },
              },
            ],
          }),
        ],
      },
    ],
  },
});
