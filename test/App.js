import React from 'react';
import ApiHook from '../src/ApiHook';
import TestApi from './TestApi';

function App() {
    return (
		<div className="App">
			<TestApi />
			<ApiHook
				autoFilter
				defaultVisiable
				allowOrigins={['http://localhost:8080']}
			/>
		</div>
    );
}

export default App;
