import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Home Page</h1>
      <div>
        <Link to="/Personal_info"><button>Personal Info</button></Link>
        <Link to="/page2"><button>General Health</button></Link>
        <Link to="/page3"><button>Dental Health</button></Link>
        <Link to="/page4"><button>Mental Health</button></Link>
      </div>
    </div>
  );
};

export default Home;
