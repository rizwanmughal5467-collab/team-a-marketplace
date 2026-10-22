const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/auth');
const mockProvider = require('../providers/mockProvider');
const { db } = require('../firebase');

// 1. MANUAL SYNC TRIGGER
router.post('/connections/:id/sync', authGuard, async (req, res) => {
  const connectionId = req.params.id;
  const orgId = req.user.orgId;

  try {
    // Check connection
    const connDoc = await db.collection('marketplaceConnections').doc(connectionId).get();
    if (!connDoc.exists || connDoc.data().orgId !== orgId) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Duplicate-run protection (Check agar pehle se koi sync chal raha hai)
    const runningJobs = await db.collection('marketplaceSyncJobs')
      .where('connectionId', '==', connectionId)
      .where('status', '==', 'running')
      .get();
    if (!runningJobs.empty) {
      return res.status(409).json({ error: 'Sync already in progress' });
    }

    // Job Record banao
    const jobRef = await db.collection('marketplaceSyncJobs').add({
      orgId,
      connectionId,
      status: 'running',
      startedAt: new Date().toISOString(),
      processedCount: 0,
      skippedCount: 0,
      errorMessage: null
    });

    // Data fetch karo
    const orders = await mockProvider.fetchOrders();
    let processed = 0;
    let skipped = 0;

    for (const order of orders) {
      // Duplicate check
      const existingRecord = await db.collection('marketplaceSyncRecords')
        .where('connectionId', '==', connectionId)
        .where('providerOrderId', '==', order.providerOrderId)
        .get();

      if (!existingRecord.empty) {
        skipped++; // Agar pehle se hai toh skip karo
      } else {
        // Naya record save karo
        await db.collection('marketplaceSyncRecords').add({
          orgId,
          connectionId,
          providerOrderId: order.providerOrderId,
          sku: order.sku,
          qty: order.qty,
          status: order.status,
          amount: order.amount,
          syncedAt: new Date().toISOString()
        });
        processed++;
      }
    }

    // Job ko complete karo
    await jobRef.update({
      status: 'completed',
      finishedAt: new Date().toISOString(),
      processedCount: processed,
      skippedCount: skipped
    });

    res.json({
      message: 'Sync completed successfully',
      jobId: jobRef.id,
      processed,
      skipped
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sync failed: ' + error.message });
  }
});

// 2. SYNC HISTORY (Job History)
router.get('/connections/:id/jobs', authGuard, async (req, res) => {
  const connectionId = req.params.id;
  const orgId = req.user.orgId;

  try {
    const jobsSnapshot = await db.collection('marketplaceSyncJobs')
      .where('connectionId', '==', connectionId)
      .where('orgId', '==', orgId)
      .orderBy('startedAt', 'desc')
      .limit(20)
      .get();

    const jobs = [];
    jobsSnapshot.forEach(doc => {
      jobs.push({ id: doc.id, ...doc.data() });
    });

    res.json({ message: 'Success', data: jobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;