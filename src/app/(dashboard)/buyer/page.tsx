"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Plant = {
  id: string;
  name: string;
  nameML: string | null;
  scientificName: string | null;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  seller: {
    name: string;
    address: string | null;
  };
};

const CATEGORIES = ["All", "Indoor", "Outdoor", "Medicinal", "Flowering", "Aquatic"];

export default function BuyerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filtered, setFiltered] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchPlants();
  }, [status]);

  useEffect(() => {
    let result = plants;

    if (category !== "All") {
      result = result.filter(p => p.category === category);
    }

    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.nameML?.includes(search)
      );
    }

    setFiltered(result);
  }, [plants, search, category]);

  async function fetchPlants() {
    const res = await fetch("/api/plants/all");
    const data = await res.json();
    setPlants(data);
    setFiltered(data);
    setLoading(false);
  }

  async function handleAddToCart(plantId: string) {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantId, quantity: 1 }),
    });
    if (res.ok) alert("Added to cart! 🛒");
    else alert("Failed to add to cart");
  }

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <img src="/applogo.png" alt="Growza" className="h-14 object-contain" />
        <div className="flex gap-4 items-center">
          <button
            onClick={() => router.push("/cart")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            🛒 Cart
          </button>
          <span className="text-sm text-gray-600">
            Hi, {session?.user?.name}!
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Search */}
        <input
          type="text"
          placeholder="Search plants in English or Malayalam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        {/* Category Filter */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                category === cat
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-green-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} plants found
        </p>

        {/* Plant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.length === 0 ? (
            <p className="text-gray-500 col-span-4">No plants found.</p>
          ) : (
            filtered.map((plant) => (
              <div key={plant.id}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden">
                {/* Image */}
                <div className="w-full h-44 bg-green-100">
                  {plant.imageUrl ? (
                    <img src={plant.imageUrl} alt={plant.name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <span className="text-5xl">🌱</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800">{plant.name}</h3>
                  {plant.nameML && (
                    <p className="text-sm text-gray-500">{plant.nameML}</p>
                  )}
                  {plant.scientificName && (
                    <p className="text-xs text-gray-400 italic">{plant.scientificName}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    📍 {plant.seller.address || plant.seller.name}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-green-600 font-bold text-lg">₹{plant.price}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {plant.category}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddToCart(plant.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition"
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      onClick={() => router.push(`/plant/${plant.id}`)}
                      className="flex-1 border border-green-600 text-green-600 py-2 rounded-lg text-sm hover:bg-green-50 transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}