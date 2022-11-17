export function injectFile(file) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.src = file;
    script.type = 'text/javascript';
    script.defer = true;
    document.querySelectorAll('head').item(0).append(script);
    script.addEventListener('load', () => resolve);
    script.addEventListener('error', () => reject);
  });
}
