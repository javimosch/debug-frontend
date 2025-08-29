# debug-browser

Alternative pure JS implementation of npm debug library for browser.

This library provides a simple and effective way to control debug logging in your browser-based JavaScript projects. It's a lightweight, dependency-free alternative to the popular `debug` library, designed specifically for the browser.

## Features

*   **Lightweight and dependency-free:** Pure JavaScript, no external libraries needed.
*   **Namespace-based logging:** Enable and disable logs for specific parts of your application.
*   **Runtime UI:** A built-in UI to control debug namespaces at runtime, triggered by a keyboard shortcut (Shift+D+Enter) or by calling `console.configure()`.
*   **localStorage control:** Control debug logs from the browser's developer console.
*   **Color-coded output:** Namespaces are automatically assigned colors for easy identification.
*   **UMD and ES Module builds:** Use it in any project, modern or legacy.

## Installation

```bash
npm install debug-browser
```

## Usage

### ES Module (Recommended)

```javascript
import debug from 'debug-browser';

const log = debug('app:log');
log('This is a log message');
```

### UMD (for older browsers or non-module setups)

Include the script in your HTML:

```html
<script src="node_modules/debug-browser/dist/index.js"></script>
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

## Configuration

### Disabling the Runtime UI

In a production environment, you may want to disable the keyboard shortcut for the runtime UI. You can do this by setting the `disableShorcut` flag on the `debug` object:

```javascript
import debug from 'debug-browser';

debug.disableShorcut = true;
```

## Building

To build the project from source, run the following command. This will generate the UMD and ES Module builds in the `dist` directory.

```bash
npm install
npm run build
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