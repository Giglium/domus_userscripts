const fs = require("node:fs");
const path = require("path");
const { monkey } = require("webpack-monkey");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const scriptsDir = path.join(__dirname, "src");
const entries = Object.fromEntries(
  fs
    .readdirSync(scriptsDir, { withFileTypes: true })
    .filter(
      (item) =>
        item.isDirectory() &&
        fs.existsSync(path.join(scriptsDir, item.name, "index.js")),
    )
    .map((item) => {
      if (!fs.existsSync(path.join(scriptsDir, item.name, "meta.json"))) {
        throw new Error(`Missing meta.json for ${item.name}`);
      }
      return [item.name, `./src/${item.name}/index.js`];
    }),
);

if (Object.keys(entries).length === 0) {
  throw new Error("No userscripts found under src/");
}

module.exports = monkey({
  entry: entries,
  mode: "production",
  monkey: {
    beautify: {
      prettier: false,
    },
  },
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
});
