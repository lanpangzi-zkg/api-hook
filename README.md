### api-hook
api可视化测试工具，提供接口拦截和接口模拟功能，以一种低成本的方式定制个性化数据，目前只支持react项目使用，且确保网络请求都是通过ajax发出的。

### 使用说明

 __1.安装npm包__ 

npm install api-hook --save-dev

 __2.组件导入__ 

在项目入口文件引入组件
```
import ApiHook from 'api-hook';

function App() {
    return (
        <div className="App">
            <Main />
            <ApiHook
                autoFilter
                defaultVisiable
                allowOrigins={['http://localhost:3000']}
            />
        </div>
    );
}
......
ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
    document.getElementById('root')
);
```

### 参数说明
|属性|说明|默认值|
| ------------- | ------------- |------------- |
|autoFilter |是否默认拦截接口 | false|
|defaultVisiable |工具面板是否默认可见 |false |
|allowOrigins |容许开启工具功能的站点，为数组类型，只有配置此项，才能在项目中使用工具 | |
