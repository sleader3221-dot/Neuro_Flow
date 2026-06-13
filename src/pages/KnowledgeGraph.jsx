import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { generateKnowledgeGraph } from '../utils/ai';
import { ZoomIn, ZoomOut, RotateCcw, Info, Maximize2 } from 'lucide-react';

export default function KnowledgeGraph() {
  const { state } = useApp();
  const { subjects } = state;

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);

  // All interaction state in refs so they never trigger re-renders / physics resets
  const zoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const draggingNodeRef = useRef(null);   // node being dragged
  const panningRef = useRef(false);        // panning the canvas
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetStartRef = useRef({ x: 0, y: 0 });
  const hoveredNodeRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const pulseRef = useRef(0); // for animated pulse on subject nodes

  // Only these need React state (they drive UI outside the canvas)
  const [selected, setSelected] = useState(null);
  const [zoomDisplay, setZoomDisplay] = useState(100);
  const [nodeCount, setNodeCount] = useState(0);
  const [linkCount, setLinkCount] = useState(0);

  // ── Canvas to world coordinate conversion ─────────────────
  function canvasToWorld(canvasX, canvasY) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (canvasX - rect.left) * scaleX;
    const py = (canvasY - rect.top) * scaleY;
    return {
      x: (px - offsetRef.current.x) / zoomRef.current,
      y: (py - offsetRef.current.y) / zoomRef.current,
    };
  }

  function hitTest(worldX, worldY) {
    return nodesRef.current.find(n => {
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) <= n.size + 6;
    });
  }

  // ── Initialize physics when subjects change ────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas intrinsic resolution to match its CSS size
    const setSize = () => {
      const W = canvas.offsetWidth || 800;
      const H = canvas.offsetHeight || 520;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      return { W: canvas.width, H: canvas.height };
    };

    const { W, H } = setSize();

    const { nodes, links } = generateKnowledgeGraph(subjects.map(s => s.name));

    // Radial layout: subjects in a ring, concepts clustered around parent
    const subjectNodes = nodes.filter(n => n.type === 'subject');
    const conceptNodes = nodes.filter(n => n.type === 'concept');
    const cx = W / 2, cy = H / 2;
    const r = Math.min(W, H) * 0.3;

    subjectNodes.forEach((n, i) => {
      const angle = (i / subjectNodes.length) * Math.PI * 2 - Math.PI / 2;
      n.x = cx + Math.cos(angle) * r;
      n.y = cy + Math.sin(angle) * r;
      n.vx = 0; n.vy = 0;
      n.size = 22;
    });

    conceptNodes.forEach((n, i) => {
      const parent = subjectNodes.find(s => s.id === n.subject);
      const angle = (i / conceptNodes.length) * Math.PI * 2 + (Math.random() - 0.5) * 1.2;
      n.x = parent ? parent.x + Math.cos(angle) * 85 : cx + (Math.random() - 0.5) * r * 1.5;
      n.y = parent ? parent.y + Math.sin(angle) * 85 : cy + (Math.random() - 0.5) * r * 1.5;
      n.vx = 0; n.vy = 0;
      n.size = 11;
    });

    nodesRef.current = nodes;
    linksRef.current = links;
    setNodeCount(nodes.length);
    setLinkCount(links.length);

    // Reset view
    zoomRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
    setZoomDisplay(100);

    // ── Physics simulation ──────────────────────────────────
    function simulate() {
      const ns = nodesRef.current;
      const ls = linksRef.current;
      const W2 = canvas.width, H2 = canvas.height;

      // Repulsion between all node pairs
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const a = ns[i], b = ns[j];
          if (a === draggingNodeRef.current || b === draggingNodeRef.current) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          const minDist = (a.size + b.size) * 3.5;
          if (dist < minDist) {
            const force = (minDist - dist) / minDist * 0.08;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            a.vx -= fx; a.vy -= fy;
            b.vx += fx; b.vy += fy;
          }
        }
      }

      // Spring forces along links
      ls.forEach(link => {
        const s = ns.find(n => n.id === link.source);
        const t = ns.find(n => n.id === link.target);
        if (!s || !t) return;
        const dx = t.x - s.x, dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const ideal = link.strength > 0.5 ? 100 : 160;
        const force = (dist - ideal) * 0.025 * link.strength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (s !== draggingNodeRef.current) { s.vx += fx; s.vy += fy; }
        if (t !== draggingNodeRef.current) { t.vx -= fx; t.vy -= fy; }
      });

      // Center gravity + damping + position integration + boundary
      ns.forEach(n => {
        if (n === draggingNodeRef.current) return;
        n.vx += (W2 / 2 - n.x) * 0.0008;
        n.vy += (H2 / 2 - n.y) * 0.0008;
        n.vx *= 0.88;
        n.vy *= 0.88;
        n.x += n.vx;
        n.y += n.vy;
        const pad = n.size + 8;
        n.x = Math.max(pad, Math.min(W2 - pad, n.x));
        n.y = Math.max(pad, Math.min(H2 - pad, n.y));
      });
    }

    // ── Draw loop ────────────────────────────────────────────
    function draw() {
      const ctx = canvas.getContext('2d');
      const W2 = canvas.width, H2 = canvas.height;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, W2, H2);

      // Subtle grid background
      ctx.save();
      ctx.strokeStyle = 'rgba(124,58,237,0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40 * dpr;
      for (let x = 0; x < W2; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H2); ctx.stroke();
      }
      for (let y = 0; y < H2; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W2, y); ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(offsetRef.current.x, offsetRef.current.y);
      ctx.scale(zoomRef.current, zoomRef.current);

      const ns = nodesRef.current;
      const ls = linksRef.current;
      const sel = selected;
      const hov = hoveredNodeRef.current;
      pulseRef.current = (pulseRef.current + 0.03) % (Math.PI * 2);
      const pulse = Math.sin(pulseRef.current) * 0.5 + 0.5;

      // Draw links
      ls.forEach(link => {
        const s = ns.find(n => n.id === link.source);
        const t = ns.find(n => n.id === link.target);
        if (!s || !t) return;

        // Highlight links connected to selected node
        const isHighlighted = sel && (sel.id === s.id || sel.id === t.id);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);

        if (isHighlighted) {
          ctx.strokeStyle = link.strength > 0.5 ? 'rgba(124,58,237,0.7)' : 'rgba(6,182,212,0.5)';
          ctx.lineWidth = link.strength > 0.5 ? 2 : 1.2;
        } else {
          ctx.strokeStyle = link.strength > 0.5 ? 'rgba(124,58,237,0.22)' : 'rgba(148,163,184,0.1)';
          ctx.lineWidth = link.strength > 0.5 ? 1.2 : 0.7;
        }
        ctx.stroke();

        // Draw arrowhead for strong links
        if (link.strength > 0.5 && isHighlighted) {
          const angle = Math.atan2(t.y - s.y, t.x - s.x);
          const ax = t.x - Math.cos(angle) * (t.size + 4);
          const ay = t.y - Math.sin(angle) * (t.size + 4);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax - 8 * Math.cos(angle - 0.4), ay - 8 * Math.sin(angle - 0.4));
          ctx.lineTo(ax - 8 * Math.cos(angle + 0.4), ay - 8 * Math.sin(angle + 0.4));
          ctx.closePath();
          ctx.fillStyle = 'rgba(124,58,237,0.7)';
          ctx.fill();
        }
      });

      // Draw nodes
      ns.forEach(node => {
        const isSelected = sel?.id === node.id;
        const isHovered = hov?.id === node.id;
        const r = node.size + (isSelected || isHovered ? 3 : 0);

        if (node.type === 'subject') {
          // Animated pulse ring for subject nodes
          const pulseR = r + 8 + pulse * 5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = node.color + (isSelected ? '22' : '11');
          ctx.fill();

          // Glow shadow
          ctx.shadowColor = node.color;
          ctx.shadowBlur = isSelected ? 28 : (isHovered ? 18 : 10);

          // Gradient fill
          const grad = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, 0, node.x, node.y, r);
          grad.addColorStop(0, node.color + 'ff');
          grad.addColorStop(1, node.color + 'bb');

          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Border
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Label inside node
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(10, Math.min(12, r * 0.55))}px "Space Grotesk", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const labelText = node.label.length > 10 ? node.label.slice(0, 8) + '…' : node.label;
          ctx.fillText(labelText, node.x, node.y);

        } else {
          // Concept node
          const isConnectedToSelected = sel && ls.some(l =>
            (l.source === node.id && l.target === sel.id) ||
            (l.target === node.id && l.source === sel.id)
          );

          ctx.shadowColor = node.color;
          ctx.shadowBlur = isHovered || isConnectedToSelected ? 12 : 4;

          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);

          if (isConnectedToSelected || isHovered) {
            ctx.fillStyle = node.color + '55';
            ctx.strokeStyle = node.color + 'dd';
          } else {
            ctx.fillStyle = node.color + '22';
            ctx.strokeStyle = node.color + '77';
          }
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Label below node
          ctx.fillStyle = isHovered || isConnectedToSelected ? '#f1f5f9' : '#94a3b8';
          ctx.font = `${Math.max(8, Math.min(10, r * 0.85))}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const cLabel = node.label.length > 12 ? node.label.slice(0, 10) + '…' : node.label;
          ctx.fillText(cLabel, node.x, node.y + r + 4);
        }
      });

      ctx.restore();

      // Run physics and loop
      simulate();
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [subjects]); // Only re-init when subjects change

  // ── Mouse / Touch Event Handlers ──────────────────────────
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const world = canvasToWorld(e.clientX, e.clientY);
    const hit = hitTest(world.x, world.y);

    if (hit) {
      draggingNodeRef.current = hit;
      hit.fixed = true;
    } else {
      // Start canvas pan
      panningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panOffsetStartRef.current = { ...offsetRef.current };
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const world = canvasToWorld(e.clientX, e.clientY);

    if (draggingNodeRef.current) {
      draggingNodeRef.current.x = world.x;
      draggingNodeRef.current.y = world.y;
      draggingNodeRef.current.vx = 0;
      draggingNodeRef.current.vy = 0;
    } else if (panningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      offsetRef.current = {
        x: panOffsetStartRef.current.x + dx * dpr,
        y: panOffsetStartRef.current.y + dy * dpr,
      };
    } else {
      // Hover detection
      const hit = hitTest(world.x, world.y);
      hoveredNodeRef.current = hit || null;
      canvas.style.cursor = hit ? 'pointer' : panningRef.current ? 'grabbing' : 'grab';
    }
  }, []);

  const handleMouseUp = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (draggingNodeRef.current) {
      // If barely moved, treat as click → select node
      draggingNodeRef.current.fixed = false;
      draggingNodeRef.current.vx = 0;
      draggingNodeRef.current.vy = 0;
      setSelected(draggingNodeRef.current);
      draggingNodeRef.current = null;
    } else if (panningRef.current) {
      panningRef.current = false;
    } else {
      // Click on empty space → deselect
      setSelected(null);
    }

    canvas.style.cursor = 'grab';
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const delta = -e.deltaY * 0.001;
    const newZoom = Math.max(0.3, Math.min(3, zoomRef.current + delta * zoomRef.current));

    // Zoom toward mouse position
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mouseX = (e.clientX - rect.left) * dpr;
    const mouseY = (e.clientY - rect.top) * dpr;

    const scale = newZoom / zoomRef.current;
    offsetRef.current = {
      x: mouseX - scale * (mouseX - offsetRef.current.x),
      y: mouseY - scale * (mouseY - offsetRef.current.y),
    };

    zoomRef.current = newZoom;
    setZoomDisplay(Math.round(newZoom * 100));
  }, []);

  // Attach wheel listener with { passive: false } so we can preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  function resetView() {
    zoomRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
    setZoomDisplay(100);
    setSelected(null);
  }

  function zoomIn() {
    const newZoom = Math.min(3, zoomRef.current * 1.2);
    const canvas = canvasRef.current;
    if (canvas) {
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const scale = newZoom / zoomRef.current;
      offsetRef.current = {
        x: cx - scale * (cx - offsetRef.current.x),
        y: cy - scale * (cy - offsetRef.current.y),
      };
    }
    zoomRef.current = newZoom;
    setZoomDisplay(Math.round(newZoom * 100));
  }

  function zoomOut() {
    const newZoom = Math.max(0.3, zoomRef.current / 1.2);
    const canvas = canvasRef.current;
    if (canvas) {
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const scale = newZoom / zoomRef.current;
      offsetRef.current = {
        x: cx - scale * (cx - offsetRef.current.x),
        y: cy - scale * (cy - offsetRef.current.y),
      };
    }
    zoomRef.current = newZoom;
    setZoomDisplay(Math.round(newZoom * 100));
  }

  // Find connections for selected node
  const selectedConnections = selected
    ? nodesRef.current.filter(n =>
        n.id !== selected.id &&
        linksRef.current.some(l =>
          (l.source === selected.id && l.target === n.id) ||
          (l.target === selected.id && l.source === n.id)
        )
      )
    : [];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Knowledge Graph 🕸️</h1>
            <p className="page-subtitle">Physics-based interactive concept relationship map — drag nodes, scroll to zoom, pan to explore</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={zoomIn} title="Zoom In"><ZoomIn size={15} /></button>
            <button className="btn btn-secondary btn-sm" onClick={zoomOut} title="Zoom Out"><ZoomOut size={15} /></button>
            <button className="btn btn-secondary btn-sm" onClick={resetView}><RotateCcw size={15} /> Reset</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        {/* Graph Canvas */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{
            position: 'relative',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            height: 540,
          }}>
            {/* Radial bg glow */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.07) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab', userSelect: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />

            {/* Zoom indicator */}
            <div style={{
              position: 'absolute', bottom: 12, right: 12,
              fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
              background: 'var(--bg-glass)', padding: '4px 10px',
              borderRadius: 'var(--radius-sm)', backdropFilter: 'blur(10px)',
              border: '1px solid var(--border)'
            }}>
              {zoomDisplay}%
            </div>

            {/* Interaction hint */}
            <div style={{
              position: 'absolute', bottom: 12, left: 12,
              fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
              background: 'var(--bg-glass)', padding: '4px 10px',
              borderRadius: 'var(--radius-sm)', backdropFilter: 'blur(10px)',
              border: '1px solid var(--border)'
            }}>
              🖱️ Drag nodes · Scroll to zoom · Pan canvas
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Legend */}
          <div className="glass-card">
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>📌 Legend</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {subjects.slice(0, 6).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: s.color, flexShrink: 0,
                    boxShadow: `0 0 8px ${s.color}66`
                  }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{s.name}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid var(--text-tertiary)', flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Concept node</span>
              </div>
            </div>
          </div>

          {/* Selected node info */}
          {selected ? (
            <div className="glass-card" style={{ animation: 'scaleIn 250ms ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: selected.color,
                  boxShadow: `0 0 16px ${selected.color}88`,
                  flexShrink: 0
                }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{selected.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                    {selected.type} node
                  </div>
                </div>
              </div>

              {selectedConnections.length > 0 && (
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Connected to ({selectedConnections.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedConnections.slice(0, 6).map(n => (
                      <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                        onClick={() => setSelected(n)}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{n.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Info size={16} color="var(--text-tertiary)" />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>How to use</span>
              </div>
              <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', paddingLeft: 16, lineHeight: 2.2 }}>
                <li>Click any node to inspect it</li>
                <li>Drag nodes to rearrange</li>
                <li>Scroll to zoom in/out</li>
                <li>Drag background to pan</li>
                <li>Large dots = subjects</li>
                <li>Small dots = concepts</li>
                <li>Lines show concept links</li>
              </ul>
            </div>
          )}

          {/* Graph stats */}
          <div className="glass-card">
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>📊 Graph Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Subjects', value: subjects.length, color: '#7c3aed' },
                { label: 'Concept Nodes', value: nodeCount - subjects.length, color: '#06b6d4' },
                { label: 'Connections', value: linkCount, color: '#10b981' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
