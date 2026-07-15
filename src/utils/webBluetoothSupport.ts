import type { Browser, Platform, WebBluetoothSupportResult } from '../types';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('linux') && !ua.includes('android')) return 'linux';
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
  if (ua.includes('mac')) return 'mac';
  if (ua.includes('win')) return 'windows';
  return 'unknown';
}

function detectBrowser(): { browser: Browser; chromeVersion: number | null } {
  if (typeof navigator === 'undefined') return { browser: 'unknown', chromeVersion: null };
  const ua = navigator.userAgent;
  const uaLower = ua.toLowerCase();

  if (uaLower.includes('edg/')) {
    const match = ua.match(/Edg\/(\d+)/);
    return { browser: 'edge', chromeVersion: match ? parseInt(match[1], 10) : null };
  }
  if (uaLower.includes('opr/') || uaLower.includes('opera')) {
    const match = ua.match(/OPR\/(\d+)|Opera\/(\d+)/);
    return { browser: 'opera', chromeVersion: match ? parseInt(match[1] || match[2] || '0', 10) : null };
  }
  if (uaLower.includes('firefox')) return { browser: 'firefox', chromeVersion: null };
  if (uaLower.includes('samsungbrowser')) return { browser: 'samsung', chromeVersion: null };
  if (uaLower.includes('safari') && !uaLower.includes('chrome')) return { browser: 'safari', chromeVersion: null };
  if (uaLower.includes('chrome')) {
    const match = ua.match(/Chrome\/(\d+)/);
    return { browser: 'chrome', chromeVersion: match ? parseInt(match[1], 10) : null };
  }
  return { browser: 'unknown', chromeVersion: null };
}

const MIN_CHROME_VERSION = 56;

export function getWebBluetoothSupport(): WebBluetoothSupportResult {
  const platform = detectPlatform();
  const { browser, chromeVersion } = detectBrowser();
  const hasBluetoothApi = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  const isChromeFamily = browser === 'chrome' || browser === 'edge' || browser === 'opera' || browser === 'samsung';

  if (browser === 'firefox') {
    return {
      supported: false,
      platform,
      browser,
      chromeVersion: null,
      showWarning: true,
      shortLabel: 'Problemas com o navegador?',
      disableConnect: true,
      message: 'O Firefox não suporta Web Bluetooth. Para usar o sensor, abra o jogo no Chrome ou no Edge.'
    };
  }

  if (browser === 'safari' || platform === 'ios') {
    return {
      supported: false,
      platform,
      browser,
      chromeVersion: null,
      showWarning: true,
      shortLabel: platform === 'ios' ? 'Problemas no iPhone?' : 'Problemas no Mac?',
      disableConnect: true,
      message:
        platform === 'ios'
          ? 'O iPhone não suporta Web Bluetooth. Use um dispositivo Android ou um computador com Chrome/Edge para conectar o sensor.'
          : 'O Safari não suporta Web Bluetooth. Use o Chrome ou o Edge no Mac para conectar o sensor.'
    };
  }

  if (isChromeFamily && chromeVersion !== null && chromeVersion < MIN_CHROME_VERSION) {
    return {
      supported: false,
      platform,
      browser,
      chromeVersion,
      showWarning: true,
      shortLabel: 'Navegador desatualizado?',
      disableConnect: true,
      message: `Seu navegador está desatualizado (versão ${chromeVersion}). O Web Bluetooth requer Chrome/Edge ${MIN_CHROME_VERSION}+. Atualize o navegador e tente novamente.`
    };
  }

  if (platform === 'linux' && hasBluetoothApi) {
    return {
      supported: true,
      platform,
      browser,
      chromeVersion,
      showWarning: true,
      shortLabel: 'Problemas com Linux?',
      disableConnect: false,
      message:
        'No Linux, talvez seja necessário: 1) Ativar a flag "Enable experimental web platform features" em chrome://flags e reiniciar; 2) Habilitar Bluetooth nas configurações do sistema.'
    };
  }

  if (platform === 'linux' && !hasBluetoothApi) {
    return {
      supported: false,
      platform,
      browser,
      chromeVersion,
      showWarning: true,
      shortLabel: 'Problemas com Linux?',
      disableConnect: true,
      message: 'No Linux use Chrome ou Edge. Em chrome://flags ative "Enable experimental web platform features" e reinicie o navegador.'
    };
  }

  if (hasBluetoothApi) {
    return {
      supported: true,
      platform,
      browser,
      chromeVersion,
      showWarning: false,
      shortLabel: '',
      disableConnect: false,
      message: ''
    };
  }

  return {
    supported: false,
    platform,
    browser,
    chromeVersion,
    showWarning: true,
    shortLabel: 'Problemas ao conectar?',
    disableConnect: true,
    message: 'Web Bluetooth não está disponível neste navegador. Use Chrome ou Edge para conectar o sensor.'
  };
}

export function formatBluetoothError(rawMessage: string): string {
  const msg = rawMessage.toLowerCase();

  const isIframeContext = (() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  if (msg.includes('dispositivo não selecionado') || msg.includes('user cancelled') || msg.includes('request device chooser')) {
    return 'Nenhum dispositivo selecionado. Verifique se o sensor está ligado e próximo, depois tente novamente.';
  }
  if (msg.includes('gatt operation already in progress')) {
    return 'Operação em andamento. Aguarde alguns segundos e tente conectar novamente.';
  }
  if (msg.includes('network') || msg.includes('connection') || msg.includes('failed to connect')) {
    return 'Falha na conexão. Verifique se o sensor está ligado, próximo e com bateria. Tente novamente.';
  }
  if (msg.includes('permission') || msg.includes('security') || msg.includes('denied')) {
    if (isIframeContext) {
      return 'Permissão bloqueada pela plataforma (iframe). O domínio pai precisa liberar Bluetooth no iframe (`allow="bluetooth"` e cabeçalho `Permissions-Policy`).';
    }
    return 'Permissão negada. Aceite o acesso ao Bluetooth quando solicitado.';
  }
  if (msg.includes('not found') || msg.includes('notfound')) {
    return 'Dispositivo não encontrado. Verifique se o sensor está ligado e próximo.';
  }
  if (msg.includes('user gesture') || msg.includes('gesture')) {
    return 'É necessário clicar no botão para iniciar a conexão. Tente novamente.';
  }
  return `Erro: ${rawMessage}`;
}
