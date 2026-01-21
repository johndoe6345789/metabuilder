export class PackageLoader {
  constructor(basePath = 'packages') {
    this.basePath = basePath;
    this.cache = new Map();
    this.materials = null;
  }

  async fetchJSON(path) {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status}`);
    }

    const data = await response.json();
    this.cache.set(path, data);
    return data;
  }

  async getCategories() {
    const index = await this.fetchJSON(`${this.basePath}/index.json`);
    return index.categories;
  }

  async getManufacturers(category) {
    const index = await this.fetchJSON(`${this.basePath}/${category}/index.json`);
    return index.manufacturers;
  }

  async getProducts(category, manufacturer) {
    const index = await this.fetchJSON(`${this.basePath}/${category}/${manufacturer}/index.json`);
    return index.products;
  }

  async loadProductPackage(category, manufacturer, product) {
    const pkgPath = `${this.basePath}/${category}/${manufacturer}/${product}`;
    return await this.fetchJSON(`${pkgPath}/package.json`);
  }

  async loadAssembly(category, manufacturer, product, assembly) {
    const basePath = `${this.basePath}/${category}/${manufacturer}/${product}/${assembly}`;
    
    // Load assembly manifest
    const manifest = await this.fetchJSON(`${basePath}/assembly.json`);
    
    // Load shared materials if not already loaded
    if (!this.materials) {
      this.materials = await this.fetchJSON(`${this.basePath}/materials.json`);
    }

    // Load each part
    const parts = await Promise.all(
      manifest.parts.map(async (partRef) => {
        const partData = await this.fetchJSON(`${basePath}/parts/${partRef}.json`);
        return partData;
      })
    );

    return {
      ...manifest,
      parts
    };
  }

  async loadPart(category, manufacturer, product, assembly, partId) {
    const path = `${this.basePath}/${category}/${manufacturer}/${product}/${assembly}/parts/${partId}.json`;
    return await this.fetchJSON(path);
  }
}
