"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  quantity: number;
  plant: {
    id: string;
    name: string;
    nameML: string | null;
    price: number;
    imageUrl: string | null;
    stock: number;
    seller: { name: string };
  };
};

export default function CartPage() {
  const { status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchCart();
  }, [status]);

  async function fetchCart() {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setCartItems(data);
    setLoading(false);
  }

  async function handleRemove(cartId: string) {
    const res = await fetch(`/api/cart/${cartId}`, { method: "DELETE" });
    if (res.ok) setCartItems(cartItems.filter(item => item.id !== cartId));
  }

  async function handleQuantityChange(cartId: string, quantity: number) {
    if (quantity < 1) return;
    const res = await fetch(`/api/cart/${cartId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) {
      setCartItems(cartItems.map(item =>
        item.id === cartId ? { ...item, quantity } : item
      ));
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.plant.price * item.quantity, 0
  );

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <img src="/applogo.png" alt="Growza" className="h-14 object-contain" />
        <button onClick={() => router.push("/buyer")}
          className="text-green-600 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50">
          ← Continue Shopping
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🛒 Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🌱</p>
            <p className="text-gray-500">Your cart is empty</p>
            <button onClick={() => router.push("/buyer")}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              Browse Plants
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id}
                  className="bg-white rounded-xl shadow p-4 flex gap-4 items-center">
                  {/* Image */}
                  <div className="w-20 h-20 bg-green-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.plant.imageUrl ? (
                      <img src={item.plant.imageUrl} alt={item.plant.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🌱</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.plant.name}</h3>
                    {item.plant.nameML && (
                      <p className="text-sm text-gray-500">{item.plant.nameML}</p>
                    )}
                    <p className="text-xs text-gray-400">by {item.plant.seller.name}</p>
                    <p className="text-green-600 font-bold mt-1">₹{item.plant.price}</p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      ₹{item.plant.price * item.quantity}
                    </p>
                    <button onClick={() => handleRemove(item.id)}
                      className="text-red-400 text-xs hover:text-red-600 mt-1">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Checkout */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">Total ({cartItems.length} items)</p>
                <p className="text-2xl font-bold text-green-600">₹{total}</p>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}