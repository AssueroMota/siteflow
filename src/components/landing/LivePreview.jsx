import { useEffect, useRef, useState } from 'react';
import { safeUrl } from '../../services/api';
export default function LivePreview({ system }) {
  const frame = useRef(null);
  const [size, setSize] = useState({ width: 1200, height: 750 });
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const measure = () => {
      const bounds = element.getBoundingClientRect();
      if (bounds.width && bounds.height) setSize({ width: bounds.width, height: bounds.height });
    };
    measure();
    if (!window.ResizeObserver) return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const scale = size.width / 1200;
  return (
    <div className="live-landing-preview" ref={frame}>
      <iframe
        title={`Landing page ${system.name}`}
        src={safeUrl(system.demoUrl) || `/modelos/${encodeURIComponent(system.id)}?embed=1`}
        style={{
          width: 1200,
          height: Math.ceil(size.height / scale),
          transform: `scale(${scale})`,
        }}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms"
        referrerPolicy="same-origin"
      />
    </div>
  );
}
