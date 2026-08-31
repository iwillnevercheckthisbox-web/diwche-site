/**
 * The option-card glyphs.
 *
 * Line drawings rather than photographs: the reference funnel this follows uses
 * stock imagery of people, which we have none of and could not shoot honestly.
 * A 22px stroke mark in `currentColor` reads on both grounds, costs no request,
 * and keeps the card about its label rather than about a picture.
 */
export const ICONS: Record<string, string> = {
  mine: '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M4 20a8 8 0 0 1 16 0"/>',
  client:
    '<path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M2 20a7 7 0 0 1 14 0"/><path d="M16 6.5a3 3 0 0 1 0 5.9"/><path d="M18 14.5a6 6 0 0 1 4 5.5"/>',
  seed: '<path d="M12 21v-7"/><path d="M12 14c0-4 3-7 8-7 0 5-3 8-8 7Z"/><path d="M12 16c0-3-2.5-5-6-5 0 3.5 2.5 5.5 6 5Z"/>',
  reel: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 9 5 3-5 3V9Z"/>',
  carousel:
    '<rect x="7" y="5" width="10" height="14" rx="2"/><path d="M4 8v8"/><path d="M20 8v8"/>',
  photo:
    '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="m4 17 5-4 4 3 3-2 4 3"/>',
  story: '<path d="M12 3a9 9 0 1 1-9 9" stroke-dasharray="3 3"/><path d="M12 8v8"/><path d="M8 12h8"/>',
  none: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  idea: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 1 4 10.5V15H8v-1.5A6 6 0 0 1 12 3Z"/>',
  camera:
    '<path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.5"/>',
  cut: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5 20 18"/><path d="M8 16.5 20 6"/>',
  words: '<path d="M4 6h16"/><path d="M4 12h11"/><path d="M4 18h7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  daily: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  weekly: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M8 15h8"/>',
  shrug: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.8-2.5 2-2.5 3.5"/><path d="M12 17h.01"/>',
  spark: '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/>',
  // Two bubbles rather than one: the point of this option is the exchange, not
  // the message.
  chat: '<path d="M8 14H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/><path d="M18 9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v3l-3.5-3H10a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"/>',
  palette:
    '<path d="M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-1.4-1-1.6-1-2.5 0-.8.7-1.5 1.5-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z"/><path d="M7.5 12h.01M10 8.5h.01M14.5 8h.01"/>',
};
