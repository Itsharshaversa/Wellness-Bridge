import mongoose from "mongoose";
import dotenv from "dotenv";
import Hospital from "../models/Hospital.js";
import Inventory from "../models/Inventory.js";
import User from "../models/User.js";

dotenv.config();

// Real hospitals in Delhi/NCR area (Ghaziabad region)
const hospitals = [
  {
    name: "AIIMS New Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi, 110029",
    location: { lat: 28.5672, lng: 77.2100 },
    contact: { phone: "011-26588500", emergency: "011-26588700", email: "info@aiims.ac.in" },
    type: "government",
    totalBeds: 2478,
    availableBeds: 312,
    icuTotal: 200,
    icuAvailable: 28,
    ambulancesTotal: 15,
    ambulancesAvailable: 8,
    services: ["emergency", "icu", "surgery", "maternity", "pediatrics", "cardiology", "orthopedics", "neurology"],
    rating: 4.8,
  },
  {
    name: "Safdarjung Hospital",
    address: "Ansari Nagar West, New Delhi, 110029",
    location: { lat: 28.5700, lng: 77.2054 },
    contact: { phone: "011-24616500", emergency: "011-24619220" },
    type: "government",
    totalBeds: 1531,
    availableBeds: 89,
    icuTotal: 120,
    icuAvailable: 12,
    ambulancesTotal: 10,
    ambulancesAvailable: 4,
    services: ["emergency", "icu", "surgery", "maternity", "pediatrics", "cardiology"],
    rating: 4.2,
  },
  {
    name: "Max Super Speciality Hospital Vaishali",
    address: "W-3, Sector 1, Vaishali, Ghaziabad, UP 201012",
    location: { lat: 28.6453, lng: 77.3375 },
    contact: { phone: "0120-4182000", emergency: "0120-4182200" },
    type: "private",
    totalBeds: 350,
    availableBeds: 47,
    icuTotal: 60,
    icuAvailable: 9,
    ambulancesTotal: 8,
    ambulancesAvailable: 5,
    services: ["emergency", "icu", "surgery", "cardiology", "orthopedics", "neurology"],
    rating: 4.6,
  },
  {
    name: "Fortis Hospital Noida",
    address: "B-22, Sector 62, Noida, UP 201301",
    location: { lat: 28.6270, lng: 77.3770 },
    contact: { phone: "0120-4677777", emergency: "0120-4677700" },
    type: "private",
    totalBeds: 260,
    availableBeds: 31,
    icuTotal: 50,
    icuAvailable: 7,
    ambulancesTotal: 6,
    ambulancesAvailable: 3,
    services: ["emergency", "icu", "surgery", "cardiology", "pediatrics"],
    rating: 4.5,
  },
  {
    name: "Yashoda Super Speciality Hospital",
    address: "NH-9, Near CISF Camp, Kaushambi, Ghaziabad, UP 201010",
    location: { lat: 28.6469, lng: 77.3181 },
    contact: { phone: "0120-4352222", emergency: "0120-4352200" },
    type: "private",
    totalBeds: 400,
    availableBeds: 68,
    icuTotal: 80,
    icuAvailable: 15,
    ambulancesTotal: 10,
    ambulancesAvailable: 7,
    services: ["emergency", "icu", "surgery", "maternity", "pediatrics", "cardiology", "orthopedics"],
    rating: 4.4,
  },
  {
    name: "GTB Hospital Dilshad Garden",
    address: "GTB Hospital Road, Dilshad Garden, Delhi, 110095",
    location: { lat: 28.6854, lng: 77.3101 },
    contact: { phone: "011-22582013", emergency: "011-22582000" },
    type: "government",
    totalBeds: 1500,
    availableBeds: 204,
    icuTotal: 100,
    icuAvailable: 18,
    ambulancesTotal: 12,
    ambulancesAvailable: 6,
    services: ["emergency", "icu", "surgery", "maternity", "pediatrics"],
    rating: 3.9,
  },
  {
    name: "Columbia Asia Hospital Ghaziabad",
    address: "NH-58, Mohan Nagar, Ghaziabad, UP 201007",
    location: { lat: 28.6866, lng: 77.4203 },
    contact: { phone: "0120-3988888", emergency: "0120-3988900" },
    type: "private",
    totalBeds: 150,
    availableBeds: 22,
    icuTotal: 30,
    icuAvailable: 4,
    ambulancesTotal: 4,
    ambulancesAvailable: 2,
    services: ["emergency", "icu", "surgery", "maternity"],
    rating: 4.3,
  },
  {
    name: "ESIC Hospital Noida",
    address: "Sector 24, Noida, UP 201301",
    location: { lat: 28.5731, lng: 77.3363 },
    contact: { phone: "0120-2412000", emergency: "0120-2412100" },
    type: "government",
    totalBeds: 300,
    availableBeds: 55,
    icuTotal: 40,
    icuAvailable: 8,
    ambulancesTotal: 5,
    ambulancesAvailable: 3,
    services: ["emergency", "icu", "surgery", "maternity", "pediatrics"],
    rating: 3.7,
  },
];

const generateBeds = (totalBeds, availableBeds) => {
  const beds = [];
  const types = ["general", "icu", "emergency", "pediatric", "maternity"];
  let availableCount = availableBeds;

  for (let i = 0; i < Math.min(totalBeds, 50); i++) {
    const type = types[i % types.length];
    const isAvailable = availableCount > 0 && Math.random() > 0.4;
    if (isAvailable) availableCount--;

    beds.push({
      id: `BED-${String(i + 1).padStart(3, "0")}`,
      type,
      status: isAvailable ? "available" : (Math.random() > 0.9 ? "maintenance" : "occupied"),
      ward: `Ward ${Math.ceil((i + 1) / 10)}`,
    });
  }
  return beds;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📦 Connected to MongoDB for seeding...");

    // Clear existing data
    await Hospital.deleteMany({});
    await Inventory.deleteMany({});
    console.log("🗑️  Cleared existing hospitals and inventory");

    // Insert hospitals
    for (const hData of hospitals) {
      const hospital = await Hospital.create({
        ...hData,
        beds: generateBeds(hData.totalBeds, hData.availableBeds),
        lastUpdated: new Date(),
      });

      // Create inventory for each hospital
      await Inventory.create({
        hospital: hospital._id,
        oxygenLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
        ventilators: Math.floor(hospital.icuTotal * 0.8),
        ventilatorsAvailable: Math.floor(hospital.icuAvailable * 0.7),
        bloodUnits: {
          A_pos: Math.floor(Math.random() * 50) + 10,
          A_neg: Math.floor(Math.random() * 20) + 5,
          B_pos: Math.floor(Math.random() * 40) + 10,
          B_neg: Math.floor(Math.random() * 15) + 3,
          O_pos: Math.floor(Math.random() * 60) + 20,
          O_neg: Math.floor(Math.random() * 25) + 5,
          AB_pos: Math.floor(Math.random() * 20) + 5,
          AB_neg: Math.floor(Math.random() * 10) + 2,
        },
        items: [
          { name: "Paracetamol 500mg", category: "medicine", quantity: Math.floor(Math.random() * 5000) + 1000, unit: "tablets", minThreshold: 500 },
          { name: "Surgical Masks", category: "ppe", quantity: Math.floor(Math.random() * 2000) + 500, unit: "pieces", minThreshold: 200 },
          { name: "IV Saline 500ml", category: "medicine", quantity: Math.floor(Math.random() * 500) + 100, unit: "bags", minThreshold: 50 },
          { name: "Syringes 10ml", category: "consumables", quantity: Math.floor(Math.random() * 3000) + 500, unit: "pieces", minThreshold: 300 },
          { name: "Oxygen Cylinders", category: "oxygen", quantity: Math.floor(Math.random() * 100) + 20, unit: "cylinders", minThreshold: 15 },
          { name: "ECG Machine", category: "equipment", quantity: Math.floor(Math.random() * 10) + 2, unit: "units", minThreshold: 1 },
          { name: "Pulse Oximeter", category: "equipment", quantity: Math.floor(Math.random() * 30) + 10, unit: "units", minThreshold: 5 },
        ],
      });

      console.log(`✅ Seeded: ${hospital.name}`);
    }

    // Create admin user (you'll need to update googleId after first login)
    const adminExists = await User.findOne({ email: "admin@healthcare.com" });
    if (!adminExists) {
      await User.create({
        googleId: "PLACEHOLDER_ADMIN_GOOGLE_ID",
        name: "Healthcare Admin",
        email: "admin@healthcare.com",
        role: "admin",
      });
      console.log("✅ Admin user created (update googleId after first Google login)");
    }

    console.log("\n🎉 Database seeded successfully!");
    console.log(`📊 Inserted ${hospitals.length} hospitals with inventory`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();
