"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _mockjs = _interopRequireDefault(require("mockjs"));

var _ajaxHook = require("ajax-hook");

var _MessageCenter = _interopRequireDefault(require("./MessageCenter"));

require("./index.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function ajaxProxy() {
  var XHR_DONE = XMLHttpRequest.DONE;

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

  XMLHttpRequest.DONE = XHR_DONE;

  _MessageCenter.default.observe(_proxy);

  _proxy.onEditMessage = function (_ref) {
    var response = _ref.response,
        handler = _ref.handler;
    handler.next(response);
  };
}

ajaxProxy();
var EMPTY_CONTENT = '';
var FILTER_MODE = 'filter';
var MOCK_MODE = 'mock';
var NO_SUPPORT_TYPE = ['document', 'blob', 'arraybuffer', 'ms-stream'];

var ApiHook = /*#__PURE__*/function (_React$PureComponent) {
  _inherits(ApiHook, _React$PureComponent);

  var _super = _createSuper(ApiHook);

  function ApiHook(props) {
    var _this;

    _classCallCheck(this, ApiHook);

    _this = _super.call(this, props);
    _this.state = {
      closeApiHook: false,
      mockList: [],
      editMockApiInfo: null,
      apiList: [],
      hookMode: FILTER_MODE,
      editApiInfo: null,
      apiContent: EMPTY_CONTENT,
      apiStatusCode: 200,
      visiable: props.defaultVisiable || false
    };
    _this.isDragMove = false;
    _this.toggleBarRef = /*#__PURE__*/_react.default.createRef();
    _this.onDeleteApi = _this.onDeleteApi.bind(_assertThisInitialized(_this));
    _this.onAddMockApi = _this.onAddMockApi.bind(_assertThisInitialized(_this));
    _this.onSaveMock = _this.onSaveMock.bind(_assertThisInitialized(_this));
    _this.onCancelMock = _this.onCancelMock.bind(_assertThisInitialized(_this));
    _this.onDeleteMock = _this.onDeleteMock.bind(_assertThisInitialized(_this));
    _this.onMockInptChange = _this.onMockInptChange.bind(_assertThisInitialized(_this));
    _this.onOriginMessage = _this.onOriginMessage.bind(_assertThisInitialized(_this));
    _this.postEditMessage = _this.postEditMessage.bind(_assertThisInitialized(_this));
    _this.onToggleVisiable = _this.onToggleVisiable.bind(_assertThisInitialized(_this));
    _this.onApiFilterChange = _this.onApiFilterChange.bind(_assertThisInitialized(_this));
    _this.onApiContentChange = _this.onApiContentChange.bind(_assertThisInitialized(_this));
    _this.onStatusCodeChange = _this.onStatusCodeChange.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(ApiHook, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (!this.isApiHookWork()) {
        (0, _ajaxHook.unProxy)();
        return;
      }

      _MessageCenter.default.observe(this);
    }
  }, {
    key: "createApiKey",
    value: function createApiKey(method, url) {
      var _ref2;

      return _ref2 = {}, _defineProperty(_ref2, Symbol.toPrimitive, function () {
        return "".concat(this.method).concat(this.url);
      }), _defineProperty(_ref2, "method", method), _defineProperty(_ref2, "url", url), _defineProperty(_ref2, "response", null), _defineProperty(_ref2, "isFilter", Boolean(this.props.autoFilter) || false), _defineProperty(_ref2, "isEditActive", false), _defineProperty(_ref2, "isEditWaiting", false), _ref2;
    }
    /**
     * @desc 接收api的原始数据
     */

  }, {
    key: "onOriginMessage",
    value: function onOriginMessage(data) {
      var _this$state = this.state,
          visiable = _this$state.visiable,
          apiList = _this$state.apiList,
          editApiInfo = _this$state.editApiInfo,
          hookMode = _this$state.hookMode;
      var handler = data.handler,
          response = data.response;
      var responseType = handler.xhr.responseType;

      if (NO_SUPPORT_TYPE.includes(responseType) || !visiable || hookMode === MOCK_MODE) {
        // 响应类型不支持/不可见/mock模式时直接返回
        _MessageCenter.default.postEditMessage({
          response: response,
          handler: handler
        });

        return;
      }

      var res = response.response,
          config = response.config;
      var method = config.method,
          url = config.url;
      var apiInfo = apiList.find(function (item) {
        return item.method === method && item.url === url;
      });

      if (!apiInfo) {
        apiInfo = this.createApiKey(method, url);
        apiList = apiList.concat(apiInfo);
      }

      if (apiInfo.isFilter) {
        // 接口拦截
        apiInfo.handler = handler;
        apiInfo.responseType = responseType;
        apiInfo.response = response;
        apiInfo.isEditActive = editApiInfo ? this.isApiEqual(apiInfo, editApiInfo) : true;
        apiInfo.isEditWaiting = !apiInfo.isEditActive;
        var newState = {
          apiList: this.putApiInfo2Top(apiList, apiInfo),
          editApiInfo: editApiInfo || apiInfo
        };

        if (apiInfo.isEditActive) {
          newState.apiStatusCode = response.status;
          newState.apiContent = this.formatResponse(res, responseType);
        }

        this.setState(newState);
      } else {
        _MessageCenter.default.postEditMessage({
          response: response,
          handler: handler
        });

        this.setState({
          apiList: apiList
        });
      }
    }
    /**
     * @desc 置顶处于【编辑】和【等待编辑】响应内容的接口，【等待编辑】处于【编辑】后面
     * @param {Array} list 所有接口列表
     * @param {Object} apiInfo 需要置顶的接口
     */

  }, {
    key: "putApiInfo2Top",
    value: function putApiInfo2Top(apiList, apiInfo) {
      var _this2 = this;

      var isEditActive = apiInfo.isEditActive,
          isEditWaiting = apiInfo.isEditWaiting;

      if (isEditActive || isEditWaiting) {
        var _apiList = apiList.reduce(function (arr, item) {
          if (!_this2.isApiEqual(apiInfo, item)) {
            if (isEditActive && item.isEditActive) {
              item.isEditActive = false;
              item.isEditWaiting = true;
            }

            arr.push(item);
          }

          return arr;
        }, []);

        if (isEditActive) {
          // 编辑模式，排第一位
          _apiList.unshift(apiInfo);
        } else {
          _apiList.splice(1, 0, apiInfo); // 等待编辑模式，排第二位

        }

        return _apiList;
      }

      return apiList;
    }
    /**
     * @desc 发送经过修改的数据
     */

  }, {
    key: "postEditMessage",
    value: function postEditMessage() {
      var _this$state2 = this.state,
          apiList = _this$state2.apiList,
          editApiInfo = _this$state2.editApiInfo,
          apiContent = _this$state2.apiContent,
          apiStatusCode = _this$state2.apiStatusCode;

      if (!editApiInfo) {
        return;
      }

      var editResponse = null;
      var apiInfo = null;
      apiList.some(function (item) {
        var method = item.method,
            url = item.url,
            response = item.response;

        if (editApiInfo.method === method && editApiInfo.url === url) {
          apiInfo = item;
          editResponse = Object.assign({}, response);
          return true;
        }

        return false;
      });

      if (editResponse) {
        try {
          editResponse.response = editApiInfo.responseType === 'json' ? JSON.parse(apiContent || "{}") : apiContent;
          editResponse.status = apiStatusCode;

          _MessageCenter.default.postEditMessage({
            response: editResponse,
            handler: apiInfo.handler
          });

          apiInfo.isEditActive = false;
          apiInfo.isEditWaiting = false;
          var editWaitApiIndex = apiList.findIndex(function (item) {
            return item.isEditWaiting;
          });

          if (editWaitApiIndex > 0) {
            var _editWaitApiInfo$resp, _editWaitApiInfo$resp2;

            // 还有处于【等待编辑】的接口，将第一个等待的接口激活成编辑模式
            var _apiList = apiList.slice();

            _apiList.shift();

            _apiList.push(apiInfo);

            var editWaitApiInfo = _apiList[editWaitApiIndex - 1];
            editWaitApiInfo.isEditWaiting = false;
            editWaitApiInfo.isEditActive = true;
            this.setState({
              apiList: _apiList,
              editApiInfo: editWaitApiInfo,
              apiStatusCode: editWaitApiInfo === null || editWaitApiInfo === void 0 ? void 0 : (_editWaitApiInfo$resp = editWaitApiInfo.response) === null || _editWaitApiInfo$resp === void 0 ? void 0 : _editWaitApiInfo$resp.status,
              apiContent: this.formatResponse(editWaitApiInfo === null || editWaitApiInfo === void 0 ? void 0 : (_editWaitApiInfo$resp2 = editWaitApiInfo.response) === null || _editWaitApiInfo$resp2 === void 0 ? void 0 : _editWaitApiInfo$resp2.response, editWaitApiInfo === null || editWaitApiInfo === void 0 ? void 0 : editWaitApiInfo.responseType)
            });
          } else {
            this.setState({
              apiList: apiList.slice(),
              editApiInfo: null,
              apiStatusCode: 200,
              apiContent: EMPTY_CONTENT
            });
          }

          apiInfo.handler = null;
        } catch (e) {
          alert("JSON\u89E3\u6790\u5F02\u5E38:".concat(e.message));
        }
      }
    }
  }, {
    key: "onToggleVisiable",
    value: function onToggleVisiable() {
      var _this$state3 = this.state,
          visiable = _this$state3.visiable,
          editApiInfo = _this$state3.editApiInfo;

      if (editApiInfo) {
        this.postEditMessage();
      }

      this.setState({
        visiable: !visiable
      });
    }
  }, {
    key: "onApiContentChange",
    value: function onApiContentChange(e) {
      this.setState({
        apiContent: e.target.value
      });
    }
  }, {
    key: "onDeleteMock",
    value: function onDeleteMock(e) {
      var id = e.target.dataset.id;

      if (e.target.hasAttribute('disabled')) {
        return;
      }

      if (id) {
        var mockList = this.state.mockList;

        var _mockList = mockList.reduce(function (arr, item) {
          if (item.id !== id) {
            arr.push(item);
          } else {
            delete _mockjs.default._mocked[item.url];
          }

          return arr;
        }, []);

        this.setState({
          mockList: _mockList
        });
      }
    }
  }, {
    key: "onDeleteApi",
    value: function onDeleteApi(e) {
      e.stopPropagation();
      var _e$target$dataset = e.target.dataset,
          method = _e$target$dataset.method,
          url = _e$target$dataset.url;

      if (e.target.hasAttribute('disabled')) {
        return;
      }

      if (method && url) {
        var apiList = this.state.apiList;

        var _apiList = apiList.reduce(function (arr, item) {
          if (item.method !== method || item.url !== url) {
            arr.push(item);
          }

          return arr;
        }, []);

        this.setState({
          apiList: _apiList
        });
      }
    }
  }, {
    key: "onApiFilterChange",
    value: function onApiFilterChange(e) {
      if (e.target.hasAttribute('disabled')) {
        return;
      }

      var isFilter = e.target.checked; // 是否拦截接口响应开关

      var apiList = this.state.apiList;
      var _e$target$dataset2 = e.target.dataset,
          method = _e$target$dataset2.method,
          url = _e$target$dataset2.url;

      var _apiList = apiList.reduce(function (arr, item) {
        if (item.method === method && item.url === url) {
          item.isFilter = isFilter;
        }

        arr.push(item);
        return arr;
      }, []);

      this.setState({
        apiList: _apiList
      });
    }
  }, {
    key: "onStatusCodeChange",
    value: function onStatusCodeChange(e) {
      this.setState({
        apiStatusCode: e.target.value
      });
    }
  }, {
    key: "onMockContentChange",
    value: function onMockContentChange(e) {
      this.setState({
        mockContent: e.target.value
      });
    }
  }, {
    key: "onAddMockApi",
    value: function onAddMockApi() {
      this.setState({
        mockAdd: true
      });
    }
  }, {
    key: "onMockInptChange",
    value: function onMockInptChange(e) {
      var key = e.target.dataset.key;
      this.setState(_defineProperty({}, key, e.target.value));
    }
  }, {
    key: "onSaveMock",
    value: function onSaveMock() {
      var _this$state4 = this.state,
          mockurl = _this$state4.mockurl,
          mocktemplate = _this$state4.mocktemplate,
          editMockApiInfo = _this$state4.editMockApiInfo;

      if (!mockurl || !mocktemplate) {
        alert('请输入mock接口的地址和mock结构');
        return;
      }

      var template;

      try {
        template = JSON.parse(mocktemplate);
        var mockList = this.state.mockList;
        this.resetMockState();

        if (editMockApiInfo) {
          // 编辑
          mockList = mockList.reduce(function (arr, item) {
            if (item.id === editMockApiInfo.id) {
              item.url = mockurl;
              item.template = template;
              item.templateStr = mocktemplate;
            }

            arr.push(item);
            return arr;
          }, []);
        } else {
          mockList = mockList.concat({
            id: "".concat(Date.now()),
            url: mockurl,
            template: template,
            templateStr: mocktemplate
          });
        }

        this.setState({
          mockList: mockList
        });

        _mockjs.default.mock(mockurl, template);
      } catch (e) {
        alert("JSON\u89E3\u6790\u5F02\u5E38:".concat(e.message));
      }
    }
  }, {
    key: "onCancelMock",
    value: function onCancelMock() {
      this.resetMockState();
    }
  }, {
    key: "resetMockState",
    value: function resetMockState() {
      this.setState({
        mockurl: EMPTY_CONTENT,
        mocktemplate: EMPTY_CONTENT,
        editMockApiInfo: null,
        mockAdd: false
      });
    }
  }, {
    key: "isApiHookWork",
    value: function isApiHookWork() {
      var allowOrigins = this.props.allowOrigins;

      if (Array.isArray(allowOrigins)) {
        return allowOrigins.includes(window.location.origin);
      }

      return true;
    }
  }, {
    key: "isApiEqual",
    value: function isApiEqual(a, b) {
      return String(a) === String(b);
    }
  }, {
    key: "formatResponse",
    value: function formatResponse() {
      var res = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var responseType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'text';

      if (res && responseType === 'json') {
        return JSON.stringify(res, null, 4);
      }

      return res || '';
    }
  }, {
    key: "registerMock",
    value: function registerMock() {
      (0, _ajaxHook.unProxy)();
      var mockList = this.state.mockList;
      mockList.forEach(function (_ref3) {
        var url = _ref3.url,
            template = _ref3.template;

        _mockjs.default.mock(url, template);
      });
    }
  }, {
    key: "unRegisterMock",
    value: function unRegisterMock() {
      if (window._XMLHttpRequest) {
        window.XMLHttpRequest = window._XMLHttpRequest;
      }

      ajaxProxy();
    }
  }, {
    key: "renderApiResponse",
    value: function renderApiResponse() {
      var _this$state5 = this.state,
          apiContent = _this$state5.apiContent,
          editApiInfo = _this$state5.editApiInfo;
      return /*#__PURE__*/_react.default.createElement("textarea", {
        disabled: !editApiInfo,
        value: apiContent,
        onChange: this.onApiContentChange
      });
    }
  }, {
    key: "renderFilter",
    value: function renderFilter() {
      var _this3 = this;

      var _this$state6 = this.state,
          editApiInfo = _this$state6.editApiInfo,
          apiList = _this$state6.apiList,
          apiStatusCode = _this$state6.apiStatusCode;
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "api-hook-main"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "api-hook-title"
      }, "\u63A5\u53E3\u8BF7\u6C42\u5217\u8868"), /*#__PURE__*/_react.default.createElement("div", {
        className: "api-hook-list"
      }, apiList.map(function (item) {
        var method = item.method,
            url = item.url,
            isEditActive = item.isEditActive,
            isEditWaiting = item.isEditWaiting,
            isFilter = item.isFilter;
        return /*#__PURE__*/_react.default.createElement("div", {
          key: "".concat(method).concat(url),
          className: "api-item ".concat(isEditWaiting ? 'wait-mode' : isEditActive ? 'edit-mode' : 'normal-mode'),
          onClick: function onClick() {
            if (isEditWaiting) {
              var _apiInfo$response;

              // 【等待编辑】模式下，可点击切换成【编辑】模式
              var apiInfo = Object.assign({}, item);
              apiInfo.isEditWaiting = false;
              apiInfo.isEditActive = true;

              _this3.setState({
                apiList: _this3.putApiInfo2Top(apiList, apiInfo),
                editApiInfo: apiInfo,
                apiContent: _this3.formatResponse(apiInfo === null || apiInfo === void 0 ? void 0 : (_apiInfo$response = apiInfo.response) === null || _apiInfo$response === void 0 ? void 0 : _apiInfo$response.response)
              });
            }
          }
        }, /*#__PURE__*/_react.default.createElement("span", {
          className: "api-method"
        }, method), /*#__PURE__*/_react.default.createElement("span", {
          className: "api-url",
          title: url
        }, url), /*#__PURE__*/_react.default.createElement("span", {
          className: "delete-btn",
          "data-method": method,
          "data-url": url,
          disabled: isEditWaiting || isEditActive,
          onClick: _this3.onDeleteApi
        }, "\xD7"), /*#__PURE__*/_react.default.createElement("input", {
          type: "checkbox",
          title: "\u662F\u5426\u62E6\u622A",
          "data-method": method,
          "data-url": url,
          checked: isFilter,
          disabled: isEditWaiting || isEditActive,
          onChange: _this3.onApiFilterChange
        }));
      })), /*#__PURE__*/_react.default.createElement("div", {
        className: "api-hook-content"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "api-hook-title"
      }, "\u63A5\u53E3\u54CD\u5E94\u5185\u5BB9", editApiInfo ? /*#__PURE__*/_react.default.createElement("span", {
        className: "edit-url"
      }, "(", editApiInfo.url, ")") : ''), this.renderApiResponse(), /*#__PURE__*/_react.default.createElement("div", {
        className: "api-hook-title"
      }, "\u63A5\u53E3\u54CD\u5E94\u72B6\u6001\u7801", /*#__PURE__*/_react.default.createElement("select", {
        value: apiStatusCode,
        disabled: !editApiInfo,
        className: "status-code-select",
        onChange: this.onStatusCodeChange
      }, /*#__PURE__*/_react.default.createElement("option", {
        value: 200
      }, "200"), /*#__PURE__*/_react.default.createElement("option", {
        value: 301
      }, "302"), /*#__PURE__*/_react.default.createElement("option", {
        value: 302
      }, "302"), /*#__PURE__*/_react.default.createElement("option", {
        value: 304
      }, "304"), /*#__PURE__*/_react.default.createElement("option", {
        value: 400
      }, "400"), /*#__PURE__*/_react.default.createElement("option", {
        value: 401
      }, "401"), /*#__PURE__*/_react.default.createElement("option", {
        value: 403
      }, "403"), /*#__PURE__*/_react.default.createElement("option", {
        value: 404
      }, "404"), /*#__PURE__*/_react.default.createElement("option", {
        value: 500
      }, "500"), /*#__PURE__*/_react.default.createElement("option", {
        value: 501
      }, "501"), /*#__PURE__*/_react.default.createElement("option", {
        value: 502
      }, "502"), /*#__PURE__*/_react.default.createElement("option", {
        value: 503
      }, "503"))), /*#__PURE__*/_react.default.createElement("div", {
        className: "botttom-bar"
      }, /*#__PURE__*/_react.default.createElement("button", {
        disabled: !editApiInfo,
        onClick: this.postEditMessage
      }, "\u786E\u5B9A"))));
    }
  }, {
    key: "renderMock",
    value: function renderMock() {
      var _this4 = this;

      var _this$state7 = this.state,
          mockList = _this$state7.mockList,
          editMockApiInfo = _this$state7.editMockApiInfo,
          mockAdd = _this$state7.mockAdd,
          _this$state7$mockurl = _this$state7.mockurl,
          mockurl = _this$state7$mockurl === void 0 ? '' : _this$state7$mockurl,
          _this$state7$mocktemp = _this$state7.mocktemplate,
          mocktemplate = _this$state7$mocktemp === void 0 ? '' : _this$state7$mocktemp;
      var btnDisabled = mockAdd || editMockApiInfo;
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "api-hook-main"
      }, /*#__PURE__*/_react.default.createElement("div", {
        style: {
          margin: '15px 0'
        }
      }, /*#__PURE__*/_react.default.createElement("button", {
        disabled: btnDisabled,
        className: "add-mock-btn",
        onClick: this.onAddMockApi
      }, "\u6DFB\u52A0mock")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mock-list"
      }, mockList.map(function (mockItem) {
        var id = mockItem.id,
            url = mockItem.url;
        return /*#__PURE__*/_react.default.createElement("div", {
          key: id,
          className: "mock-item"
        }, /*#__PURE__*/_react.default.createElement("span", {
          className: "mock-url"
        }, url), /*#__PURE__*/_react.default.createElement("span", {
          className: "edit-btn",
          disabled: btnDisabled,
          onClick: function onClick() {
            _this4.setState({
              editMockApiInfo: mockItem,
              mockurl: mockItem.url,
              mocktemplate: mockItem.templateStr
            });
          }
        }));
      })), mockAdd || editMockApiInfo ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement("label", null, "url:"), /*#__PURE__*/_react.default.createElement("input", {
        type: "text",
        className: "mock-url",
        "data-key": "mockurl",
        onChange: this.onMockInptChange,
        value: mockurl
      })), /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement("label", null, "template:"), /*#__PURE__*/_react.default.createElement("textarea", {
        className: "mock-content",
        "data-key": "mocktemplate",
        onChange: this.onMockInptChange,
        value: mocktemplate,
        rows: 10
      })), /*#__PURE__*/_react.default.createElement("div", {
        className: "add-mock-button-bar"
      }, /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.onSaveMock
      }, "\u786E\u5B9A"), /*#__PURE__*/_react.default.createElement("button", {
        onClick: this.onCancelMock
      }, "\u53D6\u6D88"))) : null);
    }
  }, {
    key: "renderTabs",
    value: function renderTabs() {
      var _this5 = this;

      var hookMode = this.state.hookMode;
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "api-hook-tabs"
      }, /*#__PURE__*/_react.default.createElement("button", {
        className: hookMode === FILTER_MODE ? 'active' : 'normal',
        onClick: function onClick() {
          _this5.setState({
            hookMode: FILTER_MODE
          });

          _this5.unRegisterMock();
        }
      }, "\u63A5\u53E3\u62E6\u622A"), /*#__PURE__*/_react.default.createElement("button", {
        className: hookMode === MOCK_MODE ? 'active' : 'normal',
        onClick: function onClick() {
          _this5.setState({
            hookMode: MOCK_MODE
          });

          _this5.registerMock();
        }
      }, "\u63A5\u53E3Mock"));
    }
  }, {
    key: "renderToggleBar",
    value: function renderToggleBar() {
      var visiable = this.state.visiable;
      return /*#__PURE__*/_react.default.createElement("div", {
        title: "api-hook",
        className: "api-hook-toggle-bar",
        onClick: this.onToggleVisiable,
        ref: this.toggleBarRef
      }, visiable ? '>' : '<');
    }
  }, {
    key: "render",
    value: function render() {
      var _this6 = this;

      var _this$state8 = this.state,
          visiable = _this$state8.visiable,
          hookMode = _this$state8.hookMode,
          closeApiHook = _this$state8.closeApiHook;

      if (!this.isApiHookWork() || closeApiHook) {
        return null;
      }

      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "api-hook-container ".concat(visiable ? 'visiable' : 'non-visiable')
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "api-hook-close",
        title: "\u5173\u95ED\u5DE5\u5177\u9762\u677F",
        onClick: function onClick() {
          _this6.setState({
            closeApiHook: true
          });
        }
      }, "x"), this.renderTabs(), hookMode === FILTER_MODE ? this.renderFilter() : this.renderMock()), this.renderToggleBar());
    }
  }]);

  return ApiHook;
}(_react.default.PureComponent);

var _default = ApiHook;
exports.default = _default;