import { motion, useAnimation, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';

// Animação de entrada suave
export function FadeIn({ children, delay = 0, direction = 'up' }: { 
  children: React.ReactNode; 
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
}

// Animação de escala ao hover
export function ScaleOnHover({ children, scale = 1.05 }: { 
  children: React.ReactNode; 
  scale?: number;
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// Animação de pulso
export function Pulse({ children, color = 'sky' }: { 
  children: React.ReactNode; 
  color?: string;
}) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 0 0 rgba(59, 130, 246, 0)`,
          `0 0 0 20px rgba(59, 130, 246, 0.1)`,
          `0 0 0 0 rgba(59, 130, 246, 0)`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className="rounded-full"
    >
      {children}
    </motion.div>
  );
}

// Animação de contador
export function AnimatedCounter({ 
  value, 
  duration = 2,
  suffix = '' 
}: { 
  value: number; 
  duration?: number;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function (easeOutExpo)
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
}

// Animação de skeleton loading
export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-slate-200 rounded-lg ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}

// Animação de confetti
export function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
  }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360
      }));
      setParticles(newParticles);

      setTimeout(() => setParticles([]), 3000);
    }
  }, [trigger]);

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: particle.x, 
            y: particle.y,
            rotate: 0,
            opacity: 1
          }}
          animate={{ 
            y: window.innerHeight + 20,
            rotate: particle.rotation,
            opacity: 0
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: 'easeOut'
          }}
          className="fixed w-3 h-3 pointer-events-none z-50"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </>
  );
}

// Animação de parallax
export function Parallax({ children, speed = 0.5 }: { 
  children: React.ReactNode; 
  speed?: number;
}) {
  const y = useMotionValue(0);
  const yTransform = useTransform(y, [0, 1000], [0, 1000 * speed]);

  useEffect(() => {
    const handleScroll = () => {
      y.set(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [y]);

  return (
    <motion.div style={{ y: yTransform }}>
      {children}
    </motion.div>
  );
}

// Animação de texto digitando
export function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= text.length) {
          setDisplayText(text.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-sky-500 ml-1 align-middle"
      />
    </span>
  );
}

// Animação de ondas
export function WaveAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 left-0 right-0 h-64 opacity-10"
          style={{
            background: `linear-gradient(to top, #3B82F6, transparent)`,
            borderRadius: '100% 100% 0 0'
          }}
          animate={{
            scaleX: [1, 1.2, 1],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5
          }}
        />
      ))}
    </div>
  );
}

// Animação de flutuação
export function Float({ children, duration = 3 }: { 
  children: React.ReactNode; 
  duration?: number;
}) {
  return (
    <motion.div
      animate={{
        y: [-10, 10, -10]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

// Animação de shake (para erros)
export function Shake({ children, trigger }: { 
  children: React.ReactNode; 
  trigger: boolean;
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      controls.start({
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
    }
  }, [trigger, controls]);

  return (
    <motion.div animate={controls}>
      {children}
    </motion.div>
  );
}
