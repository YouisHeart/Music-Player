/**
 * Central icon sprite. Every glyph is a 24×24 SVG fragment so icons stay
 * consistent and ship as a single lightweight module instead of a font.
 */
export const ICONS = {
  play: '<path d="M8.6 5.5v13l10.7-6.5z" fill="currentColor" stroke="none"/>',
  pause:
    '<rect x="7" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" stroke="none"/>' +
    '<rect x="13.6" y="5" width="3.4" height="14" rx="1.2" fill="currentColor" stroke="none"/>',
  prev:
    '<path d="M18 5.8v12.4L9.4 12z" fill="currentColor" stroke="none"/>' +
    '<rect x="5" y="5" width="2.2" height="14" rx="1" fill="currentColor" stroke="none"/>',
  next:
    '<path d="M6 5.8v12.4L14.6 12z" fill="currentColor" stroke="none"/>' +
    '<rect x="16.8" y="5" width="2.2" height="14" rx="1" fill="currentColor" stroke="none"/>',
  shuffle:
    '<path d="M16 3.5h4.5V8"/><path d="M20.5 3.5 4 20"/><path d="M20.5 16v4.5H16"/>' +
    '<path d="m15.2 15.2 5.3 5.3"/><path d="m4 4 5.2 5.2"/>',
  repeat:
    '<path d="m17 2.8 3.6 3.6L17 10"/><path d="M3.5 11.2V9.6A3.3 3.3 0 0 1 6.8 6.3h13.8"/>' +
    '<path d="m7 21.2-3.6-3.6L7 14"/><path d="M20.5 12.8v1.6a3.3 3.3 0 0 1-3.3 3.3H3.5"/>',
  volume:
    '<path d="M4 9.4h3.1L12 5.3v13.4L7.1 14.6H4z"/>' +
    '<path d="M15.4 9.1a4.1 4.1 0 0 1 0 5.8"/><path d="M18 6.6a7.6 7.6 0 0 1 0 10.8"/>',
  volumeLow:
    '<path d="M4 9.4h3.1L12 5.3v13.4L7.1 14.6H4z"/><path d="M15.4 9.1a4.1 4.1 0 0 1 0 5.8"/>',
  mute:
    '<path d="M4 9.4h3.1L12 5.3v13.4L7.1 14.6H4z"/><path d="m16 9.5 5 5"/><path d="m21 9.5-5 5"/>',
  heart:
    '<path d="M20.6 4.9a5.2 5.2 0 0 0-7.4 0L12 6.1l-1.2-1.2a5.2 5.2 0 0 0-7.4 7.4L12 20.9l8.6-8.6a5.2 5.2 0 0 0 0-7.4z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  minimize: '<path d="M5 12h14"/>',
  maximize: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  restore: '<rect x="4.5" y="8" width="11.5" height="11.5" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"/>',
  folderPlus:
    '<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.6l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7.2A2.3 2.3 0 0 1 18.2 19H5.8a2.3 2.3 0 0 1-2.3-2.3z"/>' +
    '<path d="M12 11.5v5M9.5 14h5"/>',
  folder:
    '<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.6l2 2H18a2.5 2.5 0 0 1 2.5 2.5v7.2A2.3 2.3 0 0 1 18.2 19H5.8a2.3 2.3 0 0 1-2.3-2.3z"/>',
  uploadCloud:
    '<path d="M7 17.5a4.5 4.5 0 0 1-.7-8.95A6 6 0 0 1 18 10.2a4 4 0 0 1 .6 7.95"/>' +
    '<path d="M12 19V11"/><path d="m8.8 14.2 3.2-3.2 3.2 3.2"/>',
  download: '<path d="M12 4v11"/><path d="m7.8 11.2 4.2 4.2 4.2-4.2"/><path d="M5 20h14"/>',
  music:
    '<path d="M9 18V5.5l11-2v12.8"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16.3" r="2.5"/>',
  disc:
    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2"/>' +
    '<path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" opacity=".45"/>',
  listMusic:
    '<path d="M4 6.5h10M4 11.5h8M4 16.5h6"/><path d="M18.5 5v9.2"/><circle cx="16.3" cy="16.6" r="2.2"/>',
  playlist:
    '<path d="M4 6h11M4 11h8M4 16h6"/><path d="m15 14 5 3-5 3z"/>',
  library:
    '<rect x="4" y="4" width="6" height="16" rx="1.5"/><rect x="14" y="4" width="6" height="16" rx="1.5"/><path d="M7 8h0M17 8h0"/>',
  settings:
    '<path d="M4 7h7M15 7h5M4 17h5M13 17h7"/><circle cx="13" cy="7" r="2"/><circle cx="11" cy="17" r="2"/>',
  palette:
    '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.9-.8 1.9-1.8 0-.5-.2-1-.5-1.4-.3-.4-.5-.8-.5-1.3 0-1 .8-1.7 1.8-1.7h1.5a3.8 3.8 0 0 0 3.8-3.8c0-3.9-3.6-7-8.2-7z"/>' +
    '<circle cx="7.6" cy="10.2" r=".9" fill="currentColor" stroke="none"/><circle cx="10.2" cy="7.2" r=".9" fill="currentColor" stroke="none"/><circle cx="14.4" cy="7.2" r=".9" fill="currentColor" stroke="none"/>',
  image:
    '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5.2-5 3.6 3.4 2.7-2.4L20 17.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.2"/><circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none"/>',
  check: '<path d="m5 12.5 4.4 4.5L19 6.5"/>',
  chevronLeft: '<path d="m14.5 5-7 7 7 7"/>',
  chevronRight: '<path d="m9.5 5 7 7-7 7"/>',
  chevronDown: '<path d="m5 9.5 7 7 7-7"/>',
  trash:
    '<path d="M4.5 7h15"/><path d="M9 7V4.8h6V7"/><path d="M6.5 7l.8 12.2a1.8 1.8 0 0 0 1.8 1.7h5.8a1.8 1.8 0 0 0 1.8-1.7L17.5 7"/>' +
    '<path d="M10 11v6M14 11v6"/>',
  keyboard:
    '<rect x="2.8" y="6.5" width="18.4" height="11" rx="2.2"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M6.5 13.5h.01M10 13.5h.01M13.5 13.5h.01M17 13.5h.01M8 16.5h8"/>',
  equalizer:
    '<path d="M6 20V11M6 7V4M12 20v-5M12 11V4M18 20v-9M18 7V4"/>',
  lyrics:
    '<path d="M4 6h16M4 10.5h10M4 15h13M4 19.5h7"/><path d="M18.5 8.5v6"/>',
  sparkles:
    '<path d="m12 3 1.6 4.6L18 9.2l-4.4 1.7L12 15.5l-1.6-4.6L6 9.2l4.4-1.6z"/>' +
    '<path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>' +
    '<path d="m5 14 .6 1.6L7.2 16l-1.6.6L5 18.2l-.6-1.6L2.8 16l1.6-.4z"/>',
  reset: '<path d="M4 10a8 8 0 1 1 2.2 6.7"/><path d="M4 5v5h5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  headphones:
    '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3.5" y="13" width="4" height="6.5" rx="2"/><rect x="16.5" y="13" width="4" height="6.5" rx="2"/>',
  arrowRight: '<path d="M4 12h15"/><path d="m13.5 6 6 6-6 6"/>',
  arrowLeft: '<path d="M20 12H5"/><path d="m10.5 6-6 6 6 6"/>',
  wave:
    '<path d="M3 12h2.2M8 7.5v9M12 4v16M16 8.5v7M20 11h1.5"/>',
  pin:
    '<path d="m9 3 6 0-1 5 3 3-5 1-2 6-1-6-5-1 3-3z"/>',
  grid:
    '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  monitor:
    '<rect x="3" y="4.5" width="18" height="12.5" rx="2"/><path d="M9 20h6M12 17v3"/>',
  gauge:
    '<path d="M4.5 17a8.5 8.5 0 1 1 15 0"/><path d="m12 14 3.5-4"/><circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none"/>',
  flower:
    '<circle cx="12" cy="12" r="2.2"/><path d="M12 9.8c0-3 1.6-5.3 3.3-5.3 1.5 0 2.4 1.7 1.8 3.4-.5 1.6-2.4 3-5.1 1.9zM14.2 12c3 0 5.3 1.6 5.3 3.3 0 1.5-1.7 2.4-3.4 1.8-1.6-.5-3-2.4-1.9-5.1zM12 14.2c0 3-1.6 5.3-3.3 5.3-1.5 0-2.4-1.7-1.8-3.4.5-1.6 2.4-3 5.1-1.9zM9.8 12c-3 0-5.3-1.6-5.3-3.3 0-1.5 1.7-2.4 3.4-1.8 1.6.5 3 2.4 1.9 5.1z"/>',
}

export const ICON_NAMES = Object.keys(ICONS)
