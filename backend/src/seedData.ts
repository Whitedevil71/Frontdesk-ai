import mongoose from 'mongoose';
import dotenv from 'dotenv';
import KnowledgeItem from './models/KnowledgeItem';

dotenv.config();

const sampleKnowledgeItems = [
  {
    question: "What are your hours?",
    answer: "We're open Monday through Friday from 9 AM to 7 PM, Saturday from 9 AM to 6 PM, and Sunday from 10 AM to 5 PM.",
    category: "Hours",
    confidence: 0.9
  },
  {
    question: "Do you do keratin treatments?",
    answer: "Yes, we offer professional keratin treatments! Our keratin smoothing service reduces frizz and makes hair more manageable. The treatment takes about 2-3 hours and lasts 3-4 months. Prices start at $200.",
    category: "Services",
    confidence: 0.95
  },
  {
    question: "How much is a haircut?",
    answer: "Our haircut prices vary by stylist level: Junior stylists start at $45, Senior stylists at $65, and Master stylists at $85. All cuts include a wash and style.",
    category: "Pricing",
    confidence: 0.9
  },
  {
    question: "Do you take walk-ins?",
    answer: "We accept walk-ins when possible, but we highly recommend booking an appointment to guarantee your preferred time and stylist. You can book online or call us at (555) 123-4567.",
    category: "Appointments",
    confidence: 0.85
  },
  {
    question: "What hair color services do you offer?",
    answer: "We offer full color services including single process color, highlights, lowlights, balayage, ombre, color correction, and gray coverage. Consultations are complimentary.",
    category: "Services",
    confidence: 0.9
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/frontdesk');
    console.log('Connected to MongoDB');

    // Clear existing knowledge items
    await KnowledgeItem.deleteMany({});
    console.log('Cleared existing knowledge items');

    // Insert sample data
    await KnowledgeItem.insertMany(sampleKnowledgeItems);
    console.log('Inserted sample knowledge items');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();