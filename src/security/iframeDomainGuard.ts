import { blockedDomainStyles } from './iframeDomainGuard.styles';
import type { IframeDomainGuardResult } from '../types';
import { GAME_DEPLOY_ORIGIN, PORTAL_ORIGIN } from '../utils/constants';

function parseAllowedOrigins(raw: string | undefined): string[] {
  if (!raw) return [];

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return '';
      }
    })
    .filter(Boolean);
}

function shouldEnforceIframeDomain(): boolean {
  const flag = import.meta.env.VITE_ENFORCE_IFRAME_DOMAIN;
  if (flag === 'false') return false;
  if (flag === 'true') return true;
  return import.meta.env.PROD;
}

function isLocalhostPage(): boolean {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function buildAllowedParentOrigins(): string[] {
  const fromEnv = parseAllowedOrigins(import.meta.env.VITE_ALLOWED_IFRAME_ORIGINS);
  return [...new Set([PORTAL_ORIGIN, ...fromEnv])];
}

function buildAllowedTopLevelOrigins(): string[] {
  const fromEnv = parseAllowedOrigins(import.meta.env.VITE_ALLOWED_GAME_ORIGINS);
  return [...new Set([GAME_DEPLOY_ORIGIN, ...fromEnv])];
}

function isAllowedTopLevelGamePage(): boolean {
  try {
    return buildAllowedTopLevelOrigins().includes(window.location.origin);
  } catch {
    return false;
  }
}

function isInsideIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function getParentOrigin(): string | null {
  try {
    if (!document.referrer) return null;
    return new URL(document.referrer).origin;
  } catch {
    return null;
  }
}

export function enforceIframeDomainGuard(): IframeDomainGuardResult {
  if (!shouldEnforceIframeDomain()) {
    return { allowed: true };
  }

  if (isLocalhostPage()) {
    return { allowed: true };
  }

  if (!isInsideIframe()) {
    if (isAllowedTopLevelGamePage()) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason:
        'Acesso bloqueado: abra pelo portal (keepweb), pelo endereço oficial do jogo ou em localhost para desenvolvimento.'
    };
  }

  const allowedOrigins = buildAllowedParentOrigins();
  const parentOrigin = getParentOrigin();
  if (!parentOrigin) {
    return {
      allowed: false,
      reason: 'Acesso bloqueado: não foi possível validar o domínio do iframe pai.'
    };
  }

  if (!allowedOrigins.includes(parentOrigin)) {
    return {
      allowed: false,
      reason: `Acesso bloqueado: domínio não autorizado (${parentOrigin}).`
    };
  }

  return { allowed: true };
}

export function renderBlockedDomainMessage(message: string): void {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = '';

  const container = document.createElement('div');
  Object.assign(container.style, blockedDomainStyles.container);

  const content = document.createElement('div');
  const title = document.createElement('h1');
  const description = document.createElement('p');

  Object.assign(title.style, blockedDomainStyles.title);
  Object.assign(description.style, blockedDomainStyles.description);

  title.textContent = 'Acesso não permitido';
  description.textContent = message;

  content.appendChild(title);
  content.appendChild(description);
  container.appendChild(content);
  root.appendChild(container);
}
