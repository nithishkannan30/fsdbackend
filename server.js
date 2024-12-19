const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const validator = require('validator');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');  

const app = express();
const prisma = new PrismaClient(); 
// kdslkl
app.use(cors());
app.use(bodyParser.json());

app.get('/test-connection', async (req, res) => {
  try {
    await prisma.$connect();
    res.status(200).send('Database connected successfully');
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).send('Failed to connect to database');
  }
});



app.post("https://fsdbackend-o5ge.onrender.com/api/employees", async (req, res) => {
  const { name, email, phoneNumber, department, dateOfJoining, role } = req.body;

  if (!name || !email || !phoneNumber || !department || !dateOfJoining || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: email },
          { phoneNumber: phoneNumber }
        ]
      }
    });

    if (existingEmployee) {
      return res.status(409).json({ error: 'Email or Phone already exists.' });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        phoneNumber,
        department,
        dateOfJoining: new Date(dateOfJoining),
        role
      }
    });

    res.status(201).json({ message: 'Employee added successfully!', employee });

  } catch (err) {
    console.error('Error inserting employee:', err);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

app.get('https://fsdbackend-o5ge.onrender.com/api/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
