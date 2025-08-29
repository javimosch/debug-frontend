/**
 * ES6 Browser Implementation of debug()
 * Modern ES6+ version with ES modules support
 */

// Store original console for logging without recursion
const originalConsole =
  typeof console !== 'undefined'
    ? console
    : {
        log: function () {},
        debug: function () {},
        warn: function () {},
        error: function () {},
      }

const colors = [
  '#0000CC',
  '#0000FF',
  '#0033CC',
  '#0033FF',
  '#0066CC',
  '#0066FF',
  '#0099CC',
  '#0099FF',
  '#00CC00',
  '#00CC33',
  '#00CC66',
  '#00CC99',
  '#00CCCC',
  '#00CCFF',
  '#3300CC',
  '#3300FF',
  '#3333CC',
  '#3333FF',
  '#3366CC',
  '#3366FF',
  '#3399CC',
  '#3399FF',
  '#33CC00',
  '#33CC33',
  '#33CC66',
  '#33CC99',
  '#33CCCC',
  '#33CCFF',
  '#6600CC',
  '#6600FF',
  '#6633CC',
  '#6633FF',
  '#66CC00',
  '#66CC33',
  '#9900CC',
  '#9900FF',
  '#9933CC',
  '#9933FF',
  '#99CC00',
  '#99CC33',
  '#CC0000',
  '#CC0033',
  '#CC0066',
  '#CC0099',
  '#CC00CC',
  '#CC00FF',
  '#CC3300',
  '#CC3333',
  '#CC3366',
  '#CC3399',
  '#CC33CC',
  '#CC33FF',
  '#CC6600',
  '#CC6633',
  '#CC9900',
  '#CC9933',
  '#CCCC00',
  '#CCCC33',
  '#FF0000',
  '#FF0033',
  '#FF0066',
  '#FF0099',
  '#FF00CC',
  '#FF00FF',
  '#FF3300',
  '#FF3333',
  '#FF3366',
  '#FF3399',
  '#FF33CC',
  '#FF33FF',
  '#FF6600',
  '#FF6633',
  '#FF9900',
  '#FF9933',
  '#FFCC00',
  '#FFCC33',
]

/**
 * Check if browser supports colors in console
 * @returns {boolean} True if colors are supported
 */
function supportsColors() {
  // Electron renderer
  if (
    typeof window !== 'undefined' &&
    window.process &&
    (window.process.type === 'renderer' || window.process.__nwjs)
  ) {
    return true
  }

  // Edge/IE
  if (
    typeof navigator !== 'undefined' &&
    navigator.userAgent &&
    navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)
  ) {
    return false
  }

  let match
  return (
    // WebKit
    (typeof document !== 'undefined' &&
      document.documentElement &&
      document.documentElement.style &&
      document.documentElement.style.WebkitAppearance) ||
    // Firebug
    (typeof window !== 'undefined' &&
      window.console &&
      (window.console.firebug ||
        (window.console.exception && window.console.table))) ||
    // Firefox >= v31
    (typeof navigator !== 'undefined' &&
      navigator.userAgent &&
      (match = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) &&
      parseInt(match[1], 10) >= 31) ||
    // WebKit in worker
    (typeof navigator !== 'undefined' &&
      navigator.userAgent &&
      navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
  )
}

/**
 * Get localStorage or fallback
 * @returns {Storage} Storage instance
 */
function getStorage() {
  try {
    return localStorage
  } catch (error) {
    // Safari private mode or cookies disabled
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  }
}

/**
 * Save debug namespaces to storage
 * @param {string} namespaces - Comma-separated namespace patterns
 */
function saveNamespaces(namespaces) {
  const storage = getStorage()
  try {
    if (namespaces) {
      storage.setItem('debug', namespaces)
    } else {
      storage.removeItem('debug')
    }
  } catch (error) {
    // Ignore storage errors
  }
}

/**
 * Load debug namespaces from storage
 * @returns {string} Namespace patterns
 */
function loadNamespaces() {
  const storage = getStorage()
  let namespaces
  try {
    namespaces = storage.getItem('debug') || storage.getItem('DEBUG')
  } catch (error) {
    // Ignore storage errors
  }

  // Check environment variable in Node.js/Electron
  if (!namespaces && typeof process !== 'undefined' && process.env) {
    namespaces = process.env.DEBUG
  }

  return namespaces || ''
}

/**
 * Format arguments for console output with colors
 * @param {Array} args - Arguments to format
 * @param {Object} debugInstance - Debug instance with namespace and color
 * @returns {Array} Formatted arguments
 */
function formatArgsWithColors(args, debugInstance) {
  const { namespace, diff, color, useColors } = debugInstance

  if (!useColors) {
    args[0] = `${namespace} ${args[0]} +${humanize(diff)}`
    return args
  }

  const colorStyle = `color: ${color}`
  const resetStyle = 'color: inherit'

  args[0] = `%c${namespace}%c ${args[0]} %c+${humanize(diff)}`

  // Insert color styles at correct positions
  const styles = [colorStyle, resetStyle, colorStyle]
  args.splice(1, 0, ...styles)

  return args
}

/**
 * Humanize diff time
 * @param {number} diff - Time difference in milliseconds
 * @returns {string} Human-readable time
 */
function humanize(diff) {
  if (diff < 1000) {
    return `${diff}ms`
  }
  if (diff < 60000) {
    return `${(diff / 1000).toFixed(1)}s`
  }
  return `${(diff / 60000).toFixed(1)}m`
}

function revertConsoleOverride() {
  window.console = originalConsole;
}

/**
 * Create debug logger function
 * @param {string} namespace - Debug namespace
 * @returns {Function} Debug logger
 */
function createDebug(namespace) {
  let curr = Date.now()
  let prevTime = curr

  const colorIndex =
    (namespace.charCodeAt(0) + namespace.length) % colors.length
  const color = colors[colorIndex]
  const useColors = supportsColors()

  function debug(...args) {
    if (!debug.enabled) return

    const currTime = Date.now()
    const diff = currTime - prevTime
    prevTime = currTime

    const formattedArgs = formatArgsWithColors([...args], {
      namespace,
      diff,
      color,
      useColors,
    })

    const logFn = originalConsole.debug || originalConsole.log || (() => {})
    logFn(...formattedArgs)
  }

  debug.namespace = namespace
  debug.enabled = false // Will be set by debuggers.create
  debug.color = color
  debug.useColors = useColors
  debug.destroy = () => {
    originalConsole.warn(
      'debug.destroy() is deprecated and will be removed in the next major version'
    )
  }

  return debug
}

/**
 * Enable/disable debug namespaces
 * @param {string} namespaces - Comma-separated patterns
 * @returns {void}
 */
function enable(namespaces) {
  const split = namespaces.split(/[\s,]+/)
  const len = split.length

  for (let i = 0; i < len; i++) {
    if (!split[i]) continue

    const ns = split[i].replace(/\*/g, '.*?')

    if (ns[0] === '-') {
      debuggers.skips.push(new RegExp('^' + ns.slice(1) + '$'))
    } else {
      debuggers.names.push(new RegExp('^' + ns + '$'))
    }
  }

  // Update enabled state for all debug instances
  for (const key in debuggers.instances) {
    const instance = debuggers.instances[key]
    instance.enabled = debuggers.enabled(instance.namespace)
  }
}

/**
 * Check if namespace is enabled
 * @param {string} namespace - Namespace to check
 * @returns {boolean} True if enabled
 */
function isEnabled(namespace) {
  for (let i = 0; i < debuggers.skips.length; i++) {
    if (debuggers.skips[i].test(namespace)) {
      return false
    }
  }

  for (let i = 0; i < debuggers.names.length; i++) {
    if (debuggers.names[i].test(namespace)) {
      return true
    }
  }

  return false
}

/**
 * Debuggers registry
 */
const debuggers = {
  names: [],
  skips: [],
  instances: {},

  enabled(namespace) {
    return isEnabled(namespace)
  },

  create(namespace) {
    if (debuggers.instances[namespace]) {
      return debuggers.instances[namespace]
    }

    const debugFn = createDebug(namespace)
    debugFn.enabled = debuggers.enabled(namespace)
    debuggers.instances[namespace] = debugFn

    return debugFn
  },
}

/**
 * Main debug function
 * @param {string} namespace - Debug namespace
 * @returns {Function} Debug logger
 */
function debug(namespace) {
  return debuggers.create(namespace)
}

// Initialize from storage
const savedNamespaces = loadNamespaces()
if (savedNamespaces) {
  enable(savedNamespaces)
}

// Export debug function and utilities
debug.enabled = isEnabled
debug.enable = enable
debug.disable = () => {
  debuggers.names = []
  debuggers.skips = []
  for (const key in debuggers.instances) {
    debuggers.instances[key].enabled = false
  }
}
debug.refresh = () => {
  // Clear current patterns
  debuggers.names = []
  debuggers.skips = []
  
  // Reload from localStorage and re-enable
  const savedNamespaces = loadNamespaces()
  if (savedNamespaces) {
    enable(savedNamespaces)
  } else {
    // If no namespaces, disable all instances
    for (const key in debuggers.instances) {
      debuggers.instances[key].enabled = false
    }
  }
  
  originalConsole.log('Debug: refreshed from localStorage.debug =', savedNamespaces || 'null')
}
debug.humanize = humanize
debug.colors = colors
debug.inspectOpts = Object.freeze({
  colors: supportsColors(),
  depth: 2,
})

debug.getNames = () => {
  return Object.keys(debuggers.instances)
}

debug.getAvailablePatterns = () => {
  const namespaces = Object.keys(debuggers.instances)
  const patterns = new Set()
  
  // Add root-level wildcards (e.g., app:*, debug:*)
  const rootPrefixes = new Set()
  namespaces.forEach((ns) => {
    const parts = ns.split(':')
    if (parts.length >= 1) {
      rootPrefixes.add(parts[0])
    }
  })
  
  rootPrefixes.forEach((prefix) => {
    patterns.add(`${prefix}:*`)
  })
  
  // Add second-level wildcards (e.g., app:LocationV3:*, debug:mode:*)
  const secondLevelPrefixes = new Set()
  namespaces.forEach((ns) => {
    const parts = ns.split(':')
    if (parts.length >= 2) {
      const prefix = parts.slice(0, 2).join(':')
      secondLevelPrefixes.add(prefix)
    }
  })
  
  secondLevelPrefixes.forEach((prefix) => {
    patterns.add(`${prefix}:*`)
  })
  
  return [...patterns].sort()
}

debug.revertConsoleOverride = revertConsoleOverride;

// Add debug logging for troubleshooting
/* originalConsole.log('Debug: initialized');
originalConsole.log('Debug: loaded namespaces:', loadNamespaces());
originalConsole.log('Debug: patterns:', debuggers.names.map(r => r.toString()));
originalConsole.log('Debug: skips:', debuggers.skips.map(r => r.toString())); */

// Test debug instances
/* setTimeout(() => {
  const testDebug1 = debug('app:test')
  const testDebug2 = debug('other:test')
  console.log('Debug: app:test enabled:', testDebug1.enabled)
  console.log('Debug: other:test enabled:', testDebug2.enabled)
}, 0) */

// Manual test function for browser console
window.testDebug = function () {
  originalConsole.log('=== Debug Test ===')
  originalConsole.log('localStorage.debug:', localStorage.getItem('debug'))
  originalConsole.log(
    'Patterns:',
    debuggers.names.map((r) => r.toString())
  )
  originalConsole.log(
    'Skips:',
    debuggers.skips.map((r) => r.toString())
  )
  originalConsole.log('Instances:', Object.keys(debuggers.instances))

  // Test specific namespaces
  setTimeout(() => {
    const namespaces = [
      'app:debug',
      'app:info',
      'other:debug',
      'test:namespace',
    ]
    namespaces.forEach((ns) => {
      const logger = debug(ns)
      originalConsole.log(`${ns}: enabled=${logger.enabled}`)
      logger('Test message')
    })
  }, 0)
}

// ES6 exports
export default debug
export {
  debug,
  supportsColors as useColors,
  saveNamespaces as save,
  loadNamespaces as load,
  colors,
}

debug.install = install
debug.disableShorcut = false
window.debug = debug

debug.install()

function install() {
  const _originalConsole = window.console
  let newConsole = null

  overrideConsoleWithDebug()
  bindKeyShorcut()

  

  function overrideConsoleWithDebug() {
    newConsole = {
      ..._originalConsole,
      debug: debug('app:debug'),
      log: debug('app:log'),
      info: debug('app:info'),
      warn: debug('app:warn'),
      error: debug('app:error'),
      debugVerbose: debug('app:debugVerbose'),
      debugVerboseScope: debug('app:debugVerboseScope'),
      configure: consoleShow,
      replicate(namespace, namespacePrefix = 'app:') {
        return getNewConsole(namespace, namespacePrefix)
      },
      trackTime: trackTime,
    }

    window.console = newConsole
  }

  function getNewConsole(namespace, namespacePrefix = 'app:') {
    const prefix = namespacePrefix || ''
    const fullNamespace = prefix + namespace

    const newConsoleWithNamespace = {
      ..._originalConsole,
      debug: debug(fullNamespace + ':debug'),
      log: debug(fullNamespace + ':log'),
      info: debug(fullNamespace + ':info'),
      warn: debug(fullNamespace + ':warn'),
      error: debug(fullNamespace + ':error'),
      debugVerbose: debug(fullNamespace + ':debugVerbose'),
      debugVerboseScope: debug(fullNamespace + ':debugVerboseScope'),
      configure: consoleShow,
      replicate(namespace, namespacePrefix = 'app:') {
        return getNewConsole(namespace, namespacePrefix)
      },
      trackTime: trackTime,
    }

    return newConsoleWithNamespace
  }

  /**
   * let tracker = console.trackTime(
        'table: destroy table instance',
        shouldLog
      )
      this.datatable.destroy()
      tracker.stop()
   */
  function trackTime() {
    let parent = this
    const startTime = Date.now()

    // Common stop logic that can be reused
    function stopLogic() {
      try {
        this._init()
        const elapsed = Date.now() - this.start
        const timeStr = typeof humanize === 'function' ? humanize(elapsed) : elapsed + 'ms'
        this.console.log('Time taken: ' + timeStr)
      } catch (e) {
        // Fallback to window.console if there's an issue
        const elapsed = Date.now() - this.start
        window.console && window.console.log && window.console.log('Time taken: ' + elapsed + 'ms')
      }
    }

    const tracker = {
      start: startTime,
      _init(){
        if(!this.console){
          this.console = parent && parent.replicate ? parent.replicate('trackTime') : window.console
        }
      },
      stop: null, // Will be bound below
      count: null // Will be bound below
    }

    // Bind the common logic to the tracker object
    tracker.stop = stopLogic.bind(tracker)
    tracker.count = stopLogic.bind(tracker)

    // Make tracker itself callable for retrocompatibility (same as stop)
    function callableTracker() {
      return tracker.stop()
    }

    // Copy all tracker properties to the callable function
    Object.assign(callableTracker, tracker)

    return callableTracker
  }

  /**
   * Displays a centered modal programatically where the user can set the debug namespaces to toggle on/off
   * or customize the raw localStorage.debug value it self
   *
   * Available namespaces can be retrieved using debug.getNames()
   *
   */
  function consoleShow() {
    // Create modal container
    const modal = document.createElement('div')
    modal.id = 'debug-modal'
    modal.style.cssText = `
	  position: fixed;
	  top: 50%;
	  left: 50%;
	  transform: translate(-50%, -50%);
	  background: white;
	  border: 2px solid #ccc;
	  border-radius: 8px;
	  padding: 20px;
	  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
	  z-index: 999999999999;
	  max-width: 500px;
	  max-height: 80vh;
	  overflow-y: auto;
	  font-family: monospace;
	  font-size: 14px;
	`

    // Create modal content
    modal.innerHTML = `
	  <div style="margin-bottom: 15px;">
		<h3 style="margin: 0 0 10px 0; color: #333;">Debug Configuration</h3>
		<button data-dismiss="modal" onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
	  </div>
	  
	  <div style="margin-bottom: 15px;">
		<label style="display: block; margin-bottom: 5px; font-weight: bold;">Current Debug Value:</label>
		<input type="text" id="debug-input" value="${
      localStorage.getItem('debug') || ''
    }" 
			   style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;" 
			   placeholder="e.g., app:* or debug:*">
		<button onclick="window.debug.enable(document.getElementById('debug-input').value); localStorage.setItem('debug', document.getElementById('debug-input').value); window.debug.refresh(); document.querySelector('#debug-modal [data-dismiss]').click();" 
				style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
		  Apply
		</button>
		<button onclick="window.debug.refresh(); console.log('Debug refreshed from localStorage');" 
				style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
		  Refresh
		</button>
		<button onclick="document.getElementById('debug-input').value = ''; localStorage.removeItem('debug'); window.debug.disable(); window.debug.refresh(); document.querySelector('#debug-modal [data-dismiss]').click();" 
				style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
		  Clear All
		</button>
	  </div>
	  
	  <div style="margin-bottom: 15px;">
		<label style="display: block; margin-bottom: 5px; font-weight: bold;">Wildcard Patterns:</label>
		<div id="wildcard-patterns" style="display: flex; flex-wrap: wrap; gap: 5px; max-height: 300px; overflow-y: auto;"></div>
	  </div>
	`

    // Note: Quick toggles removed - consolidated into wildcard patterns section

    // Generate unified wildcard patterns using the new method
    const wildcardPatterns = modal.querySelector('#wildcard-patterns')
    const patterns = window.debug && window.debug.getAvailablePatterns 
      ? window.debug.getAvailablePatterns() 
      : []

    // Create buttons for all wildcard patterns
    patterns.forEach((pattern) => {
      const container = document.createElement('div')
      container.style.cssText = 'display: inline-block; margin: 2px;'

      const mainBtn = document.createElement('button')
      mainBtn.textContent = pattern
      mainBtn.style.cssText =
        'padding: 4px 8px; background: #6f42c1; color: white; border: none; border-radius: 3px 0 0 3px; cursor: pointer; font-size: 12px;'
      mainBtn.onclick = () => {
        document.getElementById('debug-input').value = pattern
      }

      const addBtn = document.createElement('button')
      addBtn.textContent = '+'
      addBtn.style.cssText =
        'padding: 4px 6px; background: #17a2b8; color: white; border: none; border-radius: 0 3px 3px 0; cursor: pointer; font-size: 12px; margin-left: 1px;'
      addBtn.onclick = () => {
        addToDebugValue(pattern)
      }

      container.appendChild(mainBtn)
      container.appendChild(addBtn)
      wildcardPatterns.appendChild(container)
    })

    // Remove existing modal and backdrop if any
    const existingModal = document.getElementById('debug-modal')
    const existingBackdrop = document.querySelector('#debug-modal-backdrop')
    if (existingModal) {
      existingModal.remove()
    }
    if (existingBackdrop) {
      existingBackdrop.remove()
    }

    // Add modal to page
    document.body.appendChild(modal)

    // Add backdrop
    const backdrop = document.createElement('div')
    backdrop.id = 'debug-modal-backdrop'
    backdrop.style.cssText = `
	  position: fixed;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  background: rgba(0,0,0,0.5);
	  z-index: 9999;
	`
    backdrop.onclick = () => {
      modal.remove()
      backdrop.remove()
    }
    document.body.appendChild(backdrop)

    // Add helper function to add to debug value
    window.addToDebugValue = (pattern) => {
      const input = document.getElementById('debug-input')
      const currentValue = input.value.trim()
      const values = currentValue
        ? currentValue
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v)
        : []

      if (!values.includes(pattern)) {
        values.push(pattern)
        input.value = values.join(',')
      }
    }

    // Clean up when modal is closed via X button or other means
    modal.addEventListener('remove', () => {
      if (backdrop.parentNode) backdrop.remove()
    })

    // Add close button functionality
    const closeBtn = modal.querySelector('button[onclick*="remove()"]')
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.remove()
        backdrop.remove()
      }
    }
  }

  const debugModal = console.replicate('debugModalShortcut', 'debug:')
  function bindKeyShorcut() {
    let sequence = []
    const targetSequence = ['SHIFT', 'D', 'ENTER']

    window.addEventListener('keydown', (e) => {
      const key = typeof e?.key === 'string' ? e.key.toUpperCase() : null
      if (!key) return

      sequence.push(key)

      if (sequence.length > 10) {
        sequence = sequence.slice(-10)
      }

      debugModal.log(`${key} was pressed`, {
        sequence,
        targetSequence,
        includesTargetSequence: sequence
          .join(',')
          .includes(targetSequence.join(',')),
      })

      // Check if the sequence matches Shift+d+d+Enter
      if (sequence.join(',').includes(targetSequence.join(','))) {
        sequence = [] // Reset sequence

        if (
          (typeof window?.debug?.disableShorcut === 'function' &&
            !window?.debug?.disableShorcut()) ||
          (typeof window?.debug?.disableShorcut === 'boolean' &&
            !window?.debug?.disableShorcut)
        ) {
          debugModal.log('Calling debug modal')
          consoleShow()
        }
      }

      const dismissBtn = document.querySelector('#debug-modal [data-dismiss]')
      if (key === 'ESCAPE' && dismissBtn) {
        debugModal.log('Closing debug modal')
        dismissBtn.click()
      }

      // Reset sequence after 1 second of inactivity
      clearTimeout(window.debugShortcutTimer)
      window.debugShortcutTimer = setTimeout(() => {
        sequence = []
      }, 2000)
    })
  }
}
