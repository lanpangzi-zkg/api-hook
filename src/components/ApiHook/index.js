import React from 'react';
import ajaxProxy from './AjaxProxy';
import './index.css';
import messageCenter from './MessageCenter';

ajaxProxy();
const EMPTY_CONTENT = '';
class ApiHook extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            apiList: [],
            editApiInfo: null,
            apiContent: EMPTY_CONTENT,
            visiable: props.defaultVisiable || false,
        };
        this.containerRef = React.createRef();
        this.onDeleteApi = this.onDeleteApi.bind(this);
        this.onOriginMessage = this.onOriginMessage.bind(this);
        this.postEditMessage = this.postEditMessage.bind(this);
        this.onToggleVisiable = this.onToggleVisiable.bind(this);
        this.onApiFilterChange = this.onApiFilterChange.bind(this);
        this.onApiContentChange = this.onApiContentChange.bind(this);
    }
    createApiKey(method, url) {
        return {
            [Symbol.toPrimitive]() {
                return `${this.method}${this.url}`;
            },
            method,
            url,
            response: null,
            isFilter: false, // 是否拦截开关，默认不拦截
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
        this.handler = handler;
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
            apiInfo.response = response;
            apiInfo.isEditActive = editApiInfo ? this.isApiEqual(apiInfo, editApiInfo) : true;
            apiInfo.isEditWaiting = !apiInfo.isEditActive;
            this.setState({
                apiList,
                editApiInfo: editApiInfo || apiInfo,
                apiContent: apiInfo.isEditActive ? this.formatResponse(res) : '',
            });
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
     * @desc 发送经过修改的数据
     */
    postEditMessage() {
        const { apiList, editApiInfo, apiContent } = this.state;
        if (!editApiInfo) {
            return;
        }
        let editResponse = null;
        apiList.some((item) => {
            const { method, url, response } = item;
            if (editApiInfo.method === method && editApiInfo.url === url) {
                editResponse = Object.assign({}, response);
                return true;
            }
        });
        if (editResponse) {
            try {
                const editContentObj = JSON.parse(apiContent);
                editResponse.response = editContentObj;
                messageCenter.postEditMessage({
                    response: editResponse,
                    handler: this.handler,
                });
                this.setState({
                    apiList: apiList.slice(),
                    editApiInfo: null,
                    apiContent: EMPTY_CONTENT,
                });
                this.handler = null;
            } catch(e) {
                alert('JSON解析错误,请检查数据格式是否符合JSON规范');
            }
        }
    }
    componentDidMount() {
        messageCenter.observe(this);
        // if (this.containerRef.current) {
        //     this.containerRef.current.addEventListener('mousemove', (e) => {
        //         if (this.isMove) {
        //             this.left = e.clientX - this.offsetX;
        //             e.target.style.left = `${this.left}px`;
        //             e.target.style.top = `${e.clientY - this.offsetY}px`;
        //         }
        //     }, false);
        //     this.containerRef.current.addEventListener('mousedown', (e) => {
        //         if (!this.state.visiable) {
        //             return;
        //         }
        //         const rect = this.containerRef.current.getBoundingClientRect();
        //         this.offsetX = e.clientX - rect.left;
        //         this.offsetY = e.clientY - rect.top;
        //         this.isMove = true;
        //     }, false);
        //     this.containerRef.current.addEventListener('mouseup', () => {
        //         this.isMove = false;
        //     }, false);
        // }
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
        const isFilter = e.target.checked;
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
        if (apiInfo.isFilter && apiInfo.isEditWaiting) {
            this.setState({
                editApiInfo: apiInfo,
                apiContent: this.formatResponse(apiInfo?.response?.response),
            });
        }
        this.setState({
            apiList: _apiList,
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
        const { editApiInfo, visiable, apiList } = this.state;
        return (
            <div
                ref={this.containerRef}
                className={`api-hook-container ${visiable ? 'visiable' : 'non-visiable'}`}
            >
                <div className="api-hook-main">
                    <div className="api-hook-title">接口请求列表</div>
                    <div className="api-hook-list">
                        {
                            apiList.map(({ method, url, isEditWaiting }) => {
                                return (
                                    <div className={`api-item ${isEditWaiting ? 'wait-mode' : 'normal-mode'}`} key={`${method}${url}`}>
                                        <span className="api-method">
                                            {method}
                                        </span>
                                        <span className="api-url" title={url}>{url}</span>
                                        <span
                                            className="delete-api"
                                            data-method={method}
                                            data-url={url}
                                            onClick={this.onDeleteApi}
                                        >×</span>
                                        <input
                                            type="checkbox"
                                            title="是否拦截"
                                            data-method={method}
                                            data-url={url}
                                            onChange={this.onApiFilterChange} />
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className="api-hook-content">
                        <div className="api-hook-title">接口响应内容</div>
                        {
                            this.renderEditContent()
                        }
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

