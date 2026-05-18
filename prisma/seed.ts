import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.user.deleteMany();
  // Create a seller
  const hashedPassword = await bcrypt.hash("password123", 10);
  const seller = await prisma.user.create({
    data: {
      name: "Ravi Kumar",
      email: "ravi@growza.com",
      password: hashedPassword,
      role: "SELLER",
      phone: "9876543210",
      address: "Kerala, India",
    },
  });

  // Create a buyer
  const buyer = await prisma.user.create({
    data: {
      name: "Priya Nair",
      email: "priya@growza.com",
      password: hashedPassword,
      role: "BUYER",
      phone: "9123456789",
      address: "Kochi, Kerala",
    },
  });

  // Create sample plants
  await prisma.plant.createMany({
  data: [
    {
      name: "Money Plant",
      nameML: "മണി പ്ലാന്റ്",
      scientificName: "Epipremnum aureum",
      description: "Easy to grow, perfect for home",
      price: 120,
      stock: 50,
      category: "Indoor",
      sellerId: seller.id,
      imageUrl: "https://via.placeholder.com/300",
    },
    {
      name: "Aloe Vera",
      nameML: "കറ്റാർവാഴ",
      scientificName: "Aloe barbadensis miller",
      description: "Medicinal plant, great for skin",
      price: 80,
      stock: 30,
      category: "Medicinal",
      sellerId: seller.id,
      imageUrl: "https://via.placeholder.com/300",
    },
    {
      name: "Rose Plant",
      nameML: "റോസ് ചെടി",
      scientificName: "Rosa",
      description: "Beautiful red roses for your garden",
      price: 200,
      stock: 20,
      category: "Outdoor",
      sellerId: seller.id,
      imageUrl: "https://via.placeholder.com/300",
    },
  ],
});

  console.log("✅ Growza database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });