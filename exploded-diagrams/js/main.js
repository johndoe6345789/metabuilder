import { PackageLoader } from './PackageLoader.js';
import { DiagramRenderer } from './DiagramRenderer.js';
import { UIController } from './UIController.js';

class App {
  constructor() {
    this.loader = new PackageLoader();
    this.renderer = null;
    this.ui = null;
    this.currentPath = [];
  }

  async init() {
    this.ui = new UIController(this);
    
    // Parse URL hash for deep linking
    const hash = window.location.hash.slice(1);
    if (hash) {
      this.currentPath = hash.split('/').filter(Boolean);
    }

    await this.navigate(this.currentPath);

    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
      const newPath = window.location.hash.slice(1).split('/').filter(Boolean);
      this.navigate(newPath);
    });
  }

  async navigate(path) {
    this.currentPath = path;
    window.location.hash = path.join('/');

    if (path.length === 0) {
      // Show root - list categories
      await this.showCategories();
    } else if (path.length === 1) {
      // Show manufacturers in category
      await this.showManufacturers(path[0]);
    } else if (path.length === 2) {
      // Show products from manufacturer
      await this.showProducts(path[0], path[1]);
    } else if (path.length === 3) {
      // Show assemblies in product
      await this.showAssemblies(path[0], path[1], path[2]);
    } else if (path.length >= 4) {
      // Load and render assembly
      await this.loadAssembly(path[0], path[1], path[2], path[3]);
    }

    this.ui.updateBreadcrumb(path);
  }

  async showCategories() {
    const categories = await this.loader.getCategories();
    this.ui.showPackageGrid(categories, 'Categories', (cat) => {
      this.navigate([cat.id]);
    });
    this.ui.hideControls();
  }

  async showManufacturers(category) {
    const manufacturers = await this.loader.getManufacturers(category);
    this.ui.showPackageGrid(manufacturers, 'Manufacturers', (mfr) => {
      this.navigate([category, mfr.id]);
    });
    this.ui.hideControls();
  }

  async showProducts(category, manufacturer) {
    const products = await this.loader.getProducts(category, manufacturer);
    this.ui.showPackageGrid(products, 'Products', (prod) => {
      this.navigate([category, manufacturer, prod.id]);
    });
    this.ui.hideControls();
  }

  async showAssemblies(category, manufacturer, product) {
    const pkg = await this.loader.loadProductPackage(category, manufacturer, product);
    this.ui.showPackageGrid(pkg.assemblies.map(a => ({
      id: a,
      name: a.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: 'Assembly'
    })), 'Assemblies', (asm) => {
      this.navigate([category, manufacturer, product, asm.id]);
    });
    this.ui.hideControls();
  }

  async loadAssembly(category, manufacturer, product, assembly) {
    try {
      const data = await this.loader.loadAssembly(category, manufacturer, product, assembly);
      
      this.renderer = new DiagramRenderer(
        document.getElementById('diagram'),
        data,
        this.loader.materials
      );
      
      this.ui.showControls();
      this.ui.showSidebar(data);
      this.renderer.render();
      
      // Wire up UI events
      this.ui.onExplosionChange = (val) => {
        this.renderer.setExplosion(val);
      };
      
      this.ui.onRotationChange = (val) => {
        this.renderer.setRotation(val);
      };
      
      this.ui.onAnimate = () => {
        this.renderer.animate();
      };
      
      this.ui.onExport = () => {
        this.renderer.exportSVG(assembly);
      };

      this.ui.onPartHover = (partId) => {
        this.renderer.highlightPart(partId);
      };

    } catch (err) {
      console.error('Failed to load assembly:', err);
      this.ui.showError(`Failed to load assembly: ${err.message}`);
    }
  }
}

// Boot
const app = new App();
app.init().catch(console.error);
