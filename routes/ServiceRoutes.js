const express = require('express');
const router = express.Router();
const Service = require('../models/ServiceSchema');
const { authenticate, authorizeRole } = require('../middleware/Auth');

// POST: Add a new service (admin-only)
router.post('/', authenticate, authorizeRole('admin'), async (req, res) => {
  const { name, description, category, price } = req.body;

  try {
    const newService = new Service({ name, description, category, price });
    await newService.save();
    res.status(201).json({ message: 'Service added successfully', service: newService });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Update a specific service (admin-only)
router.put('/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  const { name, description, category, price } = req.body;
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    service.name = name || service.name;
    service.description = description || service.description;
    service.category = category || service.category;
    service.price = price || service.price;
    await service.save();
    res.json({ message: 'Service updated successfully', service });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Delete a specific service (admin-only)
router.delete('/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Show services by category
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const services = await Service.find({ category });
    res.json(services);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST: Search for services by name or description
router.post('/search', async (req, res) => {
  const { query } = req.body;
  try {
    const services = await Service.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(services);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Show the most popular services (based on rating or reviews)
router.get('/popular', async (req, res) => {
  try {
    const services = await Service.find().sort({ rating: -1 }).limit(5); // Modify as needed
    res.json(services);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST: Add a discount to a service (admin-only)
router.post('/discount', authenticate, authorizeRole('admin'), async (req, res) => {
  const { serviceId, discount } = req.body;
  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    service.discount = discount;
    await service.save();
    res.json({ message: 'Discount added to service', service });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Show all services with active discounts
router.get('/discounted', async (req, res) => {
  try {
    const services = await Service.find({ discount: { $gt: 0 } });
    res.json(services);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST: Update availability for a specific service (admin-only)
router.post('/availability/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  const { availability } = req.body;
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    service.availability = availability;
    await service.save();
    res.json({ message: 'Service availability updated', service });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Show services with active availability
router.get('/available', async (req, res) => {
  try {
    const services = await Service.find({ availability: true });
    res.json(services);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Update the average rating for a service
router.put('/rating/:id', async (req, res) => {
  const { rating } = req.body;
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    service.rating = rating;  // You may want to calculate average based on reviews
    await service.save();
    res.json({ message: 'Service rating updated', service });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// GET: Show reviews for a specific service
router.get('/reviews/:id', async (req, res) => {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.json(service.reviews);  // Simply return the array of reviews (comments)
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  //Post reviews for service
  router.post('/reviews/:id', authenticate, async (req, res) => {
    const { comment } = req.body;  // Just a comment (no rating or user)
  
    try {
      const service = await Service.findById(req.params.id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
  
      service.reviews.push(comment);  // Add the comment to the reviews array
      await service.save();
  
      res.status(201).json({ message: 'Review added successfully', service });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  //Delete reviews for specific service
  router.delete('/reviews/:id', authenticate, authorizeRole('admin'), async (req, res) => {
    const { comment } = req.body;  // The comment to be deleted
  
    try {
      const service = await Service.findById(req.params.id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
  
      const reviewIndex = service.reviews.indexOf(comment);
      if (reviewIndex === -1) {
        return res.status(404).json({ error: 'Review not found' });
      }
  
      service.reviews.splice(reviewIndex, 1);  // Remove the comment
      await service.save();
  
      res.json({ message: 'Review deleted successfully', service });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  

module.exports = router;
