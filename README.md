# debug-frontend

Alternative pure JS implementation of npm debug library for browser.

This library provides a simple and effective way to control debug logging in your browser-based JavaScript projects. It's a lightweight, dependency-free alternative to the popular `debug` library, designed specifically for the browser.

## Features

*   **Lightweight and Zero-Dependency:** Built with pure JavaScript, `debug-frontend` has no external dependencies. This ensures a minimal bundle size and eliminates concerns about third-party vulnerabilities, making it a secure and efficient choice for your projects.
*   **Namespace-based logging:** Enable and disable logs for specific parts of your application.
*   **Automatic Console Overriding:** Automatically overrides the native `console` methods to provide namespaced logging out of the box.
*   **Runtime UI:** A built-in UI to control debug namespaces at runtime, triggered by a keyboard shortcut (Shift+D+Enter) or by calling `console.configure()`.
*   **localStorage control:** Control debug logs from the browser's developer console.
*   **Color-coded output:** Namespaces are automatically assigned colors for easy identification.
*   **UMD and ES Module builds:** Use it in any project, modern or legacy.

## Installation

```bash
npm install debug-frontend
```

## Usage

### ES Module (Recommended)

```javascript
import debug from 'debug-frontend';

const log = debug('app:log');
log('This is a log message');
```

### UMD (for older browsers or non-module setups)

Include the script in your HTML:

```html
<script src="node_modules/debug-frontend/dist/index.js"></script>
```

Then you can use the `debug` function globally:

```javascript
const log = debug('app:log');
log('This is a log message');
```

### Controlling Logs

There are two ways to control which debug logs are shown:

1.  **Using `localStorage`:** Open your browser's developer console and set the `localStorage.debug` item:

    ```javascript
    localStorage.debug = 'app:*'; // Enable all logs under the 'app' namespace
    ```

2.  **Using the Runtime UI:** Press `Shift+D+Enter` in your browser to bring up the debug configuration UI. This allows you to toggle namespaces on and off without having to manually edit `localStorage`.

## Advanced Usage

### Overriding the Native Console

By default, `debug-frontend` will override the native `console` methods (`log`, `info`, `warn`, `error`, etc.) with its own namespaced versions. This means that all of your existing `console.log()` calls will automatically become part of the `debug-frontend` system, under the `app` namespace (e.g., `app:log`, `app:info`).

This is useful for quickly adding debug capabilities to an existing project without having to change all of your logging statements.

### Creating Namespaced Consoles with `replicate()`

For more granular control, especially in larger applications or component-based libraries, you can use the `console.replicate()` method to create a new `console` object with its own namespace.

This is useful for creating a logger that is specific to a particular component or module.

```javascript
// Create a new console object for your component
const myComponentConsole = console.replicate('MyComponent');

// Now you can use the new console object to log messages
myComponentConsole.log('This is a log message from MyComponent');
myComponentConsole.warn('This is a warning from MyComponent');

// These logs will have the namespaces 'app:MyComponent:log' and 'app:MyComponent:warn' respectively.
```

### Reverting Console Override

If you need to restore the original native `console` object after `debug-frontend` has overridden it, you can use the `debug.revertConsoleOverride()` method.

```javascript
import debug from 'debug-frontend';

// Revert the console override
debug.revertConsoleOverride();

// Now, subsequent console.log calls will use the browser's native console
console.log('This message goes to the native console.');
```

## Configuration

### Disabling the Runtime UI

In a production environment, you may want to disable the keyboard shortcut for the runtime UI. You can do this by setting the `disableShorcut` flag on the `debug` object:

```javascript
import debug from 'debug-frontend';

debug.disableShorcut = true;
```

## Building

To build the project from source, run the following command. This will generate the UMD and ES Module builds in the `dist` directory.

```bash
npm install
npm run build
```

### Bundle Sizes

The raw minified sizes of the bundles are approximately 12KB each. When served with Gzip compression (common on web servers), the actual transfer sizes are significantly smaller:

*   **ES Module (`dist/index.mjs`):** ~4.0KB (gzipped)
*   **UMD (`dist/index.js`):** ~8.0KB (gzipped)

For even smaller sizes, consider Brotli compression. You can test Brotli compression on your system using the `brotli` command-line tool (if installed):

```bash
brotli dist/index.mjs
brotli dist/index.js
```

## Testing

To test the library, you can use the provided test pages. First, start the server:

```bash
npm run test
```

Then, open one of the following pages in your browser:

*   [http://localhost:3000/index.html](http://localhost:3000/index.html) (for the ES Module build)
*   [http://localhost:3000/index-umd.html](http://localhost:3000/index-umd.html) (for the UMD build)

## License

This project is licensed under the ISC License.
