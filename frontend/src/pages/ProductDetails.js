import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.log(err));
  }, [id]);

  const addToCart = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/cart",
        {
          productId: id,
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

  if (!product) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{product.name}</h2>
      <p>₹{product.price}</p>
      <p>{product.description}</p>

      <button onClick={addToCart}>Add to Cart</button>
    </div>
  );
}

export default ProductDetails;