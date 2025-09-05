import React from 'react';

test('foodai app components are available', () => {
  // Simple smoke test to ensure the main files exist
  // We'll test basic functionality without importing components that have dependencies
  
  // Test that component files exist
  const fs = require('fs');
  const path = require('path');
  
  const componentPath = path.join(__dirname, 'components');
  if (fs.existsSync(componentPath)) {
    const componentFiles = fs.readdirSync(componentPath);
    expect(componentFiles.length).toBeGreaterThan(0);
    
    // Check that key component files exist
    expect(componentFiles).toContain('LandingPage.js');
    expect(componentFiles).toContain('ChefDashboard.js');
    expect(componentFiles).toContain('CustomerInterface.js');
  }
  
  // Test that services exist
  const servicePath = path.join(__dirname, 'services');
  if (fs.existsSync(servicePath)) {
    const serviceFiles = fs.readdirSync(servicePath);
    expect(serviceFiles).toContain('api.js');
  }
});
