// src/html-helpers.ts
var clearHTML = (element) => {
  while (element.childNodes.length > 0) {
    element.firstChild.remove();
  }
};
var parseFragment = (htmlStr) => {
  const range = document.createRange();
  range.selectNode(document.body);
  return range.createContextualFragment(htmlStr);
};
var setInnerHTML = (element, html2) => {
  clearHTML(element);
  const fragment = typeof html2 === "string" ? parseFragment(html2) : html2;
  element.append(fragment);
};

// src/signals.ts
var subscriber = null;
var createSignal = (initVal) => {
  const subscribers = /* @__PURE__ */ new Set();
  let value = initVal;
  const getter = () => {
    if (subscriber !== null) {
      subscribers.add(subscriber);
    }
    return value;
  };
  const setter = (newValue) => {
    value = newValue;
    for (const fn of subscribers) {
      fn();
    }
  };
  return [getter, setter];
};
var derived = (fn) => {
  const [getter, setter] = createSignal();
  createEffect(() => {
    setter(fn());
  });
  return getter;
};
var createEffect = (fn) => {
  subscriber = fn;
  fn();
  subscriber = null;
};

// src/custom-element.ts
var customElement = (render) => {
  return class extends HTMLElement {
    #attrSignals = {};
    #attributeChangedFns = /* @__PURE__ */ new Set();
    #connectedFns = /* @__PURE__ */ new Set();
    #disconnectedFns = /* @__PURE__ */ new Set();
    #shadowRoot = this.attachShadow({ mode: "closed" });
    #internals = this.attachInternals();
    #observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const attrName = mutation.attributeName;
        if (mutation.type !== "attributes" || attrName === null) continue;
        const [value, setValue] = this.#attrSignals[attrName];
        const _oldValue = value();
        const oldValue = _oldValue === null ? null : String(_oldValue);
        const newValue = this.getAttribute(attrName);
        setValue(newValue);
        for (const fn of this.#attributeChangedFns) {
          fn(attrName, oldValue, newValue);
        }
      }
    });
    #render() {
      const fragment = render({
        elementRef: this,
        root: this.#shadowRoot,
        internals: this.#internals,
        attributeChangedCallback: (fn) => this.#attributeChangedFns.add(fn),
        connectedCallback: (fn) => this.#connectedFns.add(fn),
        disconnectedCallback: (fn) => this.#disconnectedFns.add(fn),
        attrSignals: new Proxy(
          {},
          {
            get: (_, prop) => {
              const [getter] = this.#attrSignals[prop];
              const setter = (newValue) => this.setAttribute(prop, newValue);
              return [getter, setter];
            },
            set: () => {
              console.error("Signals must be assigned via setters.");
              return false;
            }
          }
        ),
        refs: new Proxy(
          {},
          {
            get: (_, prop) => this.#shadowRoot.querySelector(`[ref=${prop}]`),
            set: () => {
              console.error("Refs are readonly and cannot be assigned.");
              return false;
            }
          }
        ),
        adoptStyleSheet: (stylesheet) => {
          this.#shadowRoot.adoptedStyleSheets.push(stylesheet);
        }
      });
      setInnerHTML(this.#shadowRoot, fragment);
    }
    constructor() {
      super();
      for (const attr of this.attributes) {
        this.#attrSignals[attr.name] = createSignal(attr.value);
      }
      this.#render();
    }
    connectedCallback() {
      this.#observer.observe(this, { attributes: true });
      for (const fn of this.#connectedFns) {
        fn();
      }
    }
    disconnectedCallback() {
      this.#observer.disconnect();
      for (const fn of this.#disconnectedFns) {
        fn();
      }
    }
  };
};
var customFormElement = (render) => {
  return class extends customElement(render) {
    static get formAssociated() {
      return true;
    }
  };
};

// src/render.ts
var html = (strings, ...values) => {
  let innerHTML = "";
  const signalMap = /* @__PURE__ */ new Map();
  strings.forEach((string, i) => {
    let value = values[i] ?? "";
    if (typeof value === "function") {
      const uniqueKey = crypto.randomUUID();
      signalMap.set(uniqueKey, value);
      value = `{{signal:${uniqueKey}}}`;
    }
    innerHTML += string + value;
  });
  const fragment = parseFragment(innerHTML);
  const signalBindingRegex = /(\{\{signal:.+\}\})/;
  const parseChildren = (element) => {
    for (const child of element.childNodes) {
      if (child instanceof Text && signalBindingRegex.test(child.data)) {
        const textList = child.data.split(signalBindingRegex);
        textList.forEach((text, i) => {
          const uniqueKey = text.replace(/\{\{signal:(.+)\}\}/, "$1");
          const signal = uniqueKey !== text ? signalMap.get(uniqueKey) : null;
          const newText = signal !== null ? signal() : text;
          const newNode = new Text(newText);
          if (i === 0) {
            child.replaceWith(newNode);
          } else {
            element.insertBefore(newNode, child.nextSibling);
          }
          if (signal !== null) {
            createEffect(() => {
              newNode.data = signal();
            });
          }
        });
      }
      if (child instanceof Element) {
        for (const attr of child.attributes) {
          if (signalBindingRegex.test(attr.value)) {
            const textList = attr.value.split(signalBindingRegex);
            createEffect(() => {
              let newText = "";
              for (const text of textList) {
                const uniqueKey = text.replace(/\{\{signal:(.+)\}\}/, "$1");
                const signal = uniqueKey !== text ? signalMap.get(uniqueKey) : null;
                newText += signal !== null ? signal() : text;
              }
              child.setAttribute(attr.name, newText);
            });
          }
        }
        parseChildren(child);
      }
    }
  };
  parseChildren(fragment);
  return fragment;
};
var css = (strings, ...values) => {
  let cssText = "";
  const signalMap = /* @__PURE__ */ new Map();
  const signalBindingRegex = /(\{\{signal:.+\}\})/;
  strings.forEach((string, i) => {
    let value = values[i] ?? "";
    if (typeof value === "function") {
      const uniqueKey = crypto.randomUUID();
      signalMap.set(uniqueKey, value);
      value = `{{signal:${uniqueKey}}}`;
    }
    cssText += string + value;
  });
  const stylesheet = new CSSStyleSheet();
  const textList = cssText.split(signalBindingRegex);
  createEffect(() => {
    const newCSSTextList = [];
    for (const text of textList) {
      const uniqueKey = text.replace(/\{\{signal:(.+)\}\}/, "$1");
      const signal = uniqueKey !== text ? signalMap.get(uniqueKey) : null;
      const newText = signal !== null ? signal() : text;
      newCSSTextList.push(newText);
    }
    const newCSSText = newCSSTextList.join("");
    stylesheet.replace(newCSSText);
  });
  return stylesheet;
};
export {
  createEffect,
  createSignal,
  css,
  customElement,
  customFormElement,
  derived,
  html
};
