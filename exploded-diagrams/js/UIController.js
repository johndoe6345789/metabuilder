export class UIController {
  constructor(app) {
    this.app = app;
    this.controlsEl = document.getElementById('controls');
    this.sidebarEl = document.getElementById('sidebar');
    this.breadcrumbEl = document.getElementById('breadcrumb');
    this.diagramContainer = document.querySelector('.diagram-container');
    
    // Callbacks
    this.onExplosionChange = null;
    this.onRotationChange = null;
    this.onAnimate = null;
    this.onExport = null;
    this.onPartHover = null;
  }

  updateBreadcrumb(path) {
    const labels = {
      'rc': 'RC Vehicles',
      'traxxas': 'Traxxas',
      'slash-4x4': 'Slash 4x4',
      'front-shock': 'Front Shock',
      'rear-differential': 'Rear Differential',
      'steering-servo': 'Steering Servo'
    };

    let html = `<a href="#" data-path="">Home</a>`;
    
    path.forEach((segment, i) => {
      const subPath = path.slice(0, i + 1).join('/');
      const label = labels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      
      html += `<span>›</span>`;
      
      if (i === path.length - 1) {
        html += `<span class="current">${label}</span>`;
      } else {
        html += `<a href="#${subPath}" data-path="${subPath}">${label}</a>`;
      }
    });

    this.breadcrumbEl.innerHTML = html;

    // Attach click handlers
    this.breadcrumbEl.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const newPath = a.dataset.path ? a.dataset.path.split('/') : [];
        this.app.navigate(newPath);
      });
    });
  }

  showControls() {
    this.controlsEl.innerHTML = `
      <div class="control-group">
        <label>Explosion: <span id="explosionValue">50</span>%</label>
        <input type="range" id="explosionSlider" min="0" max="100" value="50">
      </div>
      <div class="control-group">
        <label>Rotation: <span id="rotationValue">0</span>°</label>
        <input type="range" id="rotationSlider" min="-25" max="25" value="0">
      </div>
      <div class="control-group">
        <label>&nbsp;</label>
        <button id="animateBtn">▶ Explode</button>
      </div>
      <div class="control-group">
        <label>&nbsp;</label>
        <button id="exportBtn">⬇ Export SVG</button>
      </div>
    `;

    // Wire up events
    document.getElementById('explosionSlider').addEventListener('input', (e) => {
      document.getElementById('explosionValue').textContent = e.target.value;
      if (this.onExplosionChange) this.onExplosionChange(parseInt(e.target.value));
    });

    document.getElementById('rotationSlider').addEventListener('input', (e) => {
      document.getElementById('rotationValue').textContent = e.target.value;
      if (this.onRotationChange) this.onRotationChange(parseInt(e.target.value));
    });

    document.getElementById('animateBtn').addEventListener('click', () => {
      if (this.onAnimate) this.onAnimate();
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
      if (this.onExport) this.onExport();
    });

    this.controlsEl.style.display = 'flex';
    this.diagramContainer.style.display = 'block';
  }

  hideControls() {
    this.controlsEl.style.display = 'none';
    this.diagramContainer.style.display = 'none';
  }

  showSidebar(assembly) {
    const totalParts = assembly.parts.reduce((sum, p) => sum + p.quantity, 0);
    const totalWeight = assembly.parts.reduce((sum, p) => sum + (p.weight * p.quantity), 0);
    
    // Get unique materials
    const materials = [...new Set(assembly.parts.map(p => p.material))];

    this.sidebarEl.innerHTML = `
      <div class="panel">
        <h3>Assembly Stats</h3>
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-value">${assembly.parts.length}</div>
            <div class="stat-label">Unique Parts</div>
          </div>
          <div class="stat">
            <div class="stat-value">${totalWeight < 1000 ? totalWeight.toFixed(0) + 'g' : (totalWeight/1000).toFixed(2) + 'kg'}</div>
            <div class="stat-label">Weight</div>
          </div>
          <div class="stat">
            <div class="stat-value">${assembly.category || '-'}</div>
            <div class="stat-label">Category</div>
          </div>
          <div class="stat">
            <div class="stat-value">${totalParts}</div>
            <div class="stat-label">Total Pieces</div>
          </div>
        </div>
      </div>

      <div class="panel">
        <h3>Parts List</h3>
        <div class="parts-list">
          ${assembly.parts.map(p => `
            <div class="part-item" data-part="${p.id}">
              <span class="name">${p.name}</span>
              <span class="pn">${p.partNumber}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="panel">
        <h3>Materials</h3>
        <div class="legend-grid" id="legend">
          ${materials.map(m => `
            <div class="legend-item">
              <div class="legend-color" style="background: ${this.getMaterialColor(m)}"></div>
              <span>${this.getMaterialName(m)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Attach hover events to parts list
    this.sidebarEl.querySelectorAll('.part-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (this.onPartHover) this.onPartHover(el.dataset.part);
      });
      el.addEventListener('mouseleave', () => {
        if (this.onPartHover) this.onPartHover(null);
      });
    });

    this.sidebarEl.style.display = 'flex';
  }

  getMaterialColor(materialId) {
    const colors = {
      aluminum: '#d0d0d0',
      steel: '#6a6a6a',
      blueAnodized: '#4a90d9',
      redAnodized: '#d94a4a',
      blackPlastic: '#2a2a2a',
      copper: '#b87333',
      titanium: '#8a8a8a',
      brass: '#d4a84a',
      spring: '#d94a4a',
      greenSpring: '#4ad94a'
    };
    return colors[materialId] || '#888';
  }

  getMaterialName(materialId) {
    const names = {
      aluminum: 'Aluminum',
      steel: 'Steel',
      blueAnodized: 'Anodized (Blue)',
      redAnodized: 'Anodized (Red)',
      blackPlastic: 'Composite',
      copper: 'Copper',
      titanium: 'Titanium',
      brass: 'Brass',
      spring: 'Spring Steel',
      greenSpring: 'Spring (Soft)'
    };
    return names[materialId] || materialId;
  }

  showPackageGrid(items, title, onClick) {
    this.sidebarEl.innerHTML = '';
    this.sidebarEl.style.display = 'none';

    // Replace diagram with package browser
    this.diagramContainer.innerHTML = `
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px; font-weight: 400;">${title}</h2>
        <div class="package-grid">
          ${items.map(item => `
            <div class="package-card" data-id="${item.id}">
              <h4>${item.name}</h4>
              <p>${item.description || ''}</p>
              ${item.meta ? `<div class="meta">${item.meta}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.diagramContainer.style.display = 'block';
    this.diagramContainer.style.background = '#fafafa';

    // Attach click handlers
    this.diagramContainer.querySelectorAll('.package-card').forEach(card => {
      card.addEventListener('click', () => {
        const item = items.find(i => i.id === card.dataset.id);
        if (item && onClick) onClick(item);
      });
    });
  }

  showError(message) {
    this.diagramContainer.innerHTML = `
      <div style="padding: 50px; text-align: center;">
        <h3 style="color: #d94a4a; margin-bottom: 10px;">Error</h3>
        <p style="color: #666;">${message}</p>
        <button onclick="location.hash=''" style="margin-top: 20px;">Go Home</button>
      </div>
    `;
    this.diagramContainer.style.display = 'block';
  }
}
