export const REPORT_PATH = '/reports/student-life';
export function reportTarget(pathname) {
  if (pathname === REPORT_PATH || pathname === `${REPORT_PATH}/` || pathname === `${REPORT_PATH}/index.html`) return '/';
  if (/^\/_data\/(?:charts|components)\/[^/]+(?:\/detail)?$/.test(pathname)) return pathname;
  if (['/api/snapshot', '/api/snapshot/head', '/api/query-rows', '/api/presentation', '/api/queries'].includes(pathname)) return pathname;
  if (pathname.startsWith('/api/queries/') || pathname.startsWith('/api/deployment-assets/')) return pathname;
  return null;
}
