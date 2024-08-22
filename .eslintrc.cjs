const cfg = {
  ...require('@linzjs/style/.eslintrc.cjs'),
};

const testOverrides = cfg.overrides.find((ovr) => ovr.files.find((f) => f.includes('.test.ts')));
testOverrides.rules['@typescript-eslint/no-floating-promises'] = 'off';

module.exports = cfg;