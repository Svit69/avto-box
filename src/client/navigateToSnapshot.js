export function navigateToSnapshot(match, version) {
  const destination = new URL(match.mirrorUrl, window.location.origin);
  destination.searchParams.set('view', version);
  if (destination.href === window.location.href) window.location.reload();
  else window.location.replace(destination.href);
}
