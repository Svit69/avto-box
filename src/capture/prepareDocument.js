import { load } from 'cheerio';
import { transform } from 'esbuild';

export async function prepareDocument(html, sourceUrl, capturedAt) {
  const document = load(html);
  document('base, iframe, noscript, link[rel="preconnect"], link[rel="manifest"]').remove();
  document('link[rel="icon"], link[rel="apple-touch-icon"]').remove();
  document('head').prepend('<meta charset="utf-8">');
  for (const element of document('[src], [href], [poster]')) {
    for (const attribute of ['src', 'href', 'poster']) {
      const value = document(element).attr(attribute);
      if (!value || /^(#|data:|blob:|mailto:|tel:|javascript:)/.test(value)) continue;
      document(element).attr(attribute, new URL(value, sourceUrl).href);
    }
  }
  for (const element of document('script')) {
    const script = document(element);
    if (/metrika|revive|yandex|googletag/.test(script.attr('src') || '') || /\bym\(|counter\.yadro/.test(script.html())) {
      script.remove();
    } else if (!script.attr('src') && (!script.attr('type') || /javascript/.test(script.attr('type')))) {
      const result = await transform(script.html(), { minify: true, charset: 'utf8', legalComments: 'none' });
      script.text(result.code.replace(/<\/script/gi, '<\\/script'));
    }
  }
  document('[srcset]').removeAttr('srcset');
  document('[onload], [onclick], [onerror]').removeAttr('onload').removeAttr('onclick').removeAttr('onerror');
  document('form').attr('data-archive-form', '').removeAttr('action');
  document('head').append('<link rel="stylesheet" href="/archive.css">');
  document('head').append('<link rel="icon" type="image/png" href="/favicon.png">');
  document('head').prepend('<script>window.vv = window.visualViewport;</script>');
  document('body').append(`<aside class="archive-notice">Снимок матча · <time datetime="${capturedAt}"></time> · <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Источник: КХЛ</a></aside>`);
  document('body').append('<script type="module" src="/client/initializeArchive.js"></script>');
  return document.html().replace(/\r?\n\s*/g, ' ');
}
