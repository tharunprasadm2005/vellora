import React, { useEffect, useState } from "react";
import axios from "axios";

function Cart() {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          "http://localhost:5000/api/cart",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCart(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCart();
  }, []);

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/orders",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Order placed successfully");
    } catch (error) {
      alert("Error placing order");
    }
  };

  return (
    <div>
      <h2>Cart</h2>

      {cart && cart.items.length > 0 ? (
        cart.items.map(item => (
          <div key={item._id}>
            <h3>{item.product.name}</h3>
            <p>Quantity: {item.quantity}</p>
          </div>
        ))
      ) : (
        <p>Cart is empty</p>
      )}
      <button onClick={placeOrder}>
        Place Order
      </button>
    </div>
  );
}

export default Cart;