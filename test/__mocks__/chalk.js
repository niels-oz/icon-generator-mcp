// Mock chalk for tests to avoid ESM import issues
const mockChalk = {
  bold: (text) => text,
  blue: (text) => text,
  green: (text) => text,
  yellow: (text) => text,
  red: (text) => text,
  cyan: (text) => text,
  magenta: (text) => text,
  gray: (text) => text,
  white: (text) => text,
  underline: (text) => text
};

// Add nested properties for chalk.bold.blue etc.
Object.keys(mockChalk).forEach(key => {
  if (typeof mockChalk[key] === 'function') {
    Object.keys(mockChalk).forEach(nestedKey => {
      mockChalk[key][nestedKey] = mockChalk[nestedKey];
    });
  }
});

module.exports = mockChalk;
module.exports.default = mockChalk;