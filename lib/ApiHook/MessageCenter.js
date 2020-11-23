"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var messageCenter = {
  listeners: [],
  postOriginMessage: function postOriginMessage(data) {
    dispatchMessage(this.listeners, data, 'onOriginMessage');
  },
  postEditMessage: function postEditMessage(data) {
    dispatchMessage(this.listeners, data, 'onEditMessage');
  },
  observe: function observe(listener) {
    this.listeners.push(listener);
  }
};

function dispatchMessage(listeners, data, fn) {
  listeners.forEach(function (listener) {
    if (typeof listener[fn] === 'function') {
      listener[fn](data);
    }
  });
}

var _default = messageCenter;
exports.default = _default;