module.exports = {
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.png$': '<rootDir>/src/__mocks__/imageMock.js',
    'getStats\\.js': '<rootDir>/src/__mocks__/getStatsMock.js',
    'utils\\/npm\\.js': '<rootDir>/src/__mocks__/npmMock.js'
  },
  testMatch: ['**/__tests__/*-test.js'],
  testURL: 'http://localhost/'
};
