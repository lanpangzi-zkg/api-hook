import React from 'react';
import Mock from 'mockjs';
import { proxy, unProxy } from "ajax-hook";
import messageCenter from './MessageCenter';
import './index.css';

function ajaxProxy() {
    const XHR_DONE =XMLHttpRequest.DONE;
    const _proxy = proxy({
        onRequest: (config, handler) => {
            handler.next(config);
        },
        onError: (err, handler) => {
            handler.next(err);
        },
        onResponse: (response, handler) => {
            messageCenter.postOriginMessage({
                response,
                handler,
            });
        }
    });
    XMLHttpRequest.DONE = XHR_DONE;
    messageCenter.observe(_proxy);
    _proxy.onEditMessage = ({ response, handler }) => {
        handler.next(response);
    };
}

ajaxProxy();

const EMPTY_CONTENT = '';
const FILTER_MODE = 'filter';
const MOCK_MODE ='mock';
const NO_SUPPORT_TYPE = ['document', 'blob', 'arraybuffer', 'ms-stream'];

class ApiHook extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            closeApiHook: false,
            mockList: [],
            editMockApiInfo: null,
            apiList: [],
            hookMode: FILTER_MODE,
            editApiInfo: null,
            apiContent: EMPTY_CONTENT,
            apiStatusCode: 200,
            visiable: props.defaultVisiable || false,
        };
        this.isDragMove = false;
        this.toggleBarRef = React.createRef();
        this.onDeleteApi = this.onDeleteApi.bind(this);
        this.onAddMockApi = this.onAddMockApi.bind(this);
        this.onSaveMock = this.onSaveMock.bind(this);
        this.onCancelMock = this.onCancelMock.bind(this);
        this.onDeleteMock = this.onDeleteMock.bind(this);
        this.onMockInptChange = this.onMockInptChange.bind(this);
        this.onOriginMessage = this.onOriginMessage.bind(this);
        this.postEditMessage = this.postEditMessage.bind(this);
        this.onToggleVisiable = this.onToggleVisiable.bind(this);
        this.onApiFilterChange = this.onApiFilterChange.bind(this);
        this.onApiContentChange = this.onApiContentChange.bind(this);
        this.onStatusCodeChange = this.onStatusCodeChange.bind(this);
    }
    componentDidMount() {
        if (!this.isApiHookWork()) {
            unProxy();
            return;
        }
        messageCenter.observe(this);
    }
    createApiKey(method, url) {
        return {
            [Symbol.toPrimitive]() {
                return `${this.method}${this.url}`;
            },
            method,
            url,
            response: null,
            isFilter: Boolean(this.props.autoFilter) || false, // 是否拦截
            isEditActive: false, // 是否处于编辑状态
            isEditWaiting: false, // 是否处于等待编辑状态，此状态下接口数据已经拦截，但没有编辑
        };
    }
    /**
     * @desc 接收api的原始数据
     */
    onOriginMessage(data) {
        let { visiable, apiList, editApiInfo, hookMode } = this.state;
        const { handler, response } = data;
        const { responseType } = handler.xhr;
        if (NO_SUPPORT_TYPE.includes(responseType) || !visiable || hookMode === MOCK_MODE) { // 响应类型不支持/不可见/mock模式时直接返回
            messageCenter.postEditMessage({
                response,
                handler,
            });
            return;
        }
        const { response: res, config } = response;
        const { method, url } = config;
        let apiInfo = apiList.find((item) => {
            return item.method === method && item.url === url;
        });
        if (!apiInfo) {
            apiInfo = this.createApiKey(method, url);
            apiList = apiList.concat(apiInfo);
        }
        if (apiInfo.isFilter) { // 接口拦截
            apiInfo.handler = handler;
            apiInfo.responseType = responseType;
            apiInfo.response = response;
            apiInfo.isEditActive = editApiInfo ? this.isApiEqual(apiInfo, editApiInfo) : true;
            apiInfo.isEditWaiting = !apiInfo.isEditActive;
            const newState = {
                apiList: this.putApiInfo2Top(apiList, apiInfo),
                editApiInfo: editApiInfo || apiInfo,
            };
            if (apiInfo.isEditActive) {
                newState.apiStatusCode = response.status;
                newState.apiContent = this.formatResponse(res, responseType);
            }
            this.setState(newState);
        } else {
            messageCenter.postEditMessage({
                response,
                handler,
            });
            this.setState({
                apiList,
            });
        }
    }
    /**
     * @desc 置顶处于【编辑】和【等待编辑】响应内容的接口，【等待编辑】处于【编辑】后面
     * @param {Array} list 所有接口列表
     * @param {Object} apiInfo 需要置顶的接口
     */
    putApiInfo2Top(apiList, apiInfo) {
        const { isEditActive, isEditWaiting } = apiInfo;
        if (isEditActive || isEditWaiting) {
            const _apiList = apiList.reduce((arr, item) => {
                if (!this.isApiEqual(apiInfo, item)) {
                    if (isEditActive && item.isEditActive) {
                        item.isEditActive = false;
                        item.isEditWaiting = true;
                    }
                    arr.push(item);
                }
                return arr;
            }, []);
            if (isEditActive) { // 编辑模式，排第一位
                _apiList.unshift(apiInfo);
            } else {
                _apiList.splice(1,0, apiInfo); // 等待编辑模式，排第二位
            }
            return _apiList;
        }
        return apiList;
    }
    /**
     * @desc 发送经过修改的数据
     */
    postEditMessage() {
        const { apiList, editApiInfo, apiContent, apiStatusCode } = this.state;
        if (!editApiInfo) {
            return;
        }
        let editResponse = null;
        let apiInfo = null;
        apiList.some((item) => {
            const { method, url, response } = item;
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
                messageCenter.postEditMessage({
                    response: editResponse,
                    handler: apiInfo.handler,
                });
                apiInfo.isEditActive = false;
                apiInfo.isEditWaiting = false;
                const editWaitApiIndex = apiList.findIndex((item) => {
                    return item.isEditWaiting;
                });
                if (editWaitApiIndex > 0) { // 还有处于【等待编辑】的接口，将第一个等待的接口激活成编辑模式
                    const _apiList = apiList.slice();
                    _apiList.shift();
                    _apiList.push(apiInfo);
                    const editWaitApiInfo = _apiList[editWaitApiIndex - 1];
                    editWaitApiInfo.isEditWaiting = false;
                    editWaitApiInfo.isEditActive = true;
                    this.setState({
                        apiList: _apiList,
                        editApiInfo: editWaitApiInfo,
                        apiStatusCode: editWaitApiInfo?.response?.status,
                        apiContent: this.formatResponse(editWaitApiInfo?.response?.response, editWaitApiInfo?.responseType),
                    });
                } else {
                    this.setState({
                        apiList: apiList.slice(),
                        editApiInfo: null,
                        apiStatusCode: 200,
                        apiContent: EMPTY_CONTENT,
                    });
                }
                apiInfo.handler = null;
            } catch(e) {
                alert(`JSON解析异常:${e.message}`);
            }
        }
    }
    onToggleVisiable() {
        const { visiable, editApiInfo } = this.state;
        if (editApiInfo) {
            this.postEditMessage();
        }
        this.setState({
            visiable: !visiable,
        });
    }    
    onApiContentChange(e) {
        this.setState({
            apiContent: e.target.value,
        });
    }
    onDeleteMock(e) {
        const { id } = e.target.dataset;
        if (e.target.hasAttribute('disabled')) {
            return;
        }
        if (id) {
            const { mockList } = this.state;
            const _mockList = mockList.reduce((arr, item) => {
                if (item.id !== id) {
                    arr.push(item);
                } else {
                    delete Mock._mocked[item.url];
                }
                return arr;
            }, []);
            this.setState({
                mockList: _mockList,
            });
        }
    }
    onDeleteApi(e) {
        e.stopPropagation();
        const { method, url } = e.target.dataset;
        if (e.target.hasAttribute('disabled')) {
            return;
        }
        if (method && url) {
            const { apiList } = this.state;
            const _apiList = apiList.reduce((arr, item) => {
                if (item.method !== method || item.url !== url) {
                    arr.push(item);
                }
                return arr;
            }, []);
            this.setState({
                apiList: _apiList,
            });
        }
    }
    onApiFilterChange(e) {
        if (e.target.hasAttribute('disabled')) {
            return;
        }
        const isFilter = e.target.checked; // 是否拦截接口响应开关
        const { apiList } = this.state;
        const { method, url } = e.target.dataset;
        const _apiList = apiList.reduce((arr, item) => {
            if (item.method === method && item.url === url) {
                item.isFilter = isFilter;
            }
            arr.push(item);
            return arr;
        }, []);
        this.setState({
            apiList: _apiList,
        });
    }
    onStatusCodeChange(e) {
        this.setState({
            apiStatusCode: e.target.value,
        });
    }
    onMockContentChange(e) {
        this.setState({
            mockContent: e.target.value,
        });
    }
    onAddMockApi() {
        this.setState({
           mockAdd: true,
        });
    }
    onMockInptChange(e) {
        const { key } = e.target.dataset;
        this.setState({
            [key]: e.target.value,
        });
    }
    onSaveMock() {
        const { mockurl, mocktemplate, editMockApiInfo } = this.state;
        if (!mockurl || !mocktemplate) {
            alert('请输入mock接口的地址和mock结构');
            return;
        }
        let template;
        try {
            template = JSON.parse(mocktemplate);
            let { mockList } = this.state;
            this.resetMockState();
            if (editMockApiInfo) { // 编辑
                mockList = mockList.reduce((arr, item) => {
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
                    id: `${Date.now()}`,
                    url: mockurl,
                    template,
                    templateStr: mocktemplate,
                });
            }
            this.setState({
                mockList,
            });
            Mock.mock(mockurl, template);
        } catch(e) {
            alert(`JSON解析异常:${e.message}`);
        }
    }
    onCancelMock() {
        this.resetMockState();
    }
    resetMockState() {
        this.setState({
            mockurl: EMPTY_CONTENT,
            mocktemplate: EMPTY_CONTENT,
            editMockApiInfo: null,
            mockAdd: false,
        });
    }
    isApiHookWork() {
        const { allowOrigins } = this.props;
        if (Array.isArray(allowOrigins)) {
            return allowOrigins.includes(window.location.origin);
        }
        return true;
    }
    isApiEqual(a, b) {
        return String(a) === String(b);
    }
    formatResponse(res = {}, responseType = 'text') {
        if (res && responseType === 'json') {
            return JSON.stringify(res, null, 4);
        }
        return res || '';
    }
    registerMock() {
        unProxy();
        const { mockList } = this.state;
        mockList.forEach(({ url, template }) => {
            Mock.mock(url, template);
        });
    }
    unRegisterMock() {
        if (window._XMLHttpRequest) {
            window.XMLHttpRequest = window._XMLHttpRequest;
        }
        ajaxProxy();
    }
    renderApiResponse() {
        const { apiContent, editApiInfo } = this.state;
        return (
            <textarea
                disabled={!editApiInfo}
                value={apiContent}
                onChange={this.onApiContentChange}
            />
        );
    }
    renderFilter() {
        const { editApiInfo, apiList, apiStatusCode } = this.state;
        return (
            <div className="api-hook-main">
                <div className="api-hook-title">接口请求列表</div>
                <div className="api-hook-list">
                    {
                        apiList.map((item) => {
                            const { method, url, isEditActive, isEditWaiting, isFilter } = item;
                            return (
                                <div
                                    key={`${method}${url}`}
                                    className={`api-item ${isEditWaiting ? 'wait-mode' : isEditActive ? 'edit-mode' : 'normal-mode'}`}
                                    onClick={() => {
                                        if (isEditWaiting) { // 【等待编辑】模式下，可点击切换成【编辑】模式
                                            const apiInfo = Object.assign({}, item);
                                            apiInfo.isEditWaiting = false;
                                            apiInfo.isEditActive = true;
                                            this.setState({
                                                apiList: this.putApiInfo2Top(apiList, apiInfo),
                                                editApiInfo: apiInfo,
                                                apiContent: this.formatResponse(apiInfo?.response?.response, apiInfo?.responseType),
                                            });
                                        }
                                    }}
                                >
                                    <span className="api-method">
                                        {method}
                                    </span>
                                    <span className="api-url" title={url}>{url}</span>
                                    <span
                                        className="delete-btn"
                                        data-method={method}
                                        data-url={url}
                                        disabled={isEditWaiting || isEditActive}
                                        onClick={this.onDeleteApi}
                                    >×</span>
                                    <input
                                        type="checkbox"
                                        title="是否拦截"
                                        data-method={method}
                                        data-url={url}
                                        checked={isFilter}
                                        disabled={isEditWaiting || isEditActive}
                                        onChange={this.onApiFilterChange} />
                                </div>
                            );
                        })
                    }
                </div>
                <div className="api-hook-content">
                    <div className="api-hook-title">接口响应内容{editApiInfo ? <span className="edit-url">({editApiInfo.url})</span> : ''}</div>
                    {
                        this.renderApiResponse()
                    }
                    <div className="api-hook-title">
                        接口响应状态码
                        <select
                            value={apiStatusCode}
                            disabled={!editApiInfo}
                            className="status-code-select"
                            onChange={this.onStatusCodeChange}
                        >
                            <option value={200}>200</option>
                            <option value={301}>302</option>
                            <option value={302}>302</option>
                            <option value={304}>304</option>
                            <option value={400}>400</option>
                            <option value={401}>401</option>
                            <option value={403}>403</option>
                            <option value={404}>404</option>
                            <option value={500}>500</option>
                            <option value={501}>501</option>
                            <option value={502}>502</option>
                            <option value={503}>503</option>
                        </select>
                    </div>
                    <div className="botttom-bar">
                        <button
                            disabled={!editApiInfo}
                            onClick={this.postEditMessage}
                        >
                            确定
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    renderMock() {
        const { mockList, editMockApiInfo, mockAdd, mockurl = '', mocktemplate = '' } = this.state;
        const btnDisabled = mockAdd || editMockApiInfo;
        return (
            <div className="api-hook-main">
                <div
                    style={{
                        margin: '15px 0',
                    }}
                >
                    <button
                        disabled={btnDisabled}
                        className="add-mock-btn"
                        onClick={this.onAddMockApi}
                    >
                        添加mock
                    </button>
                </div>
                <div className="mock-list">
                    {
                        mockList.map((mockItem) => {
                            const { id, url } = mockItem;
                            return (
                                <div key={id} className="mock-item">
                                    <span className="mock-url">{url}</span>
                                    <span
                                        className="edit-btn"
                                        disabled={btnDisabled}
                                        onClick={() => {
                                            this.setState({
                                                editMockApiInfo: mockItem,
                                                mockurl: mockItem.url,
                                                mocktemplate: mockItem.templateStr,
                                            });
                                        }}
                                    >
                                    </span>
                                </div>
                            );
                        })
                    }
                </div>
                {
                    mockAdd || editMockApiInfo ?
                    <>
                        <p>
                            <label>url:</label>
                            <input
                                type="text"
                                className="mock-url"
                                data-key="mockurl"
                                onChange={this.onMockInptChange}
                                value={mockurl}
                            />
                        </p>
                        <p>
                            <label>template:</label>
                            <textarea
                                className="mock-content"
                                data-key="mocktemplate"
                                onChange={this.onMockInptChange}
                                value={mocktemplate}
                                rows={10}
                            ></textarea>
                        </p>
                        <div className="add-mock-button-bar">
                            <button onClick={this.onSaveMock}>确定</button>
                            <button onClick={this.onCancelMock}>取消</button>
                        </div>
                    </> : null
                }
            </div>
        );
    }
    renderTabs() {
        const { hookMode } = this.state;
        return (
            <div className="api-hook-tabs">
                <button
                    className={hookMode === FILTER_MODE ? 'active' : 'normal'}
                    onClick={() => {
                        this.setState({
                            hookMode: FILTER_MODE,
                        });
                        this.unRegisterMock();
                    }}
                >
                    接口拦截
                </button>
                <button
                    className={hookMode === MOCK_MODE ? 'active' : 'normal'}
                    onClick={() => {
                        this.setState({
                            hookMode: MOCK_MODE,
                        });
                        this.registerMock();
                    }}
                >
                    接口Mock
                </button>
            </div>
        );
    }
    renderToggleBar() {
        const { visiable } = this.state;
        return (
            <div
                title="api-hook"
                className="api-hook-toggle-bar"
                onClick={this.onToggleVisiable}
                ref={this.toggleBarRef}
            >
                {
                    visiable ? '>' : '<'
                }
            </div>
        );
    }
    render() {
        const { visiable, hookMode, closeApiHook } = this.state;
        if (!this.isApiHookWork() || closeApiHook) {
            return null;
        }
        return (
            <>
                <div className={`api-hook-container ${visiable ? 'visiable' : 'non-visiable'}`}>
                    <div
                        className="api-hook-close"
                        title="关闭工具面板"
                        onClick={() => {
                            this.setState({
                                closeApiHook: true,
                            });
                        }}
                    >x</div>
                    {this.renderTabs()}
                    {
                        hookMode === FILTER_MODE ? this.renderFilter() : this.renderMock()
                    }
                </div>
                {this.renderToggleBar()}
            </>
        );
    }
}

export default ApiHook;

