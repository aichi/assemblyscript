![](https://s.gravatar.com/avatar/f105de3decfafc734b8eabe9a960b25d?size=48) webpack
=================

[webpack](https://webpack.js.org/) loader for [AssemblyScript](http://assemblyscript.org) modules.

Usage
-----

```js
import MyModule from "@assemblyscript/webpack!mymodule.wasm";

var myModule = new MyModule({ imports: { /* if any */ } });
```

TODO: Pipe .ts files through `asc`, accepting the usual options, but also keep raw .wasm support.
