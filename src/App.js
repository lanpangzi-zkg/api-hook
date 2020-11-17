import TestApi from './components/TestApi';
import ApiHook from './components/ApiHook';

function App() {
    return (
		<div className="App">
			<TestApi />
			<ApiHook
				defaultVisiable
				autoFilter
			/>
		</div>
    );
}

export default App;
