export class DiagramRenderer {
  constructor(svgElement, assemblyData, materials) {
    this.svg = svgElement;
    this.assembly = assemblyData;
    this.materials = materials;
    this.explosion = 50;
    this.rotation = 0;
    this.highlightedPart = null;
    this.animating = false;
    this.gradientIds = {};
  }

  createDefs() {
    let defs = '<defs>';
    
    // Create gradients from materials
    Object.entries(this.materials).forEach(([id, mat]) => {
      const gradId = `grad-${id}`;
      this.gradientIds[id] = gradId;
      const g = mat.gradient;
      const angle = g.angle || 0;
      const rad = angle * Math.PI / 180;
      const x2 = Math.round(50 + Math.cos(rad) * 50);
      const y2 = Math.round(50 + Math.sin(rad) * 50);
      
      defs += `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%">`;
      g.stops.forEach(s => {
        defs += `<stop offset="${s.offset}%" stop-color="${s.color}"/>`;
      });
      defs += '</linearGradient>';
    });

    // Filters
    defs += `
      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" flood-opacity="0.2"/>
      </filter>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feFlood flood-color="#00d4ff" flood-opacity="0.6"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    `;
    
    defs += '</defs>';
    return defs;
  }

  getFill(geo, partMaterial) {
    if (geo.fill) return geo.fill;
    const mat = geo.material || partMaterial;
    return mat ? `url(#grad-${mat})` : '#888';
  }

  renderGeometry(geo, cx, cy, partMaterial) {
    const ox = geo.offsetX || 0;
    const oy = geo.offsetY || 0;
    const x = cx + ox;
    const y = cy + oy;
    const fill = this.getFill(geo, partMaterial);
    const opacity = geo.opacity !== undefined ? `opacity="${geo.opacity}"` : '';

    switch (geo.type) {
      case 'circle':
        return `<circle cx="${x}" cy="${y}" r="${geo.r}" fill="${fill}" ${opacity}/>`;

      case 'ellipse':
        return `<ellipse cx="${x}" cy="${y}" rx="${geo.rx}" ry="${geo.ry}" fill="${fill}" ${opacity}/>`;

      case 'rect': {
        const rx = geo.rx || 0;
        return `<rect x="${x - geo.width/2}" y="${y - geo.height/2}" width="${geo.width}" height="${geo.height}" rx="${rx}" fill="${fill}" ${opacity}/>`;
      }

      case 'line':
        return `<line x1="${x + geo.x1}" y1="${y + geo.y1}" x2="${x + geo.x2}" y2="${y + geo.y2}" stroke="${geo.stroke}" stroke-width="${geo.strokeWidth}"/>`;

      case 'polygon': {
        const pts = [];
        for (let i = 0; i < geo.points.length; i += 2) {
          pts.push(`${x + geo.points[i]},${y + geo.points[i+1]}`);
        }
        const strokeAttr = geo.stroke ? `stroke="${geo.stroke}" stroke-width="${geo.strokeWidth || 1}"` : '';
        const fillAttr = geo.fill === 'none' ? 'fill="none"' : `fill="${fill}"`;
        return `<polygon points="${pts.join(' ')}" ${fillAttr} ${strokeAttr}/>`;
      }

      case 'cylinder': {
        const { rx, ry, height } = geo;
        const topY = y - height/2;
        const botY = y + height/2;
        return `
          <ellipse cx="${x}" cy="${topY}" rx="${rx}" ry="${ry}" fill="${fill}"/>
          <rect x="${x - rx}" y="${topY}" width="${rx * 2}" height="${height}" fill="${fill}"/>
          <ellipse cx="${x}" cy="${botY}" rx="${rx}" ry="${ry}" fill="${fill}"/>
        `;
      }

      case 'cone': {
        const { topRx, topRy, bottomRx, bottomRy, height } = geo;
        const topY = y - height/2;
        const botY = y + height/2;
        return `
          <ellipse cx="${x}" cy="${topY}" rx="${topRx}" ry="${topRy}" fill="${fill}"/>
          <path d="M${x - topRx},${topY} L${x - bottomRx},${botY} L${x + bottomRx},${botY} L${x + topRx},${topY} Z" fill="${fill}"/>
          <ellipse cx="${x}" cy="${botY}" rx="${bottomRx}" ry="${bottomRy}" fill="${fill}"/>
        `;
      }

      case 'coilSpring': {
        const { coils, rx, ry, pitch, strokeWidth } = geo;
        let svg = '';
        for (let i = 0; i < coils; i++) {
          const cy2 = y + i * pitch;
          svg += `<ellipse cx="${x}" cy="${cy2}" rx="${rx}" ry="${ry}" fill="none" stroke="${fill}" stroke-width="${strokeWidth}"/>`;
        }
        return svg;
      }

      case 'gearRing': {
        const { teeth, outerRadius, toothHeight } = geo;
        let svg = '';
        for (let i = 0; i < teeth; i++) {
          const angle = (i / teeth) * Math.PI * 2;
          const tx = x + Math.cos(angle) * outerRadius;
          const ty = y + Math.sin(angle) * (outerRadius * 0.35);
          const rot = (i / teeth) * 360;
          svg += `<rect x="${tx - 3}" y="${ty - toothHeight/2}" width="6" height="${toothHeight}" fill="${fill}" transform="rotate(${rot}, ${tx}, ${ty})"/>`;
        }
        return svg;
      }

      case 'radialRects': {
        const { count, radius, width, height, offsetY: oy2 = 0 } = geo;
        const rectFill = geo.material ? `url(#grad-${geo.material})` : (geo.fill || fill);
        let svg = '';
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const rx2 = x + Math.cos(angle) * radius;
          svg += `<rect x="${rx2 - width/2}" y="${y + oy2}" width="${width}" height="${height}" fill="${rectFill}" rx="1"/>`;
        }
        return svg;
      }

      case 'radialBlades': {
        const { count, radius, width, height, curve = 0, offsetY: oy2 = 0 } = geo;
        let svg = '';
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const bx = x + Math.cos(angle) * radius;
          const rot = (i / count) * 360 + curve;
          svg += `<rect x="${bx - width/2}" y="${y + oy2}" width="${width}" height="${height}" fill="${fill}" rx="2" transform="rotate(${rot}, ${bx}, ${y + oy2 + height/2})"/>`;
        }
        return svg;
      }

      case 'text':
        return `<text x="${x}" y="${y}" text-anchor="middle" fill="${geo.fill || '#333'}" font-size="${geo.fontSize || 10}" font-family="${geo.fontFamily || 'monospace'}">${geo.content}</text>`;

      default:
        console.warn(`Unknown geometry type: ${geo.type}`);
        return '';
    }
  }

  render() {
    const { assembly } = this;
    const centerX = 350;
    const baseOffset = 90;
    const maxExplosion = 70;
    const explosionFactor = this.explosion / 100;

    let svg = this.createDefs();

    // Background
    svg += `<rect width="900" height="750" fill="#fafafa"/>`;

    // Title
    svg += `
      <text x="350" y="35" text-anchor="middle" font-family="Arial Black" font-size="18" fill="#1a1a1a">
        ${assembly.name.toUpperCase()}
      </text>
      <text x="350" y="52" text-anchor="middle" font-family="Arial" font-size="10" fill="#888">
        ${assembly.description || ''}
      </text>
      <line x1="150" y1="65" x2="550" y2="65" stroke="#e0e0e0" stroke-width="1.5"/>
    `;

    // Axis line
    svg += `<line x1="${centerX}" y1="80" x2="${centerX}" y2="720" stroke="#ddd" stroke-width="1" stroke-dasharray="6,3"/>`;

    // Render parts
    assembly.parts.forEach((part, index) => {
      const explosionOffset = index * maxExplosion * explosionFactor;
      const baseY = baseOffset + part.baseY * 0.7 + explosionOffset;

      const isHighlighted = this.highlightedPart === part.id;
      const filter = isHighlighted ? 'url(#glow)' : 'url(#dropShadow)';
      const transform = this.rotation !== 0 ? `transform="rotate(${this.rotation}, ${centerX}, ${baseY})"` : '';

      svg += `<g class="part" data-part="${part.id}" filter="${filter}" ${transform} style="cursor:pointer">`;

      part.geometry.forEach(geo => {
        svg += this.renderGeometry(geo, centerX, baseY, part.material);
      });

      svg += '</g>';

      // Leader line and label
      const side = index % 2 === 0 ? 1 : -1;
      const labelX = centerX + side * 160;
      const lineStartX = centerX + side * 50;

      svg += `
        <line x1="${lineStartX}" y1="${baseY}" x2="${labelX - side * 8}" y2="${baseY}" stroke="#888" stroke-width="0.6"/>
        <circle cx="${labelX - side * 8}" cy="${baseY}" r="2.5" fill="#888"/>
        <text x="${labelX}" y="${baseY - 3}" text-anchor="${side === 1 ? 'start' : 'end'}" font-family="Arial" font-size="10" font-weight="bold" fill="#333">${part.name}</text>
        <text x="${labelX}" y="${baseY + 9}" text-anchor="${side === 1 ? 'start' : 'end'}" font-family="monospace" font-size="8" fill="#777">${part.partNumber}</text>
      `;
    });

    // Footer
    const totalWeight = assembly.parts.reduce((sum, p) => sum + (p.weight * p.quantity), 0);
    svg += `
      <text x="20" y="735" font-family="Arial" font-size="8" fill="#aaa">
        ${assembly.parts.length} unique parts • ${totalWeight.toFixed(1)}g total weight
      </text>
    `;

    this.svg.innerHTML = svg;
    this.attachListeners();
  }

  attachListeners() {
    const tooltip = document.getElementById('tooltip');

    this.svg.querySelectorAll('.part').forEach(el => {
      const partId = el.dataset.part;
      const part = this.assembly.parts.find(p => p.id === partId);

      el.addEventListener('mouseenter', (e) => {
        this.highlightPart(partId);
        
        if (part) {
          const mat = this.materials[part.material];
          tooltip.innerHTML = `
            <h4>${part.name}</h4>
            <div class="details">
              <div>${part.partNumber} × ${part.quantity}</div>
              <div>${part.weight}g each</div>
              <span class="material">${mat?.name || part.material}</span>
            </div>
          `;
          tooltip.classList.add('visible');
        }
      });

      el.addEventListener('mousemove', (e) => {
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY - 10) + 'px';
      });

      el.addEventListener('mouseleave', () => {
        this.highlightPart(null);
        tooltip.classList.remove('visible');
      });
    });
  }

  highlightPart(partId) {
    this.highlightedPart = partId;
    this.render();
    
    // Also highlight in parts list
    document.querySelectorAll('.part-item').forEach(el => {
      el.classList.toggle('highlighted', el.dataset.part === partId);
    });
  }

  setExplosion(val) {
    this.explosion = val;
    this.render();
  }

  setRotation(val) {
    this.rotation = val;
    this.render();
  }

  animate() {
    if (this.animating) return;
    this.animating = true;

    const start = this.explosion;
    const target = start < 50 ? 100 : 0;
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.explosion = start + (target - start) * eased;
      
      // Update slider
      const slider = document.getElementById('explosionSlider');
      const label = document.getElementById('explosionValue');
      if (slider) slider.value = this.explosion;
      if (label) label.textContent = Math.round(this.explosion);
      
      this.render();

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        this.animating = false;
      }
    };

    requestAnimationFrame(tick);
  }

  exportSVG(filename = 'diagram') {
    const blob = new Blob([this.svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-exploded.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
