import Menu from './components/Menu';
import ApiHook from './components/ApiHook';

function App() {
    return (
		<div className="App">
			<Menu />
			<ApiHook defaultVisiable />
		</div>
    );
}

export default App;
