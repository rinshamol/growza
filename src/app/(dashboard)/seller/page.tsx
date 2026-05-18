"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Plant = {
  id: string;
  name: string;
  nameML: string | null;
  scientificName: string | null;
  price: number;
  stock: number;
  category: string;
  isAvailable: boolean;
  imageUrl: string | null;
};

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchPlants();
    }
  }, [status]);

  async function fetchPlants() {
    const res = await fetch("/api/plants");
    const data = await res.json();
    setPlants(data);
    setLoading(false);
  }

  async function handleAddPlant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/plants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        nameML: formData.get("nameML"),
        scientificName: formData.get("scientificName"),
        description: formData.get("description"),
        price: Number(formData.get("price")),
        stock: Number(formData.get("stock")),
        category: formData.get("category"),
      }),
    });

    if (res.ok) {
      setShowForm(false);
      fetchPlants();
    }
  }
  async function handleDelete(plantId: string) {
    const confirmed = confirm("Are you sure you want to delete this plant?");
    if (!confirmed) return;

    const res = await fetch(`/api/plants/${plantId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setPlants(plants.filter(p => p.id !== plantId));
    }
  }

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <img
            src="/applogo.png"
            alt="Growza"
            className="h-16 object-contain"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            {showForm ? "Cancel" : "+ Add Plant"}
          </button>
        </div>

        {/* Add Plant Form */}
        {showForm && (
          <form
            onSubmit={handleAddPlant}
            className="bg-white p-6 rounded-xl shadow mb-6 space-y-4"
          >
            <h2 className="font-semibold text-gray-700">Add New Plant</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="name"
                placeholder="Plant name (English)"
                required
                className="border rounded-lg px-3 py-2 text-gray-900"
              />
              <input
                name="nameML"
                placeholder="Plant name (Malayalam)"
                className="border rounded-lg px-3 py-2 text-gray-900"
              />
              <input
                name="scientificName"
                placeholder="Scientific name"
                className="border rounded-lg px-3 py-2 text-gray-900"
              />
              <select
                name="category"
                required
                className="border border-gray-900 rounded-lg px-3 py-2 text-gray-400"
                onChange={(e) =>
                  e.target.classList.replace("text-gray-400", "text-gray-900")
                }
              >
                <option value="" disabled selected className="text-gray-400">
                  Select category
                </option>
                <option value="Indoor" className="text-gray-900">
                  Indoor
                </option>
                <option value="Outdoor" className="text-gray-900">
                  Outdoor
                </option>
                <option value="Aquatic" className="text-gray-900">
                  Aquatic
                </option>
                <option value="Flowering" className="text-gray-900">
                  Flowering
                </option>
                <option value="Medicinal" className="text-gray-900">
                  Medicinal
                </option>
              </select>

              <input
                name="price"
                type="number"
                placeholder="Price (₹)"
                required
                className="border rounded-lg px-3 py-2 text-gray-900"
              />
              <input
                name="stock"
                type="number"
                placeholder="Stock quantity"
                required
                className="border rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <textarea
              name="description"
              placeholder="Description"
              required
              className="w-full border rounded-lg px-3 py-2 text-gray-900"
              rows={3}
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Save Plant
            </button>
          </form>
        )}

        {/* Plant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.length === 0 ? (
            <p className="text-gray-500 col-span-3">
              No plants yet. Add your first plant!
            </p>
          ) : (
            plants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
              >
                {/* Image - top half */}
                <div className="w-full h-48 bg-green-100">
                  {plant.imageUrl ? (
                    <img
                      src={plant.imageUrl}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden",
                        );
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex flex-col items-center justify-center ${plant.imageUrl ? "hidden" : ""}`}
                  >
                    <span className="text-6xl">🌱</span>
                    <p className="text-green-400 text-sm mt-2">No image</p>
                  </div>
                </div>

                {/* Details - bottom half */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-lg">
                    {plant.name}
                  </h3>
                  {plant.nameML && (
                    <p className="text-sm text-gray-500">{plant.nameML}</p>
                  )}
                  {plant.scientificName && (
                    <p className="text-xs text-gray-400 italic mb-2">
                      {plant.scientificName}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-green-600 font-bold text-lg">
                      ₹{plant.price}
                    </p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {plant.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Stock: {plant.stock}
                  </p>
                  <button
                    onClick={() => handleDelete(plant.id)}
                    className="mt-3 w-full text-red-500 border border-red-300 rounded-lg py-1 text-sm hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
