import TestApi from './components/TestApi';
import ApiHook from './components/ApiHook';

function App() {
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
