test('tailwind css is configured correctly', () => {
  // Test that Tailwind CSS configuration is loaded
  const tailwindConfig = require('../tailwind.config.js');
  expect(tailwindConfig).toBeDefined();
  expect(tailwindConfig.content).toContain('./src/**/*.{js,jsx,ts,tsx}');
  

  // Test that PostCSS config exists and includes tailwindcss

  // Test that PostCSS config exists and has correct structure

  const postcssConfig = require('../postcss.config.js');
  expect(postcssConfig).toBeDefined();
  expect(postcssConfig.plugins).toBeDefined();
  expect(postcssConfig.plugins.tailwindcss).toBeDefined();
  expect(postcssConfig.plugins.autoprefixer).toBeDefined();
});