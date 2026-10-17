export function initializeMhlStatistics() {
  const selectTeamStatistics = () => document.querySelector('.left_menu_section_item[data-id="statTeams"]')?.click();
  if (document.readyState === 'complete') selectTeamStatistics();
  else document.addEventListener('DOMContentLoaded', () => setTimeout(selectTeamStatistics, 0), { once: true });
}
