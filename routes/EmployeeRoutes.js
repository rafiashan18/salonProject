const express = require('express');
const Employee = require('../models/EmployeeSchema');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/Auth');


router.post('/', authenticate, authorizeRole('admin'), async (req, res) => {
    console.log('Request Body:', req.body);
  
    try {
      const { name, email, phone, role, availability, schedule, reviews, tasks } = req.body;
  
      // Validate required fields
      if (!name || !email || !role) {
        return res.status(400).json({ message: 'Name, email, and role are required.' });
      }
  
      // Create a new Employee instance
      const newEmployee = new Employee({
        name,
        email,
        phone,
        role,
        availability,
        schedule,
        reviews: reviews || [], // If reviews are provided, use them; otherwise, initialize as empty array
        tasks: tasks || [] // If tasks are provided, use them; otherwise, initialize as empty array
      });
  
      // Save the employee to the database
      const savedEmployee = await newEmployee.save();
  
      // Respond with the created employee
      res.status(201).json(savedEmployee);
    } catch (error) {
      console.error('Error:', error.message);
  
      // Handle unique email constraint or other validation issues
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Email already exists.' });
      }
  
      res.status(400).json({ message: error.message });
    }
  });
  

//get Employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/available', async (req, res) => {
    try {
      const availableEmployees = await Employee.find({ availability: true });
      res.status(200).json(availableEmployees);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

// Show details of a specific employee
router.get('/:id', async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

//Update details of a specific employee (admin-only)
router.put('/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Similarly update other routes that used isAdmin
router.post('/mark-available/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    employee.availability = true;
    await employee.save();
    res.status(200).json({ message: 'Employee marked as available' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/assign-task', async (req, res) => {
    const { employeeId, task } = req.body;

    try {
        const employee = await Employee.findById(employeeId);
        console.log('Employee:', employee); // Debugging log

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        if (!employee.tasks) {
            employee.tasks = []; // Ensure tasks array exists
        }

        employee.tasks.push(task); // Add the task
        await employee.save();

        res.status(200).json({ message: 'Task assigned successfully', employee });
    } catch (error) {
        console.error('Error:', error); // Log the error
        res.status(500).json({ message: 'Error assigning task', error: error.message });
    }
});

// 7. Show tasks assigned to a specific employee
router.get('/tasks/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee.tasks); // Assuming tasks are stored in an array
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


  
// Existing routes remain the same, but update admin-only routes:
router.post('/mark-available/:id', authenticate, authorizeRole('admin'), async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
  
      employee.availability = true;
      await employee.save();
      res.status(200).json({ message: 'Employee marked as available' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  router.post('/mark-unavailable/:id', authenticate, authorizeRole('admin'), async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
  
      employee.availability = false;
      await employee.save();
      res.status(200).json({ message: 'Employee marked as unavailable' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  

// 11. Show the average rating for an employee
router.get('/rating/:id', async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
  
      // If no reviews, return 0, otherwise return the first review's rating
      const averageRating = employee.reviews && employee.reviews.length > 0
        ? employee.reviews[0].rating
        : 0;
  
      res.status(200).json({ averageRating });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

// 12. Submit a review for an employee
router.post('/review/:id', async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const newReview = { rating, comment };
    employee.reviews.push(newReview);
    await employee.save();
    res.status(200).json({ message: 'Review submitted successfully', employee });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 13. Set the schedule for an employee (admin-only)
router.post('/schedule/:id', authenticate, authorizeRole('admin'), async (req, res) => {
    const { schedule } = req.body;
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
  
      employee.schedule = schedule;
      await employee.save();
      res.status(200).json({ message: 'Employee schedule updated' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

// 14. Show the schedule of a specific employee
router.get('/schedule/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee.schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 15. Search employees by name or skill
router.post('/search', async (req, res) => {
  const { searchTerm } = req.body;
  try {
    const employees = await Employee.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { role: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
