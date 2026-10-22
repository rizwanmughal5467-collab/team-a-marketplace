class ProviderAdapter {
  async testConnection(config) {
    throw new Error('testConnection method implement nahi hua hai');
  }
}

module.exports = ProviderAdapter;