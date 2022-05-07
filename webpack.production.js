const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    plugins: [new CompressionPlugin()],
    entry: "./src/index.ts",
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss"],
        modules: ["src", "node_modules"] // Assuming that your files are inside the src dir
    },
    devtool: "source-map"
});
