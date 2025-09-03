import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header bg-blue-900 text-white">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="text-lg font-bold mb-4">
          Edit <code className="bg-gray-800 px-2 py-1 rounded">src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link text-blue-300 hover:text-blue-100 transition-colors duration-300"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
