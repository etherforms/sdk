const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    plugins: [new CompressionPlugin()],
    entry: [
        __dirname + "/src/index.ts",
        __dirname + "/src/scss/etherforms.scss"
    ],
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss"],
        modules: ["src", "node_modules"] // Assuming that your files are inside the src dir
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [],
            }, {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "file-loader",
                        options: { outputPath: "/", name: "[name].min.css" }
                    },
                    "sass-loader"
                ]
            }
        ]
    }
});
