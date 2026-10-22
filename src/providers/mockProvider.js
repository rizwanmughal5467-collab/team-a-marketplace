const ProviderAdapter = require('./adapter');

class MockProvider extends ProviderAdapter {
  async testConnection(config) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ok: true, message: "Mock Connection Successful!", latencyMs: 500 };
  }

  async fetchOrders(config) {
    // Yeh humara nakli data hai jo sync hoga
    return [
      { providerOrderId: "ORD-1001", sku: "PROD-A", qty: 2, status: "completed", amount: 1500 },
      { providerOrderId: "ORD-1002", sku: "PROD-B", qty: 1, status: "pending", amount: 800 },
      { providerOrderId: "ORD-1001", sku: "PROD-A", qty: 2, status: "completed", amount: 1500 } // Yeh duplicate hai, test ke liye
    ];
  }
}

module.exports = new MockProvider();