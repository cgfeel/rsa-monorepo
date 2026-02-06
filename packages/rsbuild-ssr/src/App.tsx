import React from 'react';
import './App.css';

const App = () => {
  const [count, setCount] = React.useState(0);
  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
      <div className="px-4 py-3">
        <button
          onClick={() => setCount(count + 1)}
          className="cursor-pointer rounded bg-amber-600 px-4 py-2 text-white"
        >
          Click me {count} times
        </button>
      </div>
    </div>
  );
};

export default App;
