
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        for (const key in attributes) {
            if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key in node) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function on_outro(callback) {
        outros.callbacks.push(callback);
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                $$.fragment.l(children(options.target));
            }
            else {
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.4.4 */

    function create_fragment(ctx) {
    	var current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base, $location, $routes;

    	

      let { basepath = "/", url = null } = $$props;

      const locationContext = getContext(LOCATION);
      const routerContext = getContext(ROUTER);

      const routes = writable([]); validate_store(routes, 'routes'); subscribe($$self, routes, $$value => { $routes = $$value; $$invalidate('$routes', $routes); });
      const activeRoute = writable(null);
      let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

      // If locationContext is not set, this is the topmost Router in the tree.
      // If the `url` prop is given we force the location to it.
      const location =
        locationContext ||
        writable(url ? { pathname: url } : globalHistory.location); validate_store(location, 'location'); subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });

      // If routerContext is set, the routerBase of the parent Router
      // will be the base for this Router's descendants.
      // If routerContext is not set, the path and resolved uri will both
      // have the value of the basepath prop.
      const base = routerContext
        ? routerContext.routerBase
        : writable({
            path: basepath,
            uri: basepath
          }); validate_store(base, 'base'); subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });

      const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
        // If there is no activeRoute, the routerBase will be identical to the base.
        if (activeRoute === null) {
          return base;
        }

        const { path: basepath } = base;
        const { route, uri } = activeRoute;
        // Remove the potential /* or /*splatname from
        // the end of the child Routes relative paths.
        const path = route.default ? basepath : route.path.replace(/\*.*$/, "");

        return { path, uri };
      });

      function registerRoute(route) {
        const { path: basepath } = $base;
        let { path } = route;

        // We store the original path in the _path property so we can reuse
        // it when the basepath changes. The only thing that matters is that
        // the route reference is intact, so mutation is fine.
        route._path = path;
        route.path = combinePaths(basepath, path);

        if (typeof window === "undefined") {
          // In SSR we should set the activeRoute immediately if it is a match.
          // If there are more Routes being registered after a match is found,
          // we just skip them.
          if (hasActiveRoute) {
            return;
          }

          const matchingRoute = match(route, $location.pathname);
          if (matchingRoute) {
            activeRoute.set(matchingRoute);
            hasActiveRoute = true;
          }
        } else {
          routes.update(rs => {
            rs.push(route);
            return rs;
          });
        }
      }

      function unregisterRoute(route) {
        routes.update(rs => {
          const index = rs.indexOf(route);
          rs.splice(index, 1);
          return rs;
        });
      }

      if (!locationContext) {
        // The topmost Router in the tree is responsible for updating
        // the location store and supplying it through context.
        onMount(() => {
          const unlisten = globalHistory.listen(history => {
            location.set(history.location);
          });

          return unlisten;
        });

        setContext(LOCATION, location);
      }

      setContext(ROUTER, {
        activeRoute,
        base,
        routerBase,
        registerRoute,
        unregisterRoute
      });

    	const writable_props = ['basepath', 'url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('basepath' in $$props) $$invalidate('basepath', basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { $base: 1, $routes: 1, $location: 1 }) => {
    		if ($$dirty.$base) { {
            const { path: basepath } = $base;
            routes.update(rs => {
              rs.forEach(r => (r.path = combinePaths(basepath, r._path)));
              return rs;
            });
          } }
    		if ($$dirty.$routes || $$dirty.$location) { {
            const bestMatch = pick($routes, $location.pathname);
            activeRoute.set(bestMatch);
          } }
    	};

    	return {
    		basepath,
    		url,
    		routes,
    		location,
    		base,
    		$$slots,
    		$$scope
    	};
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["basepath", "url"]);
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.4.4 */

    // (39:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.component !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				on_outro(() => {
    					if_blocks[previous_block_index].d(1);
    					if_blocks[previous_block_index] = null;
    				});
    				if_block.o(1);
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				if_block.i(1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (42:2) {:else}
    function create_else_block(ctx) {
    	var current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (40:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		ctx.routeParams,
    		ctx.routeProps
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.routeParams || changed.routeProps) ? get_spread_update(switch_instance_spread_levels, [
    				(changed.routeParams) && ctx.routeParams,
    				(changed.routeProps) && ctx.routeProps
    			]) : {};

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					on_outro(() => {
    						old_component.$destroy();
    					});
    					old_component.$$.fragment.o(1);
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));

    					switch_instance.$$.fragment.c();
    					switch_instance.$$.fragment.i(1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) switch_instance.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) switch_instance.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) switch_instance.$destroy(detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) && create_if_block(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;

    	

      let { path = "", component = null } = $$props;

      const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER); validate_store(activeRoute, 'activeRoute'); subscribe($$self, activeRoute, $$value => { $activeRoute = $$value; $$invalidate('$activeRoute', $activeRoute); });

      const route = {
        path,
        // If no path prop is given, this Route will act as the default Route
        // that is rendered if no other Route in the Router is a match.
        default: path === ""
      };
      let routeParams = {};
      let routeProps = {};

      registerRoute(route);

      // There is no need to unregister Routes in SSR since it will all be
      // thrown away anyway.
      if (typeof window !== "undefined") {
        onDestroy(() => {
          unregisterRoute(route);
        });
      }

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('component' in $$props) $$invalidate('component', component = $$props.component);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { $activeRoute: 1, $$props: 1 }) => {
    		if ($$dirty.$activeRoute) { if ($activeRoute && $activeRoute.route === route) {
            $$invalidate('routeParams', routeParams = $activeRoute.params);
          } }
    		{
            const { path, component, ...rest } = $$props;
            $$invalidate('routeProps', routeProps = rest);
          }
    	};

    	return {
    		path,
    		component,
    		activeRoute,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["path", "component"]);
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.4.4 */

    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	var a, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	var a_levels = [
    		{ href: ctx.href },
    		{ "aria-current": ctx.ariaCurrent },
    		ctx.props
    	];

    	var a_data = {};
    	for (var i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    			dispose = listen(a, "click", ctx.onClick);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				(changed.href) && { href: ctx.href },
    				(changed.ariaCurrent) && { "aria-current": ctx.ariaCurrent },
    				(changed.props) && ctx.props
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base, $location;

    	

      let { to = "#", replace = false, state = {}, getProps = () => ({}) } = $$props;

      const { base } = getContext(ROUTER); validate_store(base, 'base'); subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });
      const location = getContext(LOCATION); validate_store(location, 'location'); subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });
      const dispatch = createEventDispatcher();

      let href, isPartiallyCurrent, isCurrent, props;

      function onClick(event) {
        dispatch("click", event);

        if (shouldNavigate(event)) {
          event.preventDefault();
          // Don't push another entry to the history stack when the user
          // clicks on a Link to the page they are currently on.
          const shouldReplace = $location.pathname === href || replace;
          navigate(href, { state, replace: shouldReplace });
        }
      }

    	const writable_props = ['to', 'replace', 'state', 'getProps'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('replace' in $$props) $$invalidate('replace', replace = $$props.replace);
    		if ('state' in $$props) $$invalidate('state', state = $$props.state);
    		if ('getProps' in $$props) $$invalidate('getProps', getProps = $$props.getProps);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let ariaCurrent;

    	$$self.$$.update = ($$dirty = { to: 1, $base: 1, $location: 1, href: 1, isCurrent: 1, getProps: 1, isPartiallyCurrent: 1 }) => {
    		if ($$dirty.to || $$dirty.$base) { $$invalidate('href', href = to === "/" ? $base.uri : resolve(to, $base.uri)); }
    		if ($$dirty.$location || $$dirty.href) { $$invalidate('isPartiallyCurrent', isPartiallyCurrent = startsWith($location.pathname, href)); }
    		if ($$dirty.href || $$dirty.$location) { $$invalidate('isCurrent', isCurrent = href === $location.pathname); }
    		if ($$dirty.isCurrent) { $$invalidate('ariaCurrent', ariaCurrent = isCurrent ? "page" : undefined); }
    		if ($$dirty.getProps || $$dirty.$location || $$dirty.href || $$dirty.isPartiallyCurrent || $$dirty.isCurrent) { $$invalidate('props', props = getProps({
            location: $location,
            href,
            isPartiallyCurrent,
            isCurrent
          })); }
    	};

    	return {
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		href,
    		props,
    		onClick,
    		ariaCurrent,
    		$$slots,
    		$$scope
    	};
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["to", "replace", "state", "getProps"]);
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/layout/Navbar.svelte generated by Svelte v3.4.4 */

    const file$1 = "src/layout/Navbar.svelte";

    // (14:6) <Link to="/">
    function create_default_slot_3(ctx) {
    	var span;

    	return {
    		c: function create() {
    			span = element("span");
    			span.textContent = "News Front";
    			span.className = "brand-logo";
    			add_location(span, file$1, 14, 8, 211);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}
    		}
    	};
    }

    // (19:10) <Link to="/">
    function create_default_slot_2(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Global");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (22:10) <Link to="/business">
    function create_default_slot_1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Business");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (25:10) <Link to="/technology">
    function create_default_slot(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Technology");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var nav, div1, div0, t0, ul, li0, t1, li1, t2, li2, current;

    	var link0 = new Link({
    		props: {
    		to: "/",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link1 = new Link({
    		props: {
    		to: "/",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link2 = new Link({
    		props: {
    		to: "/business",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link3 = new Link({
    		props: {
    		to: "/technology",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			div0 = element("div");
    			link0.$$.fragment.c();
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			link1.$$.fragment.c();
    			t1 = space();
    			li1 = element("li");
    			link2.$$.fragment.c();
    			t2 = space();
    			li2 = element("li");
    			link3.$$.fragment.c();
    			add_location(li0, file$1, 17, 8, 338);
    			add_location(li1, file$1, 20, 8, 402);
    			add_location(li2, file$1, 23, 8, 476);
    			ul.id = "nav-mobile";
    			ul.className = "right hide-on-med-and-down";
    			add_location(ul, file$1, 16, 6, 274);
    			div0.className = "container";
    			add_location(div0, file$1, 12, 4, 159);
    			div1.className = "nav-wrapper";
    			add_location(div1, file$1, 11, 2, 129);
    			nav.className = "svelte-7dygmo";
    			add_location(nav, file$1, 10, 0, 121);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, nav, anchor);
    			append(nav, div1);
    			append(div1, div0);
    			mount_component(link0, div0, null);
    			append(div0, t0);
    			append(div0, ul);
    			append(ul, li0);
    			mount_component(link1, li0, null);
    			append(ul, t1);
    			append(ul, li1);
    			mount_component(link2, li1, null);
    			append(ul, t2);
    			append(ul, li2);
    			mount_component(link3, li2, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var link0_changes = {};
    			if (changed.$$scope) link0_changes.$$scope = { changed, ctx };
    			link0.$set(link0_changes);

    			var link1_changes = {};
    			if (changed.$$scope) link1_changes.$$scope = { changed, ctx };
    			link1.$set(link1_changes);

    			var link2_changes = {};
    			if (changed.$$scope) link2_changes.$$scope = { changed, ctx };
    			link2.$set(link2_changes);

    			var link3_changes = {};
    			if (changed.$$scope) link3_changes.$$scope = { changed, ctx };
    			link3.$set(link3_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			link0.$$.fragment.i(local);

    			link1.$$.fragment.i(local);

    			link2.$$.fragment.i(local);

    			link3.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			link0.$$.fragment.o(local);
    			link1.$$.fragment.o(local);
    			link2.$$.fragment.o(local);
    			link3.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(nav);
    			}

    			link0.$destroy();

    			link1.$destroy();

    			link2.$destroy();

    			link3.$destroy();
    		}
    	};
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/pages/Home.svelte generated by Svelte v3.4.4 */

    const file$2 = "src/pages/Home.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.post = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.post = list[i];
    	return child_ctx;
    }

    // (101:2) {:else}
    function create_else_block$1(ctx) {
    	var each_1_anchor;

    	var each_value_1 = ctx.posts;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.posts) {
    				each_value_1 = ctx.posts;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (99:2) {#if posts.length === 0}
    function create_if_block$1(ctx) {
    	var h3;

    	return {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Getting News Articles...";
    			add_location(h3, file$2, 99, 4, 1993);
    		},

    		m: function mount(target, anchor) {
    			insert(target, h3, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h3);
    			}
    		}
    	};
    }

    // (102:4) {#each posts as post}
    function create_each_block_1(ctx) {
    	var div5, div4, div0, img, img_src_value, t0, div3, div1, span, t1_value = ctx.post.title, t1, t2, p, t3_value = ctx.post.publishedAt, t3, t4, div2, a, t5, a_href_value;

    	return {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			a = element("a");
    			t5 = text("View more");
    			img.className = "activator";
    			img.src = img_src_value = ctx.post.urlToImage;
    			add_location(img, file$2, 107, 14, 2302);
    			div0.className = "card-image waves-effect waves-block waves-light";
    			add_location(div0, file$2, 106, 12, 2226);
    			span.className = "card-title activator grey-text text-darken-4 svelte-70vucq";
    			add_location(span, file$2, 111, 16, 2463);
    			p.className = "timestamp svelte-70vucq";
    			add_location(p, file$2, 112, 16, 2558);
    			div1.className = "card-content";
    			add_location(div1, file$2, 110, 14, 2420);
    			a.href = a_href_value = ctx.post.url;
    			add_location(a, file$2, 116, 16, 2726);
    			div2.className = "card-action";
    			add_location(div2, file$2, 115, 14, 2684);
    			div3.className = "card-stacked svelte-70vucq";
    			add_location(div3, file$2, 109, 12, 2379);
    			div4.className = "card horizontal";
    			add_location(div4, file$2, 105, 10, 2184);
    			div5.className = "row";
    			set_style(div5, "margin", "5px");
    			add_location(div5, file$2, 103, 8, 2105);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div4);
    			append(div4, div0);
    			append(div0, img);
    			append(div4, t0);
    			append(div4, div3);
    			append(div3, div1);
    			append(div1, span);
    			append(span, t1);
    			append(div1, t2);
    			append(div1, p);
    			append(p, t3);
    			append(div3, t4);
    			append(div3, div2);
    			append(div2, a);
    			append(a, t5);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.posts) && img_src_value !== (img_src_value = ctx.post.urlToImage)) {
    				img.src = img_src_value;
    			}

    			if ((changed.posts) && t1_value !== (t1_value = ctx.post.title)) {
    				set_data(t1, t1_value);
    			}

    			if ((changed.posts) && t3_value !== (t3_value = ctx.post.publishedAt)) {
    				set_data(t3, t3_value);
    			}

    			if ((changed.posts) && a_href_value !== (a_href_value = ctx.post.url)) {
    				a.href = a_href_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div5);
    			}
    		}
    	};
    }

    // (141:2) {#each twposts as post}
    function create_each_block(ctx) {
    	var div3, div2, div1, div0, p0, t0_value = ctx.post.user, t0, t1, br, t2, p1, t3_value = ctx.post.text, t3, t4;

    	return {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			p0.className = "bold";
    			add_location(p0, file$2, 148, 16, 3619);
    			add_location(br, file$2, 149, 16, 3667);
    			p1.className = "blue-text";
    			set_style(p1, "font-size", "large");
    			add_location(p1, file$2, 151, 16, 3761);
    			div0.className = "card-content";
    			add_location(div0, file$2, 146, 14, 3469);
    			div1.className = "card-stacked";
    			add_location(div1, file$2, 145, 12, 3428);
    			div2.className = "card horizontal";
    			add_location(div2, file$2, 144, 10, 3386);
    			div3.className = "row";
    			add_location(div3, file$2, 142, 8, 3326);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, p0);
    			append(p0, t0);
    			append(div0, t1);
    			append(div0, br);
    			append(div0, t2);
    			append(div0, p1);
    			append(p1, t3);
    			append(div3, t4);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var div2, div1, br, t0, div0, t1, t2, div7, div4, div3, t3, div6, div5;

    	function select_block_type(ctx) {
    		if (ctx.posts.length === 0) return create_if_block$1;
    		return create_else_block$1;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	var each_value = ctx.twposts;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			br = element("br");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(ctx.currentDate);
    			t2 = space();
    			div7 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			if_block.c();
    			t3 = space();
    			div6 = element("div");
    			div5 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(br, file$2, 81, 4, 1567);
    			div0.className = "col-content";
    			add_location(div0, file$2, 82, 4, 1576);
    			div1.className = "col s6";
    			add_location(div1, file$2, 80, 2, 1542);
    			div2.className = "row";
    			add_location(div2, file$2, 79, 0, 1522);
    			div3.className = "col-content";
    			add_location(div3, file$2, 97, 2, 1936);
    			div4.className = "col s8 m8 ";
    			add_location(div4, file$2, 96, 2, 1909);
    			div5.className = "col-content";
    			add_location(div5, file$2, 128, 2, 2899);
    			div6.className = "col s3 m3";
    			add_location(div6, file$2, 127, 2, 2873);
    			div7.className = "row";
    			add_location(div7, file$2, 95, 0, 1889);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, br);
    			append(div1, t0);
    			append(div1, div0);
    			append(div0, t1);
    			insert(target, t2, anchor);
    			insert(target, div7, anchor);
    			append(div7, div4);
    			append(div4, div3);
    			if_block.m(div3, null);
    			append(div7, t3);
    			append(div7, div6);
    			append(div6, div5);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			}

    			if (changed.twposts) {
    				each_value = ctx.twposts;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div2);
    				detach(t2);
    				detach(div7);
    			}

    			if_block.d();

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    const apiBaseUrl =
        "http://localhost:8080";

    function instance$3($$self, $$props, $$invalidate) {
    	
      let currentDate = new Date();
      let posts = [];
      let twposts = [];

      onMount(async () => {
        const res = await fetch(apiBaseUrl + "/news/headlines");
        $$invalidate('posts', posts = await res.json());
        // const restwitter = await fetch(apiBaseUrl + "/news/twitter");
        // twposts = await restwitter.json();
      });

    	return { currentDate, posts, twposts };
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src/pages/About.svelte generated by Svelte v3.4.4 */

    /* src/layout/Footer.svelte generated by Svelte v3.4.4 */

    const file$3 = "src/layout/Footer.svelte";

    function create_fragment$5(ctx) {
    	var footer, div3, div2, div0, h5, t1, p, t3, div1, ul, li0, a0, t5, li1, a1, t7, li2, a2, t9, div5, div4;

    	return {
    		c: function create() {
    			footer = element("footer");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "News Front";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Follow us on social media.";
    			t3 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Terms of Use";
    			t5 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "About Us";
    			t7 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Contact";
    			t9 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "© 2020 NEWS FRONT. The NEWS FRONT is not responsible for the content of external sites.";
    			h5.className = "white-text";
    			add_location(h5, file$3, 11, 12, 192);
    			p.className = "grey-text text-lighten-4";
    			add_location(p, file$3, 12, 12, 243);
    			div0.className = "col l6 s12";
    			add_location(div0, file$3, 10, 8, 155);
    			a0.className = "grey-text text-lighten-3";
    			a0.href = "#!";
    			add_location(a0, file$3, 17, 16, 456);
    			add_location(li0, file$3, 17, 12, 452);
    			a1.className = "grey-text text-lighten-3";
    			a1.href = "#!";
    			add_location(a1, file$3, 18, 16, 540);
    			add_location(li1, file$3, 18, 12, 536);
    			a2.className = "grey-text text-lighten-3";
    			a2.href = "#!";
    			add_location(a2, file$3, 19, 16, 620);
    			add_location(li2, file$3, 19, 12, 616);
    			add_location(ul, file$3, 16, 12, 435);
    			div1.className = "col l4 offset-l2 s12";
    			add_location(div1, file$3, 14, 8, 333);
    			div2.className = "row";
    			add_location(div2, file$3, 9, 8, 129);
    			div3.className = "container";
    			add_location(div3, file$3, 8, 4, 97);
    			div4.className = "container";
    			add_location(div4, file$3, 25, 8, 785);
    			div5.className = "footer-copyright";
    			add_location(div5, file$3, 24, 4, 746);
    			footer.className = "page-footer svelte-1dhffxm";
    			add_location(footer, file$3, 7, 0, 64);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, footer, anchor);
    			append(footer, div3);
    			append(div3, div2);
    			append(div2, div0);
    			append(div0, h5);
    			append(div0, t1);
    			append(div0, p);
    			append(div2, t3);
    			append(div2, div1);
    			append(div1, ul);
    			append(ul, li0);
    			append(li0, a0);
    			append(ul, t5);
    			append(ul, li1);
    			append(li1, a1);
    			append(ul, t7);
    			append(ul, li2);
    			append(li2, a2);
    			append(footer, t9);
    			append(footer, div5);
    			append(div5, div4);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(footer);
    			}
    		}
    	};
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    	}
    }

    /* src/pages/Business.svelte generated by Svelte v3.4.4 */

    const file$4 = "src/pages/Business.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.tarticle = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.barticle = list[i];
    	return child_ctx;
    }

    // (66:2) {:else}
    function create_else_block$2(ctx) {
    	var each_1_anchor;

    	var each_value_1 = ctx.businessarticles;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.businessarticles) {
    				each_value_1 = ctx.businessarticles;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (64:2) {#if businessarticles.length === 0}
    function create_if_block$2(ctx) {
    	var h3;

    	return {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Getting Business Articles...";
    			add_location(h3, file$4, 64, 4, 1071);
    		},

    		m: function mount(target, anchor) {
    			insert(target, h3, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h3);
    			}
    		}
    	};
    }

    // (67:4) {#each businessarticles as barticle}
    function create_each_block_1$1(ctx) {
    	var div5, div4, div0, img, img_src_value, t0, div3, div1, span, t1_value = ctx.barticle.title, t1, t2, p, t3_value = ctx.barticle.publishedAt, t3, t4, div2, a, t5, a_href_value;

    	return {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			a = element("a");
    			t5 = text("View more");
    			img.className = "activator";
    			img.src = img_src_value = ctx.barticle.urlToImage;
    			add_location(img, file$4, 72, 14, 1399);
    			div0.className = "card-image waves-effect waves-block waves-light";
    			add_location(div0, file$4, 71, 12, 1323);
    			span.className = "card-title activator grey-text text-darken-4 svelte-b3xnz5";
    			add_location(span, file$4, 76, 16, 1564);
    			p.className = "timestamp svelte-b3xnz5";
    			add_location(p, file$4, 77, 16, 1663);
    			div1.className = "card-content";
    			add_location(div1, file$4, 75, 14, 1521);
    			a.href = a_href_value = ctx.barticle.url;
    			add_location(a, file$4, 81, 16, 1839);
    			div2.className = "card-action";
    			add_location(div2, file$4, 80, 14, 1797);
    			div3.className = "card-stacked svelte-b3xnz5";
    			add_location(div3, file$4, 74, 12, 1480);
    			div4.className = "card horizontal";
    			add_location(div4, file$4, 70, 10, 1281);
    			div5.className = "row";
    			set_style(div5, "margin", "5px");
    			add_location(div5, file$4, 68, 8, 1202);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div4);
    			append(div4, div0);
    			append(div0, img);
    			append(div4, t0);
    			append(div4, div3);
    			append(div3, div1);
    			append(div1, span);
    			append(span, t1);
    			append(div1, t2);
    			append(div1, p);
    			append(p, t3);
    			append(div3, t4);
    			append(div3, div2);
    			append(div2, a);
    			append(a, t5);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.businessarticles) && img_src_value !== (img_src_value = ctx.barticle.urlToImage)) {
    				img.src = img_src_value;
    			}

    			if ((changed.businessarticles) && t1_value !== (t1_value = ctx.barticle.title)) {
    				set_data(t1, t1_value);
    			}

    			if ((changed.businessarticles) && t3_value !== (t3_value = ctx.barticle.publishedAt)) {
    				set_data(t3, t3_value);
    			}

    			if ((changed.businessarticles) && a_href_value !== (a_href_value = ctx.barticle.url)) {
    				a.href = a_href_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div5);
    			}
    		}
    	};
    }

    // (105:2) {#each twarticles as tarticle}
    function create_each_block$1(ctx) {
    	var div3, div2, div1, div0, p0, t0_value = ctx.tarticle.user, t0, t1, br, t2, p1, t3_value = ctx.tarticle.text, t3, t4;

    	return {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			p0.className = "bold svelte-b3xnz5";
    			add_location(p0, file$4, 112, 16, 2715);
    			add_location(br, file$4, 113, 16, 2767);
    			p1.className = "blue-text";
    			set_style(p1, "font-size", "large");
    			add_location(p1, file$4, 115, 16, 2861);
    			div0.className = "card-content";
    			add_location(div0, file$4, 110, 14, 2565);
    			div1.className = "card-stacked";
    			add_location(div1, file$4, 109, 12, 2524);
    			div2.className = "card horizontal";
    			add_location(div2, file$4, 108, 10, 2482);
    			div3.className = "row";
    			add_location(div3, file$4, 106, 8, 2422);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, p0);
    			append(p0, t0);
    			append(div0, t1);
    			append(div0, br);
    			append(div0, t2);
    			append(div0, p1);
    			append(p1, t3);
    			append(div3, t4);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	var div1, div0, br, t0, div10, div3, div2, t1, div9, div8, div7, div6, div5, div4, h7, t3;

    	function select_block_type(ctx) {
    		if (ctx.businessarticles.length === 0) return create_if_block$2;
    		return create_else_block$2;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	var each_value = ctx.twarticles;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			br = element("br");
    			t0 = space();
    			div10 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			if_block.c();
    			t1 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			h7 = element("h7");
    			h7.textContent = "Top Tweets";
    			t3 = space();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(br, file$4, 56, 4, 934);
    			div0.className = "col s6";
    			add_location(div0, file$4, 55, 2, 909);
    			div1.className = "row";
    			add_location(div1, file$4, 54, 0, 889);
    			div2.className = "col-content";
    			add_location(div2, file$4, 62, 2, 1003);
    			div3.className = "col s8 m8 ";
    			add_location(div3, file$4, 61, 2, 976);
    			h7.className = "center white-text bold svelte-b3xnz5";
    			add_location(h7, file$4, 99, 14, 2240);
    			div4.className = "card-content";
    			add_location(div4, file$4, 98, 12, 2199);
    			div5.className = "card-stacked";
    			add_location(div5, file$4, 97, 8, 2160);
    			div6.className = "card horizontal blue";
    			add_location(div6, file$4, 96, 6, 2117);
    			div7.className = "row";
    			add_location(div7, file$4, 94, 2, 2044);
    			div8.className = "col-content";
    			add_location(div8, file$4, 93, 2, 2016);
    			div9.className = "col s3 m3";
    			add_location(div9, file$4, 92, 2, 1990);
    			div10.className = "row";
    			add_location(div10, file$4, 60, 0, 956);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, br);
    			insert(target, t0, anchor);
    			insert(target, div10, anchor);
    			append(div10, div3);
    			append(div3, div2);
    			if_block.m(div2, null);
    			append(div10, t1);
    			append(div10, div9);
    			append(div9, div8);
    			append(div8, div7);
    			append(div7, div6);
    			append(div6, div5);
    			append(div5, div4);
    			append(div4, h7);
    			append(div8, t3);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}

    			if (changed.twarticles) {
    				each_value = ctx.twarticles;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div8, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    				detach(t0);
    				detach(div10);
    			}

    			if_block.d();

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    const apiBaseUrl$1 =
        "http://localhost:8080";

    function instance$4($$self, $$props, $$invalidate) {
    	
      let businessarticles = [];
      let twarticles = [];

      onMount(async () => {
        const res = await fetch(apiBaseUrl$1 + "/news/business");
        $$invalidate('businessarticles', businessarticles = await res.json());

        // const restwitter = await fetch(apiBaseUrl + "/news/twitter/business");
        // twarticles = await restwitter.json();
      });

    	return { businessarticles, twarticles };
    }

    class Business extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$6, safe_not_equal, []);
    	}
    }

    /* src/pages/Tech.svelte generated by Svelte v3.4.4 */

    const file$5 = "src/pages/Tech.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.post = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.post = list[i];
    	return child_ctx;
    }

    // (62:2) {:else}
    function create_else_block$3(ctx) {
    	var each_1_anchor;

    	var each_value_1 = ctx.posts;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.posts) {
    				each_value_1 = ctx.posts;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (60:2) {#if posts.length === 0}
    function create_if_block$3(ctx) {
    	var h3;

    	return {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Getting Tech Articles...";
    			add_location(h3, file$5, 60, 4, 994);
    		},

    		m: function mount(target, anchor) {
    			insert(target, h3, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h3);
    			}
    		}
    	};
    }

    // (63:4) {#each posts as post}
    function create_each_block_1$2(ctx) {
    	var div5, div4, div0, img, img_src_value, t0, div3, div1, span, t1_value = ctx.post.title, t1, t2, p, t3_value = ctx.post.publishedAt, t3, t4, div2, a, t5, a_href_value;

    	return {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			a = element("a");
    			t5 = text("View more");
    			img.className = "activator";
    			img.src = img_src_value = ctx.post.urlToImage;
    			add_location(img, file$5, 68, 14, 1303);
    			div0.className = "card-image waves-effect waves-block waves-light";
    			add_location(div0, file$5, 67, 12, 1227);
    			span.className = "card-title activator grey-text text-darken-4 svelte-70vucq";
    			add_location(span, file$5, 72, 16, 1464);
    			p.className = "timestamp svelte-70vucq";
    			add_location(p, file$5, 73, 16, 1559);
    			div1.className = "card-content";
    			add_location(div1, file$5, 71, 14, 1421);
    			a.href = a_href_value = ctx.post.url;
    			add_location(a, file$5, 77, 16, 1727);
    			div2.className = "card-action";
    			add_location(div2, file$5, 76, 14, 1685);
    			div3.className = "card-stacked svelte-70vucq";
    			add_location(div3, file$5, 70, 12, 1380);
    			div4.className = "card horizontal";
    			add_location(div4, file$5, 66, 10, 1185);
    			div5.className = "row";
    			set_style(div5, "margin", "5px");
    			add_location(div5, file$5, 64, 8, 1106);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div4);
    			append(div4, div0);
    			append(div0, img);
    			append(div4, t0);
    			append(div4, div3);
    			append(div3, div1);
    			append(div1, span);
    			append(span, t1);
    			append(div1, t2);
    			append(div1, p);
    			append(p, t3);
    			append(div3, t4);
    			append(div3, div2);
    			append(div2, a);
    			append(a, t5);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.posts) && img_src_value !== (img_src_value = ctx.post.urlToImage)) {
    				img.src = img_src_value;
    			}

    			if ((changed.posts) && t1_value !== (t1_value = ctx.post.title)) {
    				set_data(t1, t1_value);
    			}

    			if ((changed.posts) && t3_value !== (t3_value = ctx.post.publishedAt)) {
    				set_data(t3, t3_value);
    			}

    			if ((changed.posts) && a_href_value !== (a_href_value = ctx.post.url)) {
    				a.href = a_href_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div5);
    			}
    		}
    	};
    }

    // (102:2) {#each twposts as post}
    function create_each_block$2(ctx) {
    	var div3, div2, div1, div0, p0, t0_value = ctx.post.user, t0, t1, br, t2, p1, t3_value = ctx.post.text, t3, t4;

    	return {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			p0.className = "bold";
    			add_location(p0, file$5, 109, 16, 2593);
    			add_location(br, file$5, 110, 16, 2641);
    			p1.className = "blue-text";
    			set_style(p1, "font-size", "large");
    			add_location(p1, file$5, 112, 16, 2735);
    			div0.className = "card-content";
    			add_location(div0, file$5, 107, 14, 2443);
    			div1.className = "card-stacked";
    			add_location(div1, file$5, 106, 12, 2402);
    			div2.className = "card horizontal";
    			add_location(div2, file$5, 105, 10, 2360);
    			div3.className = "row";
    			add_location(div3, file$5, 103, 8, 2300);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, p0);
    			append(p0, t0);
    			append(div0, t1);
    			append(div0, br);
    			append(div0, t2);
    			append(div0, p1);
    			append(p1, t3);
    			append(div3, t4);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	var div1, div0, br, t0, div10, div3, div2, t1, div9, div8, div7, div6, div5, div4, h7, t3;

    	function select_block_type(ctx) {
    		if (ctx.posts.length === 0) return create_if_block$3;
    		return create_else_block$3;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	var each_value = ctx.twposts;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			br = element("br");
    			t0 = space();
    			div10 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			if_block.c();
    			t1 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			h7 = element("h7");
    			h7.textContent = "Top Tweets";
    			t3 = space();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(br, file$5, 52, 4, 868);
    			div0.className = "col s6";
    			add_location(div0, file$5, 51, 2, 843);
    			div1.className = "row";
    			add_location(div1, file$5, 50, 0, 823);
    			div2.className = "col-content";
    			add_location(div2, file$5, 58, 2, 937);
    			div3.className = "col s8 m8 ";
    			add_location(div3, file$5, 57, 2, 910);
    			h7.className = "center white-text bold";
    			add_location(h7, file$5, 95, 14, 2124);
    			div4.className = "card-content";
    			add_location(div4, file$5, 94, 12, 2083);
    			div5.className = "card-stacked";
    			add_location(div5, file$5, 93, 8, 2044);
    			div6.className = "card horizontal blue";
    			add_location(div6, file$5, 92, 6, 2001);
    			div7.className = "row";
    			add_location(div7, file$5, 90, 2, 1928);
    			div8.className = "col-content";
    			add_location(div8, file$5, 89, 2, 1900);
    			div9.className = "col s3 m3";
    			add_location(div9, file$5, 88, 2, 1874);
    			div10.className = "row";
    			add_location(div10, file$5, 56, 0, 890);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, br);
    			insert(target, t0, anchor);
    			insert(target, div10, anchor);
    			append(div10, div3);
    			append(div3, div2);
    			if_block.m(div2, null);
    			append(div10, t1);
    			append(div10, div9);
    			append(div9, div8);
    			append(div8, div7);
    			append(div7, div6);
    			append(div6, div5);
    			append(div5, div4);
    			append(div4, h7);
    			append(div8, t3);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}

    			if (changed.twposts) {
    				each_value = ctx.twposts;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div8, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    				detach(t0);
    				detach(div10);
    			}

    			if_block.d();

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    const apiBaseUrl$2 =
        "http://localhost:8080";

    function instance$5($$self, $$props, $$invalidate) {
    	
      let posts = [];
      let twposts = [];

      onMount(async () => {
        const res = await fetch(apiBaseUrl$2 + "/news/technology");
        $$invalidate('posts', posts = await res.json());

        // const restwitter = await fetch(apiBaseUrl + "/news/twitter/technology");
        // twposts = await restwitter.json();
      });

    	return { posts, twposts };
    }

    class Tech extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$7, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.4.4 */

    const file$6 = "src/App.svelte";

    // (19:0) <Router>
    function create_default_slot$1(ctx) {
    	var t0, div, t1, t2, t3, current;

    	var navbar = new Navbar({ $$inline: true });

    	var route0 = new Route({
    		props: { path: "/", component: Home },
    		$$inline: true
    	});

    	var route1 = new Route({
    		props: {
    		path: "/business",
    		component: Business
    	},
    		$$inline: true
    	});

    	var route2 = new Route({
    		props: {
    		path: "/technology",
    		component: Tech
    	},
    		$$inline: true
    	});

    	var footer = new Footer({ $$inline: true });

    	return {
    		c: function create() {
    			navbar.$$.fragment.c();
    			t0 = space();
    			div = element("div");
    			route0.$$.fragment.c();
    			t1 = space();
    			route1.$$.fragment.c();
    			t2 = space();
    			route2.$$.fragment.c();
    			t3 = space();
    			footer.$$.fragment.c();
    			div.className = "container";
    			add_location(div, file$6, 20, 2, 531);
    		},

    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			mount_component(route0, div, null);
    			append(div, t1);
    			mount_component(route1, div, null);
    			append(div, t2);
    			mount_component(route2, div, null);
    			insert(target, t3, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var route0_changes = {};
    			if (changed.Home) route0_changes.component = Home;
    			route0.$set(route0_changes);

    			var route1_changes = {};
    			if (changed.Business) route1_changes.component = Business;
    			route1.$set(route1_changes);

    			var route2_changes = {};
    			if (changed.Tech) route2_changes.component = Tech;
    			route2.$set(route2_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			navbar.$$.fragment.i(local);

    			route0.$$.fragment.i(local);

    			route1.$$.fragment.i(local);

    			route2.$$.fragment.i(local);

    			footer.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			navbar.$$.fragment.o(local);
    			route0.$$.fragment.o(local);
    			route1.$$.fragment.o(local);
    			route2.$$.fragment.o(local);
    			footer.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			navbar.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(div);
    			}

    			route0.$destroy();

    			route1.$destroy();

    			route2.$destroy();

    			if (detaching) {
    				detach(t3);
    			}

    			footer.$destroy(detaching);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	var current;

    	var router = new Router({
    		props: {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			router.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.$$scope) router_changes.$$scope = { changed, ctx };
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			router.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			router.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			router.$destroy(detaching);
    		}
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$8, safe_not_equal, []);
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
