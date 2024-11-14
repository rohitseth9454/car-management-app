import React, { useState } from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";

const App = () => {
  const [token, setToken] = useState(null);

  return (
    <div>
      <h1>Car Management Application</h1>
      {!token ? (
        <div>
          <Signup />
          <Login setToken={setToken} />
        </div>
      ) : (
        <h2>Welcome to the Car Management System!</h2>
      )}
    </div>
  );
};

export default App;

