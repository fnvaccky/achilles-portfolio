import { useEffect, useRef, useState } from 'react';
import orbit from './orbit.png';
import jmac from './jmac.png';

export default function Gallery({ active, reduced, paused, onSelect }: { active: number; reduced: boolean; paused: boolean; onSelect: (n: number) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const selection = useRef(active);
  const motionPaused = useRef(paused);
  useEffect(() => { motionPaused.current = paused; }, [paused]);
  const selectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  useEffect(() => { selection.current = active; selectRef.current = onSelect; }, [active, onSelect]);
  useEffect(() => {
    let destroyed = false, cleanup = () => {};
    import('three').then(THREE => {
      if (destroyed || !host.current) return;
      const node = host.current;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
      catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      node.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
      camera.position.z = 8.5;
      const loader = new THREE.TextureLoader();
      const textures = [orbit, jmac].map(src => { const t = loader.load(src, () => { if (!destroyed) { setReady(true); draw(); } }); t.colorSpace = THREE.SRGBColorSpace; return t; });
      const groups = textures.map((texture, i) => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(5.1, 3.02, .09), new THREE.MeshStandardMaterial({ color: i === 0 ? '#292631' : '#d6c9e4', roughness: .36, metalness: .3 }));
        group.add(body);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.93, 2.78), new THREE.MeshBasicMaterial({ map: texture }));
        screen.position.z = .052; screen.position.y = -.035; group.add(screen);
        for (let dot = 0; dot < 3; dot++) {
          const light = new THREE.Mesh(new THREE.CircleGeometry(.024, 12), new THREE.MeshBasicMaterial({ color: '#a89bb6' }));
          light.position.set(-2.37 + dot * .09, 1.435, .051); group.add(light);
        }
        scene.add(group); return group;
      });
      scene.add(new THREE.AmbientLight(0xffffff, 2.5));
      const light = new THREE.DirectionalLight(0xffffff, 3); light.position.set(-3, 5, 7); scene.add(light);
      let frame = 0, inView = true, dragStart = 0, dragging = false, drag = 0, px = 0, py = 0;
      const draw = () => {
        if (destroyed) return;
        const time = performance.now() * .001;
        groups.forEach((group, i) => {
          const front = selection.current === i;
          const factor = reduced ? 1 : .075;
          const target = new THREE.Vector3(front ? -.12 : .68, (front ? -.12 : .61) + (reduced || motionPaused.current ? 0 : Math.sin(time * .7 + i * 2) * .07), front ? .7 : -1.1);
          group.position.lerp(target, factor);
          group.rotation.x += ((front ? -.07 : .08) + (reduced || motionPaused.current ? 0 : py * .075) - group.rotation.x) * factor;
          group.rotation.y += ((front ? -.15 : .19) + (reduced || motionPaused.current ? 0 : px * .13 + drag * .003) - group.rotation.y) * factor;
          group.rotation.z += ((front ? -.06 : .11) - group.rotation.z) * factor;
        });
        renderer.render(scene, camera);
      };
      const loop = () => { draw(); if (inView && !destroyed) frame = requestAnimationFrame(loop); };
      const resize = new ResizeObserver(() => { const {width,height} = node.getBoundingClientRect(); renderer.setSize(width,height); camera.aspect = width / height; camera.position.z = width < 450 ? 10.2 : 8.5; camera.updateProjectionMatrix(); draw(); });
      resize.observe(node);
      const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; cancelAnimationFrame(frame); if (inView) loop(); }); visibility.observe(node);
      const down = (e: PointerEvent) => { if (e.pointerType === 'mouse' && e.button !== 0) return; dragging = true; dragStart = e.clientX; node.setPointerCapture(e.pointerId); };
      const move = (e: PointerEvent) => { const r = node.getBoundingClientRect(); px = (e.clientX-r.left)/r.width-.5; py = (e.clientY-r.top)/r.height-.5; if (dragging) drag = e.clientX-dragStart; };
      const up = () => { if (dragging && Math.abs(drag)>50) selectRef.current(1-selection.current); dragging=false; drag=0; };
      const leave = () => { px=0; py=0; };
      node.addEventListener('pointerdown',down); node.addEventListener('pointermove',move); node.addEventListener('pointerup',up); node.addEventListener('pointercancel',up); node.addEventListener('pointerleave',leave);
      const lost = (e: Event) => { e.preventDefault(); setReady(false); cancelAnimationFrame(frame); };
      renderer.domElement.addEventListener('webglcontextlost',lost);
      cleanup = () => { cancelAnimationFrame(frame); resize.disconnect(); visibility.disconnect(); node.removeEventListener('pointerdown',down); node.removeEventListener('pointermove',move); node.removeEventListener('pointerup',up); node.removeEventListener('pointercancel',up); node.removeEventListener('pointerleave',leave); textures.forEach(t=>t.dispose()); scene.traverse(obj=>{ if(obj instanceof THREE.Mesh){obj.geometry.dispose(); const mats=Array.isArray(obj.material)?obj.material:[obj.material]; mats.forEach(m=>m.dispose());} }); renderer.dispose(); renderer.domElement.remove(); };
    }).catch(() => setReady(false));
    return () => { destroyed = true; cleanup(); };
  }, [reduced]);
  return <div className="gallery-render" ref={host} aria-hidden="true"><img className={`gallery-fallback ${ready ? 'loaded' : ''}`} src={active === 0 ? orbit : jmac} alt="" width="1274" height="716" /></div>;
}
