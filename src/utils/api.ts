import { handleStandaloneRequest, subscribeLocalSync } from './standaloneApi';

let standaloneMode = false;

export function isStandaloneMode(): boolean {
  return standaloneMode;
}

export { subscribeLocalSync };

export async function apiRequest(url: string, init?: RequestInit): Promise<Response> {
  if (standaloneMode) {
    return handleStandaloneRequest(url, init);
  }

  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    // Static hosts (Vercel, Netlify, GitHub Pages, Hostinger) either return 404/405/501
    // without JSON or serve index.html (200 text/html) for unknown /api/* routes.
    if (!isJson && (res.ok || res.status === 404 || res.status === 405 || res.status >= 500)) {
      standaloneMode = true;
      return handleStandaloneRequest(url, init);
    }

    return res;
  } catch {
    standaloneMode = true;
    return handleStandaloneRequest(url, init);
  }
}
