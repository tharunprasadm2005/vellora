import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, []);

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/cart",
        {
          productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Added to cart");
    } catch (error) {
      alert("Please login first");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Products</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(product => (
          <div
            key={product._id}
            className="bg-white p-4 rounded shadow hover:shadow-xl transition"
          >
            <h3 className="text-lg font-semibold mb-2">
              <Link to={`/product/${product._id}`}>
                {product.name}
              </Link>
            </h3>

            <p className="text-green-600 font-bold text-xl">
              ₹{product.price}
            </p>

            <button
              onClick={() => addToCart(product._id)}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;