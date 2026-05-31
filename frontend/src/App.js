import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import ProductDetails from "./pages/ProductDetails";
import Orders from "./pages/Orders";

function App() {
  return (

    
    <div>
      <Navbar />   {/* 👈 ADD THIS */}

      <h1 className="text-red-500 text-3xl">TAILWIND WORKING</h1>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/orders" element={<Orders />} />
        
      </Routes>
      
    </div>

    
  );
  
}

export default App;