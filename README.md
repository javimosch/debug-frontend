# debug-browser

Alternative pure JS implementation of npm debug library for browser.

This library provides a simple and effective way to control debug logging in your browser-based JavaScript projects. It's a lightweight, dependency-free alternative to the popular `debug` library, designed specifically for the browser.

## Features

*   **Lightweight and dependency-free:** Pure JavaScript, no external libraries needed.
*   **Namespace-based logging:** Enable and disable logs for specific parts of your application.
*   **localStorage control:** Control debug logs from the browser's developer console.
*   **Color-coded output:** Namespaces are automatically assigned colors for easy identification.
*   **UMD and ES Module builds:** Use it in any project, modern or legacy.

## Installation

Since this is a dependency-free library, you can either clone this repository or download the built files from the `dist` directory and include them in your project.

```bash
npm install
```

## Usage

### ES Module (Recommended)

```javascript
import debug from './dist/index.mjs';

const log = debug('app:log');
log('This is a log message');
```

### UMD (for older browsers or non-module setups)

Include the script in your HTML:

```html
<script src="./dist/index.js"></script>
```

Then you can use the `debug` function globally:

```javascript
const log = debug('app:log');
log('This is a log message');
```

### Controlling Logs

To enable logs, open your browser's developer console and set the `localStorage.debug` item:

```javascript
localStorage.debug = 'app:*'; // Enable all logs under the 'app' namespace
```

## Building

To build the project, run the following command. This will generate the UMD and ES Module builds in the `dist` directory.

```bash
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
