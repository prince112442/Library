/**
 * Populates the database with sample data for local testing/demos.
 * Run with: npm run seed
 * WARNING: this clears existing data in the affected collections.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const Book = require('../models/Book');
const Settings = require('../models/Settings');

const run = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Book.deleteMany({}),
  ]);

  console.log('Creating settings...');
  await Settings.create({});

  console.log('Creating users...');
  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@library.edu',
    password: 'Admin@123',
    role: 'admin',
  });

  const librarian = await User.create({
    name: 'Jane Librarian',
    email: 'librarian@library.edu',
    password: 'Librarian@123',
    role: 'librarian',
    employeeId: 'LIB-001',
  });

  const student = await User.create({
    name: 'John Student',
    email: 'student@library.edu',
    password: 'Student@123',
    role: 'student',
    studentId: 'STU-2026-001',
    department: 'Computer Science',
    yearLevel: '2nd Year',
  });

  console.log('Creating categories...');
  const categories = await Category.insertMany([
    { name: 'Computer Science', description: 'Programming, algorithms, and software engineering' },
    { name: 'Mathematics', description: 'Pure and applied mathematics' },
    { name: 'Literature', description: 'Fiction and non-fiction literary works' },
    { name: 'Science', description: 'Physics, chemistry, biology' },
    { name: 'History', description: 'World and regional history' },
  ]);

  console.log('Creating books...');
  await Book.insertMany([
    {
      isbn: '978-0132350884',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      publisher: 'Prentice Hall',
      edition: '1st',
      category: categories[0]._id,
      shelfLocation: 'A1-01',
      yearPublished: 2008,
      quantity: 5,
      availableQuantity: 5,
      addedBy: librarian._id,
    },
    {
      isbn: '978-0262033848',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      publisher: 'MIT Press',
      edition: '3rd',
      category: categories[0]._id,
      shelfLocation: 'A1-02',
      yearPublished: 2009,
      quantity: 3,
      availableQuantity: 3,
      addedBy: librarian._id,
    },
    {
      isbn: '978-0201896831',
      title: 'The Art of Computer Programming',
      author: 'Donald Knuth',
      publisher: 'Addison-Wesley',
      edition: '2nd',
      category: categories[1]._id,
      shelfLocation: 'B2-01',
      yearPublished: 1997,
      quantity: 2,
      availableQuantity: 2,
      addedBy: librarian._id,
    },
    {
      isbn: '978-0141439518',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      publisher: 'Penguin Classics',
      edition: '1st',
      category: categories[2]._id,
      shelfLocation: 'C3-01',
      yearPublished: 1813,
      quantity: 4,
      availableQuantity: 4,
      addedBy: librarian._id,
    },
    {
      isbn: '978-0553380163',
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      publisher: 'Bantam',
      edition: '10th Anniversary',
      category: categories[3]._id,
      shelfLocation: 'D4-01',
      yearPublished: 1998,
      quantity: 3,
      availableQuantity: 3,
      addedBy: librarian._id,
    },
  ]);

  console.log('Seed complete.');
  console.log('---');
  console.log('Admin login:     admin@library.edu / Admin@123');
  console.log('Librarian login: librarian@library.edu / Librarian@123');
  console.log('Student login:   student@library.edu / Student@123');
  console.log('---');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
