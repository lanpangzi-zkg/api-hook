// import Mock from 'mockjs';
import TestApi from './components/TestApi';
import ApiHook from './components/ApiHook';

function App() {
	// Mock.mock('http://127.0.0.1:4000/list', {
	// 	"code": 0,
  	// 	"data|1-3": ["a"]
	// });
    return (
		<div className="App">
			<TestApi />
			<ApiHook
				autoFilter
				defaultVisiable
				allowOrigins={['http://localhost:3000']}
			/>
		</div>
    );
}

export default App;
