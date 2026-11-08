/**
 * TrackWheel Icons Module
 * Inline SVG icon functions based on Lucide icon set.
 * Exposed as window.Icons
 */
(function () {
  'use strict';

  var ns = 'http://www.w3.org/2000/svg';
  var defaultAttrs = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

  function svg(size, inner) {
    return '<svg xmlns="' + ns + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" ' + defaultAttrs + '>' + inner + '</svg>';
  }

  window.Icons = {

    Bike: function (size) {
      size = size || 24;
      return svg(size,
        '<circle cx="18.5" cy="17.5" r="3.5"/>' +
        '<circle cx="5.5" cy="17.5" r="3.5"/>' +
        '<circle cx="15" cy="5" r="1"/>' +
        '<path d="M12 17.5V14l-3-3 4-3 2 3h2"/>'
      );
    },

    Clock: function (size) {
      size = size || 24;
      return svg(size,
        '<circle cx="12" cy="12" r="10"/>' +
        '<polyline points="12 6 12 12 16 14"/>'
      );
    },

    Search: function (size) {
      size = size || 24;
      return svg(size,
        '<circle cx="11" cy="11" r="8"/>' +
        '<path d="m21 21-4.3-4.3"/>'
      );
    },

    QrCode: function (size) {
      size = size || 24;
      return svg(size,
        '<rect width="5" height="5" x="3" y="3" rx="1"/>' +
        '<rect width="5" height="5" x="16" y="3" rx="1"/>' +
        '<rect width="5" height="5" x="3" y="16" rx="1"/>' +
        '<path d="M21 16h-3a2 2 0 0 0-2 2v3"/>' +
        '<path d="M21 21v.01"/>' +
        '<path d="M12 7v3a2 2 0 0 1-2 2H7"/>' +
        '<path d="M3 12h.01"/>' +
        '<path d="M12 3h.01"/>' +
        '<path d="M12 16v.01"/>' +
        '<path d="M16 12h1"/>' +
        '<path d="M21 12v.01"/>' +
        '<path d="M12 21v-1"/>'
      );
    },

    Filter: function (size) {
      size = size || 24;
      return svg(size,
        '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'
      );
    },

    Plus: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M5 12h14"/>' +
        '<path d="M12 5v14"/>'
      );
    },

    Phone: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'
      );
    },

    AlertCircle: function (size) {
      size = size || 24;
      return svg(size,
        '<circle cx="12" cy="12" r="10"/>' +
        '<line x1="12" x2="12" y1="8" y2="12"/>' +
        '<line x1="12" x2="12.01" y1="16" y2="16"/>'
      );
    },

    RefreshCw: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>' +
        '<path d="M21 3v5h-5"/>' +
        '<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>' +
        '<path d="M3 21v-5h5"/>'
      );
    },

    ShieldCheck: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>' +
        '<path d="m9 12 2 2 4-4"/>'
      );
    },

    PlusCircle: function (size) {
      size = size || 24;
      return svg(size,
        '<circle cx="12" cy="12" r="10"/>' +
        '<path d="M8 12h8"/>' +
        '<path d="M12 8v8"/>'
      );
    },

    DollarSign: function (size) {
      size = size || 24;
      return svg(size,
        '<line x1="12" x2="12" y1="2" y2="22"/>' +
        '<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'
      );
    },

    X: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M18 6 6 18"/>' +
        '<path d="m6 6 12 12"/>'
      );
    },

    Camera: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>' +
        '<circle cx="12" cy="13" r="3"/>'
      );
    },

    Upload: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
        '<polyline points="17 8 12 3 7 8"/>' +
        '<line x1="12" x2="12" y1="3" y2="15"/>'
      );
    },

    Sparkles: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>' +
        '<path d="M20 3v4"/>' +
        '<path d="M22 5h-4"/>'
      );
    },

    CheckCircle2: function (size) {
      size = size || 24;
      return svg(size,
        '<circle cx="12" cy="12" r="10"/>' +
        '<path d="m9 12 2 2 4-4"/>'
      );
    },

    AlertTriangle: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' +
        '<path d="M12 9v4"/>' +
        '<path d="M12 17h.01"/>'
      );
    },

    PhoneCall: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>' +
        '<path d="M14.05 2a9 9 0 0 1 8 7.94"/>' +
        '<path d="M14.05 6A5 5 0 0 1 18 10"/>'
      );
    },

    LogOut: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>' +
        '<polyline points="16 17 21 12 16 7"/>' +
        '<line x1="21" x2="9" y1="12" y2="12"/>'
      );
    },

    Eye: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>' +
        '<circle cx="12" cy="12" r="3"/>'
      );
    },

    Download: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
        '<polyline points="7 10 12 15 17 10"/>' +
        '<line x1="12" x2="12" y1="15" y2="3"/>'
      );
    },

    Calendar: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M8 2v4"/>' +
        '<path d="M16 2v4"/>' +
        '<rect width="18" height="18" x="3" y="4" rx="2"/>' +
        '<path d="M3 10h18"/>'
      );
    },

    CheckCircle: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>' +
        '<path d="m9 11 3 3L22 4"/>'
      );
    },

    Send: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="m22 2-7 20-4-9-9-4Z"/>' +
        '<path d="m22 2-11 11"/>'
      );
    },

    Smartphone: function (size) {
      size = size || 24;
      return svg(size,
        '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>' +
        '<path d="M12 18h.01"/>'
      );
    },

    Check: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M20 6 9 17l-5-5"/>'
      );
    },

    Printer: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>' +
        '<path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/>' +
        '<rect x="6" y="14" width="12" height="8" rx="1"/>'
      );
    },

    Copy: function (size) {
      size = size || 24;
      return svg(size,
        '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>' +
        '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'
      );
    },

    MessageSquare: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
      );
    },

    ShieldAlert: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>' +
        '<path d="M12 8v4"/>' +
        '<path d="M12 16h.01"/>'
      );
    },

    Calculator: function (size) {
      size = size || 24;
      return svg(size,
        '<rect width="16" height="20" x="4" y="2" rx="2"/>' +
        '<line x1="8" x2="16" y1="6" y2="6"/>' +
        '<line x1="16" x2="16" y1="14" y2="18"/>' +
        '<path d="M16 10h.01"/>' +
        '<path d="M12 10h.01"/>' +
        '<path d="M8 10h.01"/>' +
        '<path d="M12 14h.01"/>' +
        '<path d="M8 14h.01"/>' +
        '<path d="M12 18h.01"/>' +
        '<path d="M8 18h.01"/>'
      );
    },

    Lock: function (size) {
      size = size || 24;
      return svg(size,
        '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>' +
        '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
      );
    },

    Tag: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>' +
        '<circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>'
      );
    },

    ParkingCircle: function (size) {
      size = size || 24;
      return svg(size,
        '<circle cx="12" cy="12" r="10"/>' +
        '<path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>'
      );
    },

    IndianRupee: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M6 3h12"/>' +
        '<path d="M6 8h12"/>' +
        '<path d="m6 13 8.5 8"/>' +
        '<path d="M6 13h3"/>' +
        '<path d="M9 13c6.667 0 6.667-10 0-10"/>'
      );
    },

    PersonStanding: function (size) {
      size = size || 24;
      return svg(size,
        '<circle cx="12" cy="5" r="1"/>' +
        '<path d="m9 20 3-6 3 6"/>' +
        '<path d="m6 8 6 2 6-2"/>' +
        '<path d="M12 10v4"/>'
      );
    },

    ClipboardList: function (size) {
      size = size || 24;
      return svg(size,
        '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>' +
        '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>' +
        '<path d="M12 11h4"/>' +
        '<path d="M12 16h4"/>' +
        '<path d="M8 11h.01"/>' +
        '<path d="M8 16h.01"/>'
      );
    },

    History: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>' +
        '<path d="M3 3v5h5"/>' +
        '<path d="M12 7v5l4 2"/>'
      );
    },

    UserCheck: function (size) {
      size = size || 24;
      return svg(size,
        '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>' +
        '<circle cx="9" cy="7" r="4"/>' +
        '<polyline points="16 11 18 13 22 9"/>'
      );
    }
  };

  // Safe fallback handler so no missing icon ever crashes the UI
  if (typeof Proxy !== 'undefined') {
    window.Icons = new Proxy(window.Icons, {
      get: function (target, prop) {
        if (prop in target) return target[prop];
        return function (size) {
          size = size || 24;
          return svg(size, '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>');
        };
      }
    });
  }
})();
