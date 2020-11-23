"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ajaxHook = require("ajax-hook");

var _MessageCenter = _interopRequireDefault(require("./MessageCenter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ajaxProxy() {
  var _proxy = (0, _ajaxHook.proxy)({
    onRequest: function onRequest(config, handler) {
      handler.next(config);
    },
    onError: function onError(err, handler) {
      handler.next(err);
    },
    onResponse: function onResponse(response, handler) {
      _MessageCenter.default.postOriginMessage({
        response: response,
        handler: handler
      });
    }
  });

  _MessageCenter.default.observe(_proxy);

  _proxy.onEditMessage = function (_ref) {
    var response = _ref.response,
        handler = _ref.handler;
    handler.next(response);
  };
}

var _default = ajaxProxy;
exports.default = _default;