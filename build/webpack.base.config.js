const path = require("path");
const nodeExternals = require("webpack-node-externals");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
// const 

const translateEnvToMode = (env) => {
  if (env === "production") {
    return "production";
  }
  return "development";
};

module.exports = env => {
  return {
    target: "electron-renderer",
    mode: translateEnvToMode(env),
    node: {
      __dirname: false,
      __filename: false
    },
    externals: [nodeExternals()],
    resolve: {
      alias: {
        env: path.resolve(__dirname, `../config/env_${env}.json`)
      }
    },
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader"]
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'assets/css/[name].[ext]'
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new FriendlyErrorsWebpackPlugin({ clearConsole: env === "development" })
    ]
  };
};
