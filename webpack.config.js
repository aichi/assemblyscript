const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

// Build the C-like library
const lib = {
  entry: [ "./src/glue/js", "./src/index.ts" ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  externals: [ "binaryen" ],
  resolve: {
    extensions: [ ".ts", ".js" ]
  },
  output: {
    filename: "assemblyscript.js",
    path: path.resolve(__dirname, "dist"),
    library: "assemblyscript",
    libraryTarget: "umd"
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      sourceMap: true
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: "assemblyscript.js.map"
    })
  ]
};

// Build asc for browser usage
const BabelMinifyPlugin = require("babel-minify-webpack-plugin");
const bin = {
  context: path.join(__dirname, "bin"),
  entry: [ "./asc.js" ],
  externals: [{
    "../dist/assemblyscript.js": {
      commonjs: "assemblyscript",
      commonjs2: "assemblyscript",
      amd: "assemblyscript",
      root: "_"
    },
    "./assemblyscript": {
      commonjs: "./assemblyscript",
      commonjs2: "./assemblyscript"
    }
  }],
  node: {
    "fs": "empty",
    "global": true,
    "process": "mock",
    "crypto": "empty"
  },
  output: {
    filename: "asc.js",
    path: path.resolve(__dirname, "dist"),
    library: "asc",
    libraryTarget: "umd"
  },
  plugins: [
    new webpack.DefinePlugin({
      BUNDLE_VERSION: JSON.stringify(require("./package.json").version),
      BUNDLE_LIBRARY: (() => {
        const libDir = path.join(__dirname, "std", "assembly");
        const libFiles = require("glob").sync("**/*.ts", { cwd: libDir });
        const lib = {};
        libFiles.forEach(file => lib["(lib)/" + file.replace(/\.ts$/, "")] = bundleFile(path.join(libDir, file)));
        return lib;
      })(),
      BUNDLE_DEFINITIONS: {
        "assembly": bundleFile(path.join(__dirname, "std", "assembly.d.ts")),
        "portable": bundleFile(path.join(__dirname, "std", "portable.d.ts"))
      },
      __dirname: JSON.stringify(".")
    }),
    new webpack.IgnorePlugin(/\.\/src|package\.json|^(ts\-node|glob|source\-map\-support)$/),
    // Error: original.line and original.column are not numbers -- you probably meant to omit the
    // original mapping entirely and only map the generated position. If so, pass null for the
    // original mapping instead of an object with empty or null values.
    new BabelMinifyPlugin(/* {}, { sourceMap: true } */),
    // new webpack.SourceMapDevToolPlugin({
    //   filename: "asc.js.map"
    // }),
  ]
};

function bundleFile(filename) {
  return JSON.stringify(fs.readFileSync(filename, { encoding: "utf8" }).replace(/\r\n/g, "\n"));
}

module.exports = [ lib, bin ];
