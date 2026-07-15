import { useCallback, useEffect, useRef } from 'react';
import type { Particle, UseParticlesResult } from '../types';
import { GAME_ASSETS, PARTICLES_CONFIG } from '../utils/constants';

export function useParticles(): UseParticlesResult {
  const particlesRef = useRef<Particle[]>([]);
  const particleSpawnTimerRef = useRef<number>(0);
  const particleImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!particleImageRef.current) {
      const img = new Image();
      img.src = GAME_ASSETS.PARTICLE;
      particleImageRef.current = img;
    }
  }, []);

  const addParticle = useCallback((canvasWidth: number, canvasHeight: number, ratio: number): void => {
    const sizeModifier =
      Math.random() * (PARTICLES_CONFIG.SIZE_MODIFIER_MAX - PARTICLES_CONFIG.SIZE_MODIFIER_MIN) + PARTICLES_CONFIG.SIZE_MODIFIER_MIN;
    const baseSize = PARTICLES_CONFIG.BASE_SIZE * sizeModifier;

    const particle: Particle = {
      x: Math.random() * canvasWidth,
      y: canvasHeight + baseSize * ratio,
      width: baseSize,
      height: baseSize,
      speedY: (Math.random() * (PARTICLES_CONFIG.SPEED_MAX - PARTICLES_CONFIG.SPEED_MIN) + PARTICLES_CONFIG.SPEED_MIN) * ratio,
      angle: Math.random() * Math.PI * 2,
      va:
        Math.random() * (PARTICLES_CONFIG.ANGULAR_VELOCITY_MAX - PARTICLES_CONFIG.ANGULAR_VELOCITY_MIN) +
        PARTICLES_CONFIG.ANGULAR_VELOCITY_MIN,
      curve: Math.random() * PARTICLES_CONFIG.CURVE_MAX * ratio,
      markedForDeletion: false
    };

    particlesRef.current.push(particle);
  }, []);

  const updateParticles = useCallback((): void => {
    particlesRef.current.forEach((particle) => {
      particle.y -= particle.speedY;
      particle.x += Math.sin(particle.angle) * particle.curve;
      particle.angle += particle.va;

      if (particle.y < -particle.height) {
        particle.markedForDeletion = true;
      }
    });

    particlesRef.current = particlesRef.current.filter((p) => !p.markedForDeletion);
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, ratio: number): void => {
    const img = particleImageRef.current;
    if (!img || !img.complete) return;

    particlesRef.current.forEach((particle) => {
      ctx.save();
      ctx.globalAlpha = PARTICLES_CONFIG.OPACITY;
      ctx.drawImage(img, particle.x, particle.y, particle.width * ratio, particle.height * ratio);
      ctx.restore();
    });
  }, []);

  const autoSpawnParticles = useCallback(
    (deltaTime: number, canvasWidth: number, canvasHeight: number, ratio: number): void => {
      particleSpawnTimerRef.current += deltaTime;

      if (particleSpawnTimerRef.current >= PARTICLES_CONFIG.PARTICLE_SPAWN_INTERVAL_MS) {
        addParticle(canvasWidth, canvasHeight, ratio);
        particleSpawnTimerRef.current = 0;
      }
    },
    [addParticle]
  );

  const reset = useCallback((): void => {
    particlesRef.current = [];
    particleSpawnTimerRef.current = 0;
  }, []);

  return { addParticle, updateParticles, drawParticles, autoSpawnParticles, reset };
}
