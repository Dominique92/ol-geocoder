export function injectFile(file) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = file;
    script.type = 'text/javascript';
    script.defer = true;
    document.getElementsByTagName('head').item(0).appendChild(script);
    script.onload = () => resolve;
    script.onerror = () => reject;
  });
}
