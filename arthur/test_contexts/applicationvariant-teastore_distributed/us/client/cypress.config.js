const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://{{eco_digit_ip_2}}:8080',
    supportFile: false
  },
});

