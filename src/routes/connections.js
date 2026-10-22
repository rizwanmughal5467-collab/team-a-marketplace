const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/auth'); 
const mockProvider = require('../providers/mockProvider');
const { db } = require('../firebase'); // Database import kiya

// 1. GET: Saari connections database se laao
router.get('/', authGuard, async (req, res) => {
  try {
    const snapshot = await db.collection('marketplaceConnections')
                           .where('orgId', '==', req.user.orgId)
                           .get();
    
    const connections = [];
    snapshot.forEach(doc => {
      connections.push({ id: doc.id, ...doc.data() });
    });

    res.json({ message: "Success", data: connections });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST: Nayi connection database mein save karo
router.post('/', authGuard, async (req, res) => {
  const { name, provider, storeId } = req.body;
  
  if (!name || !provider) {
    return res.status(400).json({ error: "Name aur Provider likhna zaroori hai!" });
  }

  try {
    const newConnection = {
      orgId: req.user.orgId,
      name: name,
      provider: provider,
      storeId: storeId || "N/A",
      status: "active",
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('marketplaceConnections').add(newConnection);
    
    res.status(201).json({ 
      message: "Connection Added to Database!", 
      data: { id: docRef.id, ...newConnection } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. DELETE: Connection delete karo
router.delete('/:id', authGuard, async (req, res) => {
  try {
    await db.collection('marketplaceConnections').doc(req.params.id).delete();
    res.json({ message: "Connection Deleted from Database" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. TEST CONNECTION
router.post('/:id/test', authGuard, async (req, res) => {
  try {
    const doc = await db.collection('marketplaceConnections').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "Connection nahi mili" });
    }

    const result = await mockProvider.testConnection(doc.data());
    res.json({ message: "Test Complete", data: result });
  } catch (error) {
    res.status(500).json({ error: "Test fail ho gaya" });
  }
});

module.exports = router;