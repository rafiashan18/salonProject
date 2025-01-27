const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/Auth');
const Cart=require('../models/CartSchema')
// Routes
// Add a service to the cart
router.post('/add', authenticate, async (req, res) => {
  const { serviceId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const itemIndex = cart.items.findIndex(item => item.service.toString() === serviceId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({ service: serviceId, quantity: quantity || 1 });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Show all items in the cart
router.get('/', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.service');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update the quantity of a specific service in the cart
router.put('/update/:serviceId', authenticate, async (req, res) => {
  const { serviceId } = req.params;
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.service.toString() === serviceId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ error: 'Service not found in cart' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a specific service from the cart
router.delete('/remove/:serviceId', authenticate, async (req, res) => {
  const { serviceId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(item => item.service.toString() !== serviceId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Clear the cart
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = [];
    cart.discountCode = null;
    cart.discountAmount = 0;
    await cart.save();
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get the total cost of items in the cart
router.get('/total', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.service');
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const totalCost = cart.items.reduce((total, item) => {
      return total + (item.service.price * item.quantity); // Assuming `price` exists in the Service schema
    }, 0);

    cart.totalCost = totalCost - cart.discountAmount;
    await cart.save();
    res.json({ totalCost: cart.totalCost });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Apply a discount code
router.post('/apply-discount', authenticate, async (req, res) => {
  const { discountCode } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    if (discountCode === 'SAVE10') {
      cart.discountAmount = 10;
      cart.discountCode = discountCode;
    } else {
      return res.status(400).json({ error: 'Invalid discount code' });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Check availability of services in the cart
router.get('/check-availability', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.service');
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const unavailableServices = cart.items.filter(item => !item.service.isAvailable); // Assuming `isAvailable` exists in the Service schema
    if (unavailableServices.length > 0) {
      return res.json({ available: false, unavailableServices });
    }

    res.json({ available: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
