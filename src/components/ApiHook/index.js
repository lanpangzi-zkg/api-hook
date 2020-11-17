import React from 'react';
import ajaxProxy from './AjaxProxy';
import './index.css';
import messageCenter from './MessageCenter';

ajaxProxy();
const EMPTY_CONTENT = '';
const FILTER_MODE = 'filter';
const MOCK_MODE ='mock';

class ApiHook extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            apiList: [],
            hookMode: FILTER_MODE,
            editApiInfo: null,
            apiContent: EMPTY_CONTENT,
            apiStatusCode: 200,
            visiable: props.defaultVisiable || false,
        };
        this.containerRef = React.createRef();
        this.onDeleteApi = this.onDeleteApi.bind(this);
        this.onOriginMessage = this.onOriginMessage.bind(this);
        this.postEditMessage = this.postEditMessage.bind(this);
        this.onToggleVisiable = this.onToggleVisiable.bind(this);
        this.onApiFilterChange = this.onApiFilterChange.bind(this);
        this.onApiContentChange = this.onApiContentChange.bind(this);
        this.onStatusCodeChange = this.onStatusCodeChange.bind(this);
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
        let { visiable, apiList, editApiInfo } = this.state;
        const { handler, response } = data;
        if (!visiable) { // 不可见时直接返回
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
            apiInfo.response = response;
            apiInfo.isEditActive = editApiInfo ? this.isApiEqual(apiInfo, editApiInfo) : true;
            apiInfo.isEditWaiting = !apiInfo.isEditActive;
            const newState = {
                apiList: this.putApiInfo2Top(apiList, apiInfo),
                editApiInfo: editApiInfo || apiInfo,
            };
            if (apiInfo.isEditActive) {
                newState.apiStatusCode = response.status;
                newState.apiContent = this.formatResponse(res);
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
        });
        if (editResponse) {
            try {
                const editContentObj = JSON.parse(apiContent || "{}");
                editResponse.response = editContentObj;
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
                        apiContent: this.formatResponse(editWaitApiInfo?.response?.response),
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
    componentDidMount() {
        messageCenter.observe(this);
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
    onDeleteApi(e) {
        e.stopPropagation();
        const { method, url } = e.target.dataset;
        if (e.target.hasAttribute('disabled')) {
            return;
        }
        const { apiList } = this.state;
        if (method && url) {
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
        let apiInfo;
        const _apiList = apiList.reduce((arr, item) => {
            if (item.method === method && item.url === url) {
                item.isFilter = isFilter;
                apiInfo = item;
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
    isApiEqual(a, b) {
        return String(a) === String(b);
    }
    formatResponse(res = {}) {
        if (res && typeof res === 'object') {
            return JSON.stringify(res, null, 4);
        }
        return res || '';
    }
    renderEditContent() {
        const { apiContent, editApiInfo } = this.state;
        return (
            <textarea
                disabled={!editApiInfo}
                value={apiContent}
                onChange={this.onApiContentChange}
            />
        );
    }
    render() {
        const { editApiInfo, visiable, apiList, apiStatusCode, hookMode } = this.state;
        return (
            <div
                ref={this.containerRef}
                className={`api-hook-container ${visiable ? 'visiable' : 'non-visiable'}`}
            >
                <div className="api-hook-tabs">
                    <button
                        className={hookMode === FILTER_MODE ? 'active' : 'normal'}
                        onClick={() => {
                            this.setState({
                                hookMode: FILTER_MODE,
                            });
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
                        }}
                    >
                        接口Mock
                    </button>
                </div>
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
                                                    apiContent: this.formatResponse(apiInfo?.response?.response),
                                                });
                                            }
                                        }}
                                    >
                                        <span className="api-method">
                                            {method}
                                        </span>
                                        <span className="api-url" title={url}>{url}</span>
                                        <span
                                            className="delete-api"
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
                            this.renderEditContent()
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
                                <option value={302}>302</option>
                                <option value={400}>400</option>
                                <option value={401}>401</option>
                                <option value={403}>403</option>
                                <option value={404}>404</option>
                                <option value={500}>500</option>
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
                <div className="toggle-bar" onClick={this.onToggleVisiable}>
                    {
                        visiable ? '>' : '<'
                    }
                </div>
            </div>
        );
    }
}

export default ApiHook;

