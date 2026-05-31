import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");

  const logoutHandler = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "15px",
      background: "#222",
      color: "#fff"
    }}>
      <h2>E-Shop</h2>

      <div>
        <Link to="/" style={{ color: "#fff", marginRight: "15px" }}>Home</Link>
        <Link to="/cart" style={{ color: "#fff", marginRight: "15px" }}>Cart</Link>
        <Link to="/orders" style={{ color: "#fff", marginRight: "15px" }}>Orders</Link>

        {token ? (
          <button onClick={logoutHandler}>Logout</button>
        ) : (
          <Link to="/login" style={{ color: "#fff" }}>Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;