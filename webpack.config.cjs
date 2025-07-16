const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

require("dotenv").config(); 

module.exports = {
  mode: "production",
  entry: {
    ui: "./src/ui.ts", 
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    library: "FigmaUI",
    libraryTarget: "var"
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      fs: false,
      path: false,
      os: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use:[
          "ts-loader",
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
      ]}
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.VERCEL_API_BASE_URL": JSON.stringify(process.env.VERCEL_API_BASE_URL),
      "process.env.FIGMA_PLUGIN_API_KEY": JSON.stringify(process.env.FIGMA_PLUGIN_API_KEY),
    }),
    new HtmlWebpackPlugin({
      template: "./src/ui.html",
      filename: "ui.html",
      inlineSource: '.(js)$',
      chunks: ["ui"],
      inject: "body",
    }),
    new HtmlInlineScriptPlugin(),
  ],
};
