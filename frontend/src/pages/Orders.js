import React, { useEffect, useState } from "react";
import axios from "axios";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          "http://localhost:5000/api/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map(order => (
          <div key={order._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <h4>Order ID: {order._id}</h4>
            <p>Total: ₹{order.totalPrice}</p>

            {order.orderItems.map(item => (
              <div key={item._id}>
                <p>{item.product.name} - Qty: {item.quantity}</p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;