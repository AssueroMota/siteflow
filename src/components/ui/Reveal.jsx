import { useEffect, useRef, useState } from 'react';
export default function Reveal({
  as: Tag = 'div',
  direction = 'up',
  delay = 0,
  className = '',
  children,
  ...props
}) {
  const element = useRef(null);
  const [visible, setVisible] = useState(
    () =>
      typeof window === 'undefined' ||
      !window.IntersectionObserver ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches,
  );
  useEffect(() => {
    const node = element.current;
    if (!node || visible) return;
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (preference?.matches || !window.IntersectionObserver) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -25px 0px' },
    );
    const reduce = (event) => {
      if (event.matches) setVisible(true);
    };
    observer.observe(node);
    preference?.addEventListener?.('change', reduce);
    return () => {
      observer.disconnect();
      preference?.removeEventListener?.('change', reduce);
    };
  }, [visible]);
  return (
    <Tag
      {...props}
      ref={element}
      className={`reveal ${className}`}
      data-reveal={direction}
      data-visible={visible ? 'true' : 'false'}
      style={{ ...props.style, '--reveal-delay': `${Math.min(Math.max(delay, 0), 600)}ms` }}
      onFocusCapture={(event) => {
        setVisible(true);
        props.onFocusCapture?.(event);
      }}
    >
      {children}
    </Tag>
  );
}
