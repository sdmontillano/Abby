module.exports = {
  hooks: {
    readPackage: (pkg) => {
      if (pkg.name === 'esbuild' || pkg.name === 'sharp') {
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.postinstall = pkg.scripts.postinstall || 'node install.js || true';
      }
      return pkg;
    }
  }
};
