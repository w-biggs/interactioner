"use strict";
(() => {
  // node_modules/vanjs-core/src/van.js
  var protoOf = Object.getPrototypeOf;
  var changedStates;
  var derivedStates;
  var curDeps;
  var curNewDerives;
  var alwaysConnectedDom = { isConnected: 1 };
  var gcCycleInMs = 1e3;
  var statesToGc;
  var propSetterCache = {};
  var objProto = protoOf(alwaysConnectedDom);
  var funcProto = protoOf(protoOf);
  var _undefined;
  var addAndScheduleOnFirst = (set, s, f, waitMs) => (set ?? (setTimeout(f, waitMs), /* @__PURE__ */ new Set())).add(s);
  var runAndCaptureDeps = (f, deps, arg) => {
    let prevDeps = curDeps;
    curDeps = deps;
    try {
      return f(arg);
    } catch (e) {
      console.error(e);
      return arg;
    } finally {
      curDeps = prevDeps;
    }
  };
  var keepConnected = (l) => l.filter((b) => b._dom?.isConnected);
  var addStatesToGc = (d) => statesToGc = addAndScheduleOnFirst(statesToGc, d, () => {
    for (let s of statesToGc)
      s._bindings = keepConnected(s._bindings), s._listeners = keepConnected(s._listeners);
    statesToGc = _undefined;
  }, gcCycleInMs);
  var stateProto = {
    get val() {
      curDeps?._getters?.add(this);
      return this.rawVal;
    },
    get oldVal() {
      curDeps?._getters?.add(this);
      return this._oldVal;
    },
    set val(v) {
      curDeps?._setters?.add(this);
      if (v !== this.rawVal) {
        this.rawVal = v;
        this._bindings.length + this._listeners.length ? (derivedStates?.add(this), changedStates = addAndScheduleOnFirst(changedStates, this, updateDoms)) : this._oldVal = v;
      }
    }
  };
  var state = (initVal) => ({
    __proto__: stateProto,
    rawVal: initVal,
    _oldVal: initVal,
    _bindings: [],
    _listeners: []
  });
  var bind = (f, dom) => {
    let deps = { _getters: /* @__PURE__ */ new Set(), _setters: /* @__PURE__ */ new Set() }, binding = { f }, prevNewDerives = curNewDerives;
    curNewDerives = [];
    let newDom = runAndCaptureDeps(f, deps, dom);
    newDom = (newDom ?? document).nodeType ? newDom : new Text(newDom);
    for (let d of deps._getters)
      deps._setters.has(d) || (addStatesToGc(d), d._bindings.push(binding));
    for (let l of curNewDerives) l._dom = newDom;
    curNewDerives = prevNewDerives;
    return binding._dom = newDom;
  };
  var derive = (f, s = state(), dom) => {
    let deps = { _getters: /* @__PURE__ */ new Set(), _setters: /* @__PURE__ */ new Set() }, listener = { f, s };
    listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom;
    s.val = runAndCaptureDeps(f, deps, s.rawVal);
    for (let d of deps._getters)
      deps._setters.has(d) || (addStatesToGc(d), d._listeners.push(listener));
    return s;
  };
  var add = (dom, ...children) => {
    for (let c of children.flat(Infinity)) {
      let protoOfC = protoOf(c ?? 0);
      let child = protoOfC === stateProto ? bind(() => c.val) : protoOfC === funcProto ? bind(c) : c;
      child != _undefined && dom.append(child);
    }
    return dom;
  };
  var tag = (ns, name, ...args) => {
    let [props, ...children] = protoOf(args[0] ?? 0) === objProto ? args : [{}, ...args];
    let dom = ns ? document.createElementNS(ns, name) : document.createElement(name);
    for (let [k, v] of Object.entries(props)) {
      let getPropDescriptor = (proto) => proto ? Object.getOwnPropertyDescriptor(proto, k) ?? getPropDescriptor(protoOf(proto)) : _undefined;
      let cacheKey = name + "," + k;
      let propSetter = propSetterCache[cacheKey] ??= getPropDescriptor(protoOf(dom))?.set ?? 0;
      let setter = k.startsWith("on") ? (v2, oldV) => {
        let event = k.slice(2);
        dom.removeEventListener(event, oldV);
        dom.addEventListener(event, v2);
      } : propSetter ? propSetter.bind(dom) : dom.setAttribute.bind(dom, k);
      let protoOfV = protoOf(v ?? 0);
      k.startsWith("on") || protoOfV === funcProto && (v = derive(v), protoOfV = stateProto);
      protoOfV === stateProto ? bind(() => (setter(v.val, v._oldVal), dom)) : setter(v);
    }
    return add(dom, children);
  };
  var handler = (ns) => ({ get: (_, name) => tag.bind(_undefined, ns, name) });
  var update = (dom, newDom) => newDom ? newDom !== dom && dom.replaceWith(newDom) : dom.remove();
  var updateDoms = () => {
    let iter = 0, derivedStatesArray = [...changedStates].filter((s) => s.rawVal !== s._oldVal);
    do {
      derivedStates = /* @__PURE__ */ new Set();
      for (let l of new Set(derivedStatesArray.flatMap((s) => s._listeners = keepConnected(s._listeners))))
        derive(l.f, l.s, l._dom), l._dom = _undefined;
    } while (++iter < 100 && (derivedStatesArray = [...derivedStates]).length);
    let changedStatesArray = [...changedStates].filter((s) => s.rawVal !== s._oldVal);
    changedStates = _undefined;
    for (let b of new Set(changedStatesArray.flatMap((s) => s._bindings = keepConnected(s._bindings))))
      update(b._dom, bind(b.f, b._dom)), b._dom = _undefined;
    for (let s of changedStatesArray) s._oldVal = s.rawVal;
  };
  var van_default = {
    tags: new Proxy((ns) => new Proxy(tag, handler(ns)), handler()),
    hydrate: (dom, f) => update(dom, bind(f, dom)),
    add,
    state,
    derive
  };

  // content_script.ts
  var { button, div, form, h4, i, input, label, option, select } = van_default.tags;
  var Interactioner = () => {
    const panelExpanded = van_default.state(true);
    return div(
      { class: "row" },
      div(
        { class: "col-xs-12" },
        div(
          { class: "Interactioner collapsible-section" },
          h4(
            { class: "collapsible", onclick: () => panelExpanded.val = !panelExpanded.val },
            i({ class: () => `fa fa-chevron-circle-${panelExpanded.val ? "down" : "right"}` }),
            "Interactioner"
          ),
          div(
            { class: "panel panel-default" },
            div(
              {
                class: () => `panel-collapse collapse ${panelExpanded.val ? "in" : ""}`,
                role: "tabpanel",
                ariaExpanded: panelExpanded.val
              },
              div(
                form(
                  div(
                    { class: "form-group" },
                    label(
                      { for: "interactioner-url" },
                      "URL of other observation"
                    ),
                    input(
                      {
                        class: "form-control",
                        id: "interactioner-url",
                        type: "text"
                      }
                    )
                  ),
                  div(
                    { class: "form-group" },
                    label(
                      { for: "interactioner-type" },
                      "Interaction type"
                    ),
                    select(
                      { class: "form-control", style: "min-width: 100%" },
                      option({ value: "Visited flower of" }, "Visited flower of"),
                      option({ value: "Eating" }, "Eating"),
                      option({ value: "Parasitizing" }, "Parasitizing"),
                      option({ value: "Carrying" }, "Carrying"),
                      option({ value: "Attached to" }, "Attached to"),
                      option({ value: "Associated with" }, "Associated with")
                    )
                  ),
                  button({ type: "submit", class: "btn btn-success" }, "Add interaction")
                )
              )
            )
          )
        )
      )
    );
  };
  var styles = document.createElement("style");
  styles.textContent = `
.Interactioner {
	border-top: 1px solid #DDD;
}
`;
  var insert = (container) => {
    console.log("inserting");
    document.head.appendChild(styles);
    container.insertBefore(Interactioner(), container.children[5]);
    return true;
  };
  var waitForRender = () => {
    const app = document.getElementById("app");
    if (!app) {
      console.error("No app found -- cannot insert Interactioner.");
      return;
    }
    const observer = new MutationObserver(() => {
      const obsSidebarContainer = document.querySelector(".opposite_activity");
      console.log(obsSidebarContainer);
      if (obsSidebarContainer) {
        insert(obsSidebarContainer);
        observer.disconnect();
      }
    });
    observer.observe(app, { childList: true, subtree: true });
  };
  waitForRender();
})();
