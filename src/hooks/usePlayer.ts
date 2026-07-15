import { useCallback, useEffect, useRef } from 'react';
import type { BreathEffectsCollection, PlayerBreathContext, PlayerState, UsePlayerOptions, UsePlayerResult } from '../types';
import { getIntervalBreathingState, getIntervalPhaseDurationsMs } from '../services/game/breathingRhythmService';
import { GAME_ASSETS, PLAYER_CONFIG, VISUAL_BREATH_INDICATOR_CONFIG } from '../utils/constants';

export function usePlayer(options?: UsePlayerOptions): UsePlayerResult {
  const playerRef = useRef<PlayerState>({
    x: -1000,
    y: 0,
    width: 0,
    height: 0,
    targetX: 0,
    hasArrived: false,
    angle: Math.PI,
    spriteAngle: 0,
    frameY: 0,
    rotation: 0,
    lastDirection: 'none',
    isRising: false,
    intervalPhase: null
  });

  const spriteRef = useRef<HTMLImageElement | null>(null);
  const spriteWidth = PLAYER_CONFIG.SPRITE_WIDTH;
  const totalFrames = PLAYER_CONFIG.SPRITE_FRAMES;
  const spriteHeight = PLAYER_CONFIG.SPRITE_TOTAL_HEIGHT / totalFrames;
  const maxFrame = totalFrames - 1;
  const scale = 1;
  const curve = useRef(10);
  const canvasHeightRef = useRef(0);
  const breathEffectsRef = useRef<BreathEffectsCollection>({
    inhale: { image: null, frameCount: 1, frameSize: 1, frame: 0, timer: 0 },
    exhale: { image: null, frameCount: 1, frameSize: 1, frame: 0, timer: 0 }
  });

  const lastIntervalBreathPhaseRef = useRef<string | null>(null);
  const intervalBreathPhase01Ref = useRef(0.5);

  const onExhalePhaseStart = useRef<((duration: number) => void) | null>(null);
  const onInhalePhaseStart = useRef<((duration: number) => void) | null>(null);
  useEffect(() => {
    onExhalePhaseStart.current = options?.onExhalePhaseStart ?? null;
    onInhalePhaseStart.current = options?.onInhalePhaseStart ?? null;
  }, [options?.onExhalePhaseStart, options?.onInhalePhaseStart]);

  useEffect(() => {
    const img = new Image();
    img.src = GAME_ASSETS.MAIN_CHARACTER_SPRITESHEET;
    img.onload = () => {
      spriteRef.current = img;
    };
    return () => {
      img.onload = null;
    };
  }, []);

  useEffect(() => {
    if (!VISUAL_BREATH_INDICATOR_CONFIG.ENABLED || VISUAL_BREATH_INDICATOR_CONFIG.LAYOUT !== 'topDown') {
      return;
    }

    const inhaleIndicator = new Image();
    const exhaleIndicator = new Image();

    inhaleIndicator.src = GAME_ASSETS.VISUAL_BREATH_INDICATORS_TOP_DOWN.INHALE;
    exhaleIndicator.src = GAME_ASSETS.VISUAL_BREATH_INDICATORS_TOP_DOWN.EXHALE;

    inhaleIndicator.onload = () => {
      const frameSize = inhaleIndicator.width || 1;
      const inhale = breathEffectsRef.current.inhale;
      inhale.image = inhaleIndicator;
      inhale.frameSize = frameSize;
      inhale.frameCount = Math.max(1, Math.floor(inhaleIndicator.height / frameSize));
    };

    exhaleIndicator.onload = () => {
      const frameSize = exhaleIndicator.width || 1;
      const exhale = breathEffectsRef.current.exhale;
      exhale.image = exhaleIndicator;
      exhale.frameSize = frameSize;
      exhale.frameCount = Math.max(1, Math.floor(exhaleIndicator.height / frameSize));
    };

    return () => {
      inhaleIndicator.onload = null;
      exhaleIndicator.onload = null;
    };
  }, []);

  const resize = useCallback(
    (canvasWidth: number, canvasHeight: number, ratio: number): void => {
      const p = playerRef.current;
      canvasHeightRef.current = canvasHeight;
      p.width = spriteWidth * ratio * scale;
      p.height = spriteHeight * ratio * scale;
      p.targetX = canvasWidth * PLAYER_CONFIG.HORIZONTAL_POSITION - p.width * 0.5;
      p.y = canvasHeight * PLAYER_CONFIG.VERTICAL_POSITION - p.height * 0.5;
      curve.current = canvasHeight * PLAYER_CONFIG.VERTICAL_CURVE_FACTOR;

      if (p.x < -p.width * 2) {
        p.x = -p.width - 50;
        p.hasArrived = false;
        p.lastDirection = 'none';
        p.angle = Math.PI;
        p.isRising = false;
      }
    },
    [spriteWidth, spriteHeight, scale]
  );

  const reset = useCallback((): void => {
    const p = playerRef.current;
    p.x = p.width > 0 ? -p.width - 50 : -1000;
    p.hasArrived = false;
    p.lastDirection = 'none';
    p.angle = Math.PI;
    p.isRising = false;
    p.intervalPhase = null;
    lastIntervalBreathPhaseRef.current = null;
    intervalBreathPhase01Ref.current = 0.5;
  }, []);

  const advanceSpriteFrame = useCallback(
    (deltaTime: number): void => {
      const p = playerRef.current;
      p.spriteAngle += PLAYER_CONFIG.SPRITE_ANIM_SPEED * (deltaTime / 1000);
      let theta = p.spriteAngle % (Math.PI * 2);
      if (theta < 0) theta += Math.PI * 2;
      const shiftedTheta = (theta + Math.PI / 2) % (Math.PI * 2);
      const totalFramesCalc = maxFrame + 1;
      p.frameY = Math.floor((shiftedTheta / (Math.PI * 2)) * totalFramesCalc);
      if (p.frameY > maxFrame) p.frameY = maxFrame;
    },
    [maxFrame]
  );

  const updatePosition = useCallback(
    (deltaTime: number, cpm: number, isGameOver: boolean, isPaused: boolean, breathCtx?: PlayerBreathContext): void => {
      const p = playerRef.current;
      const ratio = p.height > 0 ? p.height / (spriteHeight * scale) : 1;

      const canvasHeight = canvasHeightRef.current || window.innerHeight;
      const centerY = canvasHeight * PLAYER_CONFIG.VERTICAL_POSITION - p.height * 0.5;

      if (isGameOver) {
        p.x += PLAYER_CONFIG.ENTER_SPEED * ratio;
      } else {
        const distanceToTarget = p.targetX - p.x;
        if (distanceToTarget > 0.5) {
          let currentSpeed = distanceToTarget * PLAYER_CONFIG.BRAKING_FORCE;
          const maxSpeed = PLAYER_CONFIG.ENTER_SPEED * ratio;
          if (currentSpeed > maxSpeed) currentSpeed = maxSpeed;
          if (currentSpeed < 0.2) currentSpeed = 0.2;
          p.x += currentSpeed;
          p.hasArrived = false;
          p.lastDirection = 'none';
          p.isRising = false;
        } else {
          p.x = p.targetX;

          if (!p.hasArrived) {
            p.hasArrived = true;
          }
        }
      }

      const useContinuous = !breathCtx || breathCtx.pattern === 'continuous';

      if (useContinuous) {
        p.intervalPhase = null;

        const cyclesPerSecond = cpm / 60;
        const radsPerFrame = cyclesPerSecond * Math.PI * 2 * (deltaTime / 1000);
        p.angle += radsPerFrame;

        const halfCycleDuration = 30 / cpm;

        const cosValue = Math.cos(p.angle);
        const currentDirection = cosValue > 0 ? 'down' : 'up';
        p.isRising = currentDirection === 'up';

        if (p.lastDirection !== currentDirection) {
          if (!isPaused && p.hasArrived && !isGameOver) {
            if (currentDirection === 'down') {
              onExhalePhaseStart.current?.(halfCycleDuration);
            } else {
              onInhalePhaseStart.current?.(halfCycleDuration);
            }
          }
          p.lastDirection = currentDirection;
        }

        const sineValue = Math.sin(p.angle);
        p.y = centerY + sineValue * curve.current;
        p.rotation = Math.cos(p.angle) * PLAYER_CONFIG.MAX_ROTATION;

        advanceSpriteFrame(deltaTime);

        if (VISUAL_BREATH_INDICATOR_CONFIG.ENABLED && VISUAL_BREATH_INDICATOR_CONFIG.LAYOUT === 'topDown') {
          const frameDuration = 1000 / VISUAL_BREATH_INDICATOR_CONFIG.TOP_DOWN.ANIMATION_FPS;
          const inhale = breathEffectsRef.current.inhale;
          const exhale = breathEffectsRef.current.exhale;

          inhale.timer += deltaTime;
          exhale.timer += deltaTime;

          while (inhale.timer >= frameDuration) {
            inhale.timer -= frameDuration;
            inhale.frame = (inhale.frame + 1) % inhale.frameCount;
          }

          while (exhale.timer >= frameDuration) {
            exhale.timer -= frameDuration;
            exhale.frame = (exhale.frame + 1) % exhale.frameCount;
          }
        }

        lastIntervalBreathPhaseRef.current = null;
        return;
      }

      const d = getIntervalPhaseDurationsMs(cpm);
      // A ordem cronológica natural de `getIntervalBreathingState` é `up → top → down → bottom`
      // (em t=0 começa inspirando). A baleia legacy precisa começar em `bottom` (peito vazio,
      // no fundo da tela, prestes a subir). Pulamos `up + top + down` para chegar lá.
      const intervalElapsedMs = breathCtx.sessionElapsedMs + d.upMs + d.topMs + d.downMs;
      const st = getIntervalBreathingState(intervalElapsedMs, cpm);

      p.intervalPhase = st.phase;
      p.y = centerY + st.yNormalized * curve.current;
      p.rotation = st.yNormalized * PLAYER_CONFIG.MAX_ROTATION;
      p.isRising = st.phase === 'top';

      advanceSpriteFrame(deltaTime);

      if (!isPaused && p.hasArrived && !isGameOver) {
        const prev = lastIntervalBreathPhaseRef.current;
        if (prev !== st.phase) {
          if (st.phase === 'top') {
            onInhalePhaseStart.current?.(d.topMs / 1000);
          }
          if (st.phase === 'bottom') {
            onExhalePhaseStart.current?.(d.bottomMs / 1000);
          }
          lastIntervalBreathPhaseRef.current = st.phase;
        }
      }

      intervalBreathPhase01Ref.current = st.breathPhase01;

      if (VISUAL_BREATH_INDICATOR_CONFIG.ENABLED && VISUAL_BREATH_INDICATOR_CONFIG.LAYOUT === 'topDown') {
        const frameDuration = 1000 / VISUAL_BREATH_INDICATOR_CONFIG.TOP_DOWN.ANIMATION_FPS;
        const inhale = breathEffectsRef.current.inhale;
        const exhale = breathEffectsRef.current.exhale;

        inhale.timer += deltaTime;
        exhale.timer += deltaTime;

        while (inhale.timer >= frameDuration) {
          inhale.timer -= frameDuration;
          inhale.frame = (inhale.frame + 1) % inhale.frameCount;
        }

        while (exhale.timer >= frameDuration) {
          exhale.timer -= frameDuration;
          exhale.frame = (exhale.frame + 1) % exhale.frameCount;
        }
      }
    },
    [advanceSpriteFrame, spriteHeight]
  );

  const drawPlayer = useCallback(
    (ctx: CanvasRenderingContext2D, _width: number, _height: number, ratio: number, isGameOver: boolean, isPaused: boolean): void => {
      const p = playerRef.current;
      const img = spriteRef.current;
      if (!img || !img.complete) return;

      if (
        VISUAL_BREATH_INDICATOR_CONFIG.ENABLED &&
        VISUAL_BREATH_INDICATOR_CONFIG.LAYOUT === 'topDown' &&
        p.hasArrived &&
        !isGameOver &&
        !isPaused
      ) {
        const inhale = breathEffectsRef.current.inhale;
        const exhale = breathEffectsRef.current.exhale;

        const ip = p.intervalPhase;
        const showInhale = ip === null ? p.isRising : ip === 'top';
        const showExhale = ip === null ? !p.isRising : ip === 'bottom';

        if (showInhale || showExhale) {
          const effect = showInhale ? inhale : exhale;

          if (effect.image && effect.image.complete) {
            const effectSize = p.width * VISUAL_BREATH_INDICATOR_CONFIG.TOP_DOWN.WIDTH_RATIO;
            const effectX = p.x + p.width * 0.5 - effectSize * 0.5;
            const offsetY = showInhale
              ? VISUAL_BREATH_INDICATOR_CONFIG.TOP_DOWN.INHALE_OFFSET_Y
              : VISUAL_BREATH_INDICATOR_CONFIG.TOP_DOWN.EXHALE_OFFSET_Y;
            const effectY = p.y - effectSize * offsetY;

            ctx.drawImage(
              effect.image,
              0,
              effect.frame * effect.frameSize,
              effect.frameSize,
              effect.frameSize,
              effectX,
              effectY,
              effectSize,
              effectSize
            );
          }
        }
      }

      ctx.save();
      ctx.translate(p.x + p.width * 0.5, p.y + p.height * 0.5);
      ctx.rotate(p.rotation);
      const glowInhale = p.intervalPhase === null ? p.isRising : p.intervalPhase === 'top';
      if (glowInhale && !isPaused && p.hasArrived && !isGameOver) {
        ctx.shadowColor = PLAYER_CONFIG.GLOW_COLOR;
        ctx.shadowBlur = PLAYER_CONFIG.GLOW_BLUR * ratio;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.filter = `brightness(${PLAYER_CONFIG.GLOW_BRIGHTNESS})`;
      }

      ctx.drawImage(img, 0, p.frameY * spriteHeight, spriteWidth, spriteHeight, -p.width * 0.5, -p.height * 0.5, p.width, p.height);

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.filter = 'none';
      ctx.restore();
    },
    [spriteHeight, spriteWidth]
  );

  const getBreathPhase = useCallback((): number => {
    const p = playerRef.current;
    if (p.intervalPhase === null) {
      return (-Math.sin(p.angle) + 1) / 2;
    }
    return intervalBreathPhase01Ref.current;
  }, []);

  return {
    updatePosition,
    drawPlayer,
    resize,
    reset,
    getIsRising: () => playerRef.current.isRising,
    getHasArrived: () => playerRef.current.hasArrived,
    getPlayerX: () => playerRef.current.x,
    getBreathPhase
  };
}
