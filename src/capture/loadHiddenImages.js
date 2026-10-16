export async function loadHiddenImages(page) {
  await page.evaluate(async () => {
    const urls = [...new Set([...document.images].map(image => image.src).filter(Boolean))];
    await Promise.all(urls.map(url => new Promise(resolve => {
      const image = new Image();
      image.onload = image.onerror = resolve;
      image.src = url;
      setTimeout(resolve, 8000);
    })));
  });
}
