// ============================================================================
// TrackWheel - Main Application (Vanilla JS)
// ============================================================================

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const state = {
    entries: [],
    activeTab: 'ACTIVE',        // 'ACTIVE' | 'HISTORY'
    searchTerm: '',
    historySearchTerm: '',
    filterCategory: 'ALL',      // 'ALL' | 'BIKE' | 'BICYCLE' | 'OVERSTAY'
    modals: {
      newEntry: false,
      token: false,
      checkout: false,
      cashDrawer: false,
      qrScanner: false,
    },
    selectedEntry: null,
    newlyCreatedEntry: null,
    clockText: '',
    // New-entry form state
    newEntryForm: {
      type: 'BIKE',
      regNumber: '',
      phone: '',
      cycleColor: '',
      cycleType: '',
      notes: '',
      photoDataUrl: null,
      frequentMatch: null,
    },
    // Cash drawer form state
    cashDrawerForm: {
      d500: 0, d200: 0, d100: 0, d50: 0, d20: 0, d10: 0, coins: 0,
    },
    // Checkout
    checkoutNotes: '',
    // Camera
    cameraStream: null,
  };

  // Configuration
  const OVERSTAY_THRESHOLD_HOURS = 8;

  // Timers
  let clockInterval = null;
  let elapsedInterval = null;
  let qrScannerInstance = null;

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function formatTime(date) {
    if (!date) return '--';
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function formatDate(date) {
    if (!date) return '--';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatDateTime(date) {
    if (!date) return '--';
    return formatDate(date) + ', ' + formatTime(date);
  }

  function formatDuration(inTime) {
    const now = Date.now();
    const diff = now - new Date(inTime).getTime();
    if (diff < 0) return '0h 00m 00s';
    const totalSec = Math.floor(diff / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  }

  function formatDurationBetween(inTime, outTime) {
    const diff = new Date(outTime).getTime() - new Date(inTime).getTime();
    if (diff < 0) return '0h 00m';
    const totalMin = Math.floor(diff / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }

  function isOverstay(inTime) {
    const diff = Date.now() - new Date(inTime).getTime();
    return diff >= OVERSTAY_THRESHOLD_HOURS * 3600 * 1000;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getNowClock() {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) +
      ' | ' + now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  // --------------------------------------------------------------------------
  // Data Access (wraps Storage)
  // --------------------------------------------------------------------------
  function loadEntries() {
    state.entries = Storage.getEntries();
  }

  function getActiveEntries() {
    let list = state.entries.filter(e => e.status === 'ACTIVE');
    const term = state.searchTerm.toLowerCase().trim();
    if (term) {
      list = list.filter(e =>
        (e.tokenId && e.tokenId.toLowerCase().includes(term)) ||
        (e.phone && e.phone.includes(term)) ||
        (e.regNumber && e.regNumber.toLowerCase().includes(term)) ||
        (e.cycleColor && e.cycleColor.toLowerCase().includes(term))
      );
    }
    if (state.filterCategory === 'BIKE') list = list.filter(e => e.type === 'BIKE');
    else if (state.filterCategory === 'BICYCLE') list = list.filter(e => e.type === 'BICYCLE');
    else if (state.filterCategory === 'OVERSTAY') list = list.filter(e => isOverstay(e.inTime));
    return list;
  }

  function getHistoryEntries() {
    let list = state.entries.filter(e => e.status === 'COMPLETED');
    const term = state.historySearchTerm.toLowerCase().trim();
    if (term) {
      list = list.filter(e =>
        (e.tokenId && e.tokenId.toLowerCase().includes(term)) ||
        (e.phone && e.phone.includes(term)) ||
        (e.regNumber && e.regNumber.toLowerCase().includes(term)) ||
        (e.cycleColor && e.cycleColor.toLowerCase().includes(term))
      );
    }
    return list.sort((a, b) => new Date(b.outTime) - new Date(a.outTime));
  }

  function getActiveCount() {
    return state.entries.filter(e => e.status === 'ACTIVE').length;
  }

  function getOverstayCount() {
    return state.entries.filter(e => e.status === 'ACTIVE' && isOverstay(e.inTime)).length;
  }

  // --------------------------------------------------------------------------
  // Render – Navbar
  // --------------------------------------------------------------------------
  function renderNavbar() {
    const activeCount = getActiveCount();
    const overstayCount = getOverstayCount();
    return `
    <nav class="navbar">
      <div class="navbar-inner">
        <div class="navbar-brand">
          ${Icons.ParkingCircle(22)}
          <span class="brand-text">TrackWheel</span>
        </div>
        <div class="navbar-center">
          <div class="navbar-clock">${Icons.Clock(14)}<span id="navbar-clock-text">${state.clockText || getNowClock()}</span></div>
          <div class="navbar-stats">
            <span class="stat-badge stat-active">${Icons.Bike(13)} <strong>${activeCount}</strong> Active</span>
            <span class="stat-badge stat-overstay ${overstayCount > 0 ? 'has-overstay' : ''}">${Icons.AlertTriangle(13)} <strong>${overstayCount}</strong> Overstay</span>
          </div>
        </div>
        <div class="navbar-actions">
          <button class="btn btn-ghost" data-action="refresh" title="Refresh">${Icons.RefreshCw(16)}</button>
          <button class="btn btn-outline" data-action="openCashDrawer">${Icons.IndianRupee(15)} Cash Drawer</button>
          <button class="btn btn-primary" data-action="openNewEntry">${Icons.Plus(16)} New Entry</button>
        </div>
      </div>
    </nav>`;
  }

  // --------------------------------------------------------------------------
  // Render – Search Banner
  // --------------------------------------------------------------------------
  function renderSearchBanner() {
    const filters = [
      { key: 'ALL', label: 'All' },
      { key: 'BIKE', label: 'Bikes', icon: Icons.Bike(13) },
      { key: 'BICYCLE', label: 'Bicycles', icon: Icons.PersonStanding(13) },
      { key: 'OVERSTAY', label: 'Overstay', icon: Icons.AlertTriangle(13) },
    ];
    return `
    <div class="search-banner">
      <div class="search-banner-inner">
        <div class="search-input-wrap">
          ${Icons.Search(16)}
          <input type="text" id="main-search" class="search-input" placeholder="Quick exit: token, phone, last 4 digits, reg number, cycle colour…" value="${escapeHtml(state.searchTerm)}" />
          <button class="btn btn-icon btn-qr-scan" data-action="openQrScanner" title="Scan QR">${Icons.QrCode(18)}</button>
        </div>
        <div class="filter-group">
          ${filters.map(f => `<button class="filter-btn ${state.filterCategory === f.key ? 'active' : ''}" data-action="setFilter" data-filter="${f.key}">${f.icon || ''}${f.label}</button>`).join('')}
        </div>
      </div>
    </div>`;
  }

  // --------------------------------------------------------------------------
  // Render – Tabs
  // --------------------------------------------------------------------------
  function renderTabs() {
    return `
    <div class="tabs-bar">
      <button class="tab-btn ${state.activeTab === 'ACTIVE' ? 'active' : ''}" data-action="setTab" data-tab="ACTIVE">
        ${Icons.ClipboardList(15)} Live Digital Notebook
      </button>
      <button class="tab-btn ${state.activeTab === 'HISTORY' ? 'active' : ''}" data-action="setTab" data-tab="HISTORY">
        ${Icons.History(15)} Daily Register History
      </button>
    </div>`;
  }

  // --------------------------------------------------------------------------
  // Render – Active Register
  // --------------------------------------------------------------------------
  function renderActiveRegister() {
    const entries = getActiveEntries();
    if (entries.length === 0) {
      return `
      <div class="empty-state">
        ${Icons.Bike(48)}
        <h3>No Active Entries</h3>
        <p>${state.searchTerm || state.filterCategory !== 'ALL' ? 'No entries match your search/filter.' : 'Parking lot is empty. Tap "New Entry" to start.'}</p>
      </div>`;
    }
    const rows = entries.map(e => {
      const overstay = isOverstay(e.inTime);
      const vehicleDesc = e.type === 'BIKE'
        ? `${Icons.Bike(14)} ${escapeHtml(e.regNumber || 'N/A')}`
        : `${Icons.PersonStanding(14)} ${escapeHtml(e.cycleColor || '')} ${escapeHtml(e.cycleType || '')} Bicycle`;
      const thumb = e.photoUrl
        ? `<img src="${e.photoUrl}" class="entry-thumb" alt="photo"/>`
        : '';
      return `
      <tr class="${overstay ? 'overstay-row' : ''}">
        <td>
          <div class="slot-token-cell">
            <span class="slot-number">Slot ${escapeHtml(e.slotNumber)}</span>
            <span class="token-id">${escapeHtml(e.tokenId)}</span>
          </div>
        </td>
        <td>
          <div class="vehicle-cell">
            ${thumb}
            <div>${vehicleDesc}</div>
          </div>
        </td>
        <td>${escapeHtml(e.phone || '--')}</td>
        <td>${formatTime(e.inTime)}</td>
        <td>
          <span class="elapsed-timer" data-intime="${e.inTime}">${formatDuration(e.inTime)}</span>
          ${overstay ? '<span class="badge badge-overstay">OVERSTAY</span>' : ''}
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-xs btn-ghost" data-action="viewToken" data-id="${e.id}" title="View Token">${Icons.QrCode(14)}</button>
            ${overstay ? `<button class="btn btn-xs btn-warning" data-action="callOwner" data-phone="${escapeHtml(e.phone)}" title="Call">${Icons.Phone(14)}</button>` : ''}
            <button class="btn btn-xs btn-success" data-action="openCheckout" data-id="${e.id}" title="Exit">${Icons.LogOut(14)}</button>
          </div>
        </td>
      </tr>`;
    }).join('');

    return `
    <div class="register-table-wrap">
      <table class="register-table">
        <thead>
          <tr>
            <th>Slot &amp; Token</th>
            <th>Vehicle / Identification</th>
            <th>Phone Number</th>
            <th>In-Time</th>
            <th>Live Parking Elapsed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  // --------------------------------------------------------------------------
  // Render – History Register
  // --------------------------------------------------------------------------
  function renderHistoryRegister() {
    const entries = getHistoryEntries();
    const totalRevenue = entries.reduce((s, e) => s + (e.fee || 0), 0);

    const rows = entries.map(e => {
      const vehicleDesc = e.type === 'BIKE'
        ? `${Icons.Bike(14)} ${escapeHtml(e.regNumber || 'N/A')}`
        : `${Icons.PersonStanding(14)} ${escapeHtml(e.cycleColor || '')} ${escapeHtml(e.cycleType || '')}`;
      return `
      <tr>
        <td>
          <div class="slot-token-cell">
            <span class="token-id">${escapeHtml(e.tokenId)}</span>
            <span class="slot-number">Slot ${escapeHtml(e.slotNumber)}</span>
          </div>
        </td>
        <td>${vehicleDesc}</td>
        <td>${escapeHtml(e.phone || '--')}</td>
        <td>${formatDateTime(e.inTime)}</td>
        <td>${formatDateTime(e.outTime)}</td>
        <td><strong>₹${e.fee || 0}</strong></td>
        <td><span class="badge badge-completed">COMPLETED</span></td>
      </tr>`;
    }).join('');

    return `
    <div class="history-toolbar">
      <div class="history-search-wrap">
        ${Icons.Search(15)}
        <input type="text" id="history-search" class="search-input search-input-sm" placeholder="Search history…" value="${escapeHtml(state.historySearchTerm)}" />
      </div>
      <div class="history-stats">
        <span class="revenue-badge">${Icons.IndianRupee(14)} Total: <strong>₹${totalRevenue}</strong></span>
        <button class="btn btn-outline btn-sm" data-action="exportCSV">${Icons.Download(14)} Export CSV</button>
      </div>
    </div>
    ${entries.length === 0
        ? `<div class="empty-state"><h3>No History Yet</h3><p>Completed entries will appear here.</p></div>`
        : `<div class="register-table-wrap">
            <table class="register-table">
              <thead><tr>
                <th>Token &amp; Slot</th><th>Vehicle</th><th>Phone</th><th>In-Time</th><th>Out-Time</th><th>Fee</th><th>Status</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`}`;
  }

  // --------------------------------------------------------------------------
  // Render – New Entry Modal
  // --------------------------------------------------------------------------
  function renderNewEntryModal() {
    if (!state.modals.newEntry) return '';
    const f = state.newEntryForm;
    const isBike = f.type === 'BIKE';

    const colorOptions = ['', 'Black', 'Red', 'Blue', 'White', 'Silver-Grey', 'Yellow-Orange', 'Green']
      .map(c => `<option value="${c}" ${f.cycleColor === c ? 'selected' : ''}>${c || '-- Select colour --'}</option>`).join('');
    const typeOptions = ['', 'Gear', 'Non-Gear', 'Kids', 'Electric']
      .map(t => `<option value="${t}" ${f.cycleType === t ? 'selected' : ''}>${t || '-- Select type --'}</option>`).join('');

    return `
    <div class="modal-overlay" data-modal="newEntry">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>${Icons.Plus(20)} New Parking Entry</h2>
          <button class="btn btn-icon modal-close" data-action="closeModal" data-modal="newEntry">${Icons.X(20)}</button>
        </div>
        <div class="modal-body">
          <!-- Vehicle Type Selector -->
          <div class="type-selector">
            <button class="type-btn ${isBike ? 'active' : ''}" data-action="setEntryType" data-type="BIKE">
              ${Icons.Bike(22)}
              <span>BIKE</span>
            </button>
            <button class="type-btn ${!isBike ? 'active' : ''}" data-action="setEntryType" data-type="BICYCLE">
              ${Icons.PersonStanding(22)}
              <span>BICYCLE</span>
            </button>
          </div>

          ${isBike ? `
          <!-- BIKE Fields -->
          <div class="form-group">
            <label>Registration Number <span class="required">*</span></label>
            <input type="text" id="ne-regNumber" class="form-control" placeholder="e.g. TN01AB1234" value="${escapeHtml(f.regNumber)}" />
          </div>
          <div class="form-group">
            <label>Phone (optional)</label>
            <input type="tel" id="ne-phone" class="form-control" placeholder="10-digit mobile" maxlength="10" value="${escapeHtml(f.phone)}" />
          </div>
          ` : `
          <!-- BICYCLE Fields -->
          <div class="form-group">
            <label>Phone Number <span class="required">*</span></label>
            <input type="tel" id="ne-phone" class="form-control" placeholder="10-digit mobile" maxlength="10" value="${escapeHtml(f.phone)}" />
            ${f.frequentMatch ? `<div class="frequent-match">${Icons.UserCheck(13)} Frequent parker recognised – details auto-filled</div>` : ''}
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Cycle Colour <span class="required">*</span></label>
              <select id="ne-cycleColor" class="form-control">${colorOptions}</select>
            </div>
            <div class="form-group">
              <label>Cycle Type <span class="required">*</span></label>
              <select id="ne-cycleType" class="form-control">${typeOptions}</select>
            </div>
          </div>
          <!-- Photo Capture -->
          <div class="form-group">
            <label>Photo (optional)</label>
            <div class="photo-capture-area">
              <video id="camera-preview" autoplay playsinline class="camera-preview" style="display:none;"></video>
              <canvas id="camera-canvas" style="display:none;"></canvas>
              ${f.photoDataUrl ? `<img src="${f.photoDataUrl}" class="captured-photo" />` : ''}
              <div class="photo-actions">
                ${f.photoDataUrl
              ? `<button class="btn btn-outline btn-sm" data-action="retakePhoto">${Icons.Camera(14)} Retake</button>
                     <button class="btn btn-outline btn-sm btn-danger" data-action="removePhoto">${Icons.X(14)} Remove</button>`
              : `<button class="btn btn-outline btn-sm" data-action="startCamera">${Icons.Camera(14)} Camera</button>
                     <label class="btn btn-outline btn-sm">${Icons.Upload(14)} Upload<input type="file" id="ne-file-upload" accept="image/*" style="display:none;" /></label>`}
              </div>
            </div>
          </div>
          `}

          <div class="form-group">
            <label>Notes (optional)</label>
            <textarea id="ne-notes" class="form-control" rows="2" placeholder="Any notes…">${escapeHtml(f.notes)}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" data-action="closeModal" data-modal="newEntry">Cancel</button>
          <button class="btn btn-primary" data-action="submitNewEntry">${Icons.Check(16)} Park Vehicle</button>
        </div>
      </div>
    </div>`;
  }

  // --------------------------------------------------------------------------
  // Render – Digital Token Modal
  // --------------------------------------------------------------------------
  function renderTokenModal() {
    if (!state.modals.token || !state.newlyCreatedEntry) return '';
    const e = state.newlyCreatedEntry;
    const qrData = `https://trackwheel.app/token/${(e.tokenId || '').replace('#', '')}`;
    const smsText = `Your ${e.type === 'BIKE' ? 'bike' : 'bicycle'} is parked at Slot ${e.slotNumber}. Token: ${e.tokenId}. In-Time: ${formatTime(e.inTime)}. Show this SMS/QR at exit. – TrackWheel`;

    return `
    <div class="modal-overlay" data-modal="token">
      <div class="modal modal-md token-modal">
        <div class="modal-header">
          <h2>${Icons.QrCode(20)} Digital Token</h2>
          <button class="btn btn-icon modal-close" data-action="closeModal" data-modal="token">${Icons.X(20)}</button>
        </div>
        <div class="modal-body token-body">
          <div class="token-slot-badge">Slot ${escapeHtml(e.slotNumber)}</div>
          <div class="token-id-large">${escapeHtml(e.tokenId)}</div>
          <div id="token-qr" class="token-qr" data-qr="${escapeHtml(qrData)}"></div>
          <div class="sms-preview">
            <label>SMS Preview</label>
            <div class="sms-text" id="sms-text">${escapeHtml(smsText)}</div>
          </div>
        </div>
        <div class="modal-footer token-footer">
          <button class="btn btn-primary" data-action="sendSMS" data-phone="${escapeHtml(e.phone)}" data-sms="${escapeHtml(smsText)}">${Icons.Phone(14)} Send SMS</button>
          <button class="btn btn-outline" data-action="copySMS">${Icons.Copy(14)} Copy Text</button>
          <button class="btn btn-outline" data-action="printToken">${Icons.Printer(14)} Print</button>
        </div>
      </div>
    </div>`;
  }

  // --------------------------------------------------------------------------
  // Render – Checkout Modal
  // --------------------------------------------------------------------------
  function renderCheckoutModal() {
    if (!state.modals.checkout || !state.selectedEntry) return '';
    const e = state.selectedEntry;
    const outTime = new Date();
    const feeInfo = Storage.calculateFee(e.inTime, outTime.toISOString(), e.type);
    const duration = formatDurationBetween(e.inTime, outTime.toISOString());
    const vehicleDesc = e.type === 'BIKE'
      ? `${escapeHtml(e.regNumber || 'N/A')}`
      : `${escapeHtml(e.cycleColor || '')} ${escapeHtml(e.cycleType || '')} Bicycle`;

    return `
    <div class="modal-overlay" data-modal="checkout">
      <div class="modal modal-md">
        <div class="modal-header">
          <h2>${Icons.LogOut(20)} Checkout</h2>
          <button class="btn btn-icon modal-close" data-action="closeModal" data-modal="checkout">${Icons.X(20)}</button>
        </div>
        <div class="modal-body">
          <!-- Entry Banner -->
          <div class="checkout-banner">
            <span>${Icons.QrCode(14)} ${escapeHtml(e.tokenId)}</span>
            <span>Slot ${escapeHtml(e.slotNumber)}</span>
            <span>${e.type === 'BIKE' ? Icons.Bike(14) : Icons.PersonStanding(14)} ${vehicleDesc}</span>
            ${e.phone ? `<span>${Icons.Phone(14)} ${escapeHtml(e.phone)}</span>` : ''}
          </div>

          ${e.photoUrl ? `
          <div class="photo-verify">
            <label>Photo Verification</label>
            <img src="${e.photoUrl}" class="checkout-photo" alt="Vehicle Photo"/>
          </div>` : ''}

          <!-- Time Grid -->
          <div class="time-grid">
            <div class="time-card">
              <div class="time-label">In-Time</div>
              <div class="time-value">${formatDateTime(e.inTime)}</div>
            </div>
            <div class="time-card">
              <div class="time-label">Out-Time</div>
              <div class="time-value">${formatDateTime(outTime)}</div>
            </div>
            <div class="time-card">
              <div class="time-label">Duration</div>
              <div class="time-value">${duration}</div>
            </div>
          </div>

          <!-- Fee -->
          <div class="fee-card">
            <div class="fee-label">Parking Fee</div>
            <div class="fee-amount">₹${feeInfo.total != null ? feeInfo.total : feeInfo}</div>
            ${feeInfo.breakdown ? `<div class="fee-breakdown">${escapeHtml(feeInfo.breakdown)}</div>` : ''}
          </div>

          <div class="form-group">
            <label>Exit Notes (optional)</label>
            <textarea id="checkout-notes" class="form-control" rows="2" placeholder="Any remarks…">${escapeHtml(state.checkoutNotes)}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" data-action="closeModal" data-modal="checkout">Cancel</button>
          <button class="btn btn-success btn-lg" data-action="confirmCheckout" data-id="${e.id}" data-fee="${feeInfo.total != null ? feeInfo.total : feeInfo}">${Icons.Check(16)} Confirm Exit &amp; Collect ₹${feeInfo.total != null ? feeInfo.total : feeInfo}</button>
        </div>
      </div>
    </div>`;
  }

  // --------------------------------------------------------------------------
  // Render – Cash Drawer Modal
  // --------------------------------------------------------------------------
  function renderCashDrawerModal() {
    if (!state.modals.cashDrawer) return '';
    const shift = Storage.getShiftData();
    const completed = state.entries.filter(e => e.status === 'COMPLETED');
    const expectedRevenue = completed.reduce((s, e) => s + (e.fee || 0), 0);
    const cd = state.cashDrawerForm;
    const actualTotal = (cd.d500 * 500) + (cd.d200 * 200) + (cd.d100 * 100) + (cd.d50 * 50) + (cd.d20 * 20) + (cd.d10 * 10) + (cd.coins * 1);
    const variance = actualTotal - expectedRevenue;

    const denomRow = (label, key, multiplier) => `
      <div class="denom-row">
        <span class="denom-label">₹${multiplier} ${label}</span>
        <input type="number" min="0" class="form-control denom-input" data-denom="${key}" value="${cd[key]}" />
        <span class="denom-subtotal">= ₹${cd[key] * multiplier}</span>
      </div>`;

    return `
    <div class="modal-overlay" data-modal="cashDrawer">
      <div class="modal modal-md">
        <div class="modal-header">
          <h2>${Icons.IndianRupee(20)} Cash Drawer</h2>
          <button class="btn btn-icon modal-close" data-action="closeModal" data-modal="cashDrawer">${Icons.X(20)}</button>
        </div>
        <div class="modal-body">
          <div class="shift-summary">
            <div class="shift-stat">
              <span class="shift-stat-label">Vehicles Serviced</span>
              <span class="shift-stat-value">${completed.length}</span>
            </div>
            <div class="shift-stat">
              <span class="shift-stat-label">Expected Revenue</span>
              <span class="shift-stat-value">₹${expectedRevenue}</span>
            </div>
          </div>

          <h3 class="section-title">Denomination Counter</h3>
          <div class="denom-grid">
            ${denomRow('Notes', 'd500', 500)}
            ${denomRow('Notes', 'd200', 200)}
            ${denomRow('Notes', 'd100', 100)}
            ${denomRow('Notes', 'd50', 50)}
            ${denomRow('Notes', 'd20', 20)}
            ${denomRow('Notes', 'd10', 10)}
            ${denomRow('Coins', 'coins', 1)}
          </div>

          <div class="cash-total-bar">
            <div class="cash-total">
              <span>Actual Total</span>
              <strong>₹${actualTotal}</strong>
            </div>
            <div class="cash-variance ${variance >= 0 ? 'positive' : 'negative'}">
              <span>Variance</span>
              <strong>${variance >= 0 ? '+' : ''}₹${variance}</strong>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" data-action="closeModal" data-modal="cashDrawer">Cancel</button>
          <button class="btn btn-primary" data-action="closeShift">${Icons.Check(16)} Close Shift</button>
        </div>
      </div>
    </div>`;
  }

  // --------------------------------------------------------------------------
  // Render – QR Scanner Modal
  // --------------------------------------------------------------------------
  function renderQrScannerModal() {
    if (!state.modals.qrScanner) return '';
    return `
    <div class="modal-overlay" data-modal="qrScanner">
      <div class="modal modal-md">
        <div class="modal-header">
          <h2>${Icons.QrCode(20)} Scan QR Code</h2>
          <button class="btn btn-icon modal-close" data-action="closeModal" data-modal="qrScanner">${Icons.X(20)}</button>
        </div>
        <div class="modal-body">
          <div id="qr-reader" style="width:100%;"></div>
        </div>
      </div>
    </div>`;
  }

  // --------------------------------------------------------------------------
  // Main Render
  // --------------------------------------------------------------------------
  function render() {
    const app = document.getElementById('app') || document.getElementById('root');
    if (!app) return;

    const tabContent = state.activeTab === 'ACTIVE'
      ? renderActiveRegister()
      : renderHistoryRegister();

    app.innerHTML =
      renderNavbar() +
      renderSearchBanner() +
      `<main class="main-content">` +
      renderTabs() +
      `<div class="tab-content">${tabContent}</div>` +
      `</main>` +
      renderNewEntryModal() +
      renderTokenModal() +
      renderCheckoutModal() +
      renderCashDrawerModal() +
      renderQrScannerModal();

    // Post-render hooks
    afterRender();
  }

  function afterRender() {
    // Generate QR code in token modal
    const qrContainer = document.getElementById('token-qr');
    if (qrContainer) {
      const data = qrContainer.getAttribute('data-qr');
      if (data && typeof qrcode !== 'undefined') {
        try {
          const qr = qrcode(0, 'M');
          qr.addData(data);
          qr.make();
          qrContainer.innerHTML = qr.createSvgTag(5, 0);
        } catch (err) {
          // Fallback: show data as text
          qrContainer.innerHTML = `<div class="qr-fallback">${escapeHtml(data)}</div>`;
        }
      }
    }

    // Start QR scanner if modal is open
    if (state.modals.qrScanner) {
      startQrScanner();
    }

    // Restore focus on search if needed
    if (state.activeTab === 'ACTIVE' && state.searchTerm) {
      const inp = document.getElementById('main-search');
      if (inp) { inp.focus(); inp.selectionStart = inp.selectionEnd = inp.value.length; }
    }
  }

  // Lightweight update for elapsed timers (avoids full re-render every second)
  function updateElapsedTimers() {
    const timers = document.querySelectorAll('.elapsed-timer');
    timers.forEach(el => {
      const inTime = el.getAttribute('data-intime');
      if (inTime) el.textContent = formatDuration(inTime);
    });
    // Update clock
    const clockEl = document.getElementById('navbar-clock-text');
    if (clockEl) {
      state.clockText = getNowClock();
      clockEl.textContent = state.clockText;
    }
  }

  // --------------------------------------------------------------------------
  // Event Delegation
  // --------------------------------------------------------------------------
  function initEvents() {
    document.addEventListener('click', handleClick);
    document.addEventListener('input', handleInput);
    document.addEventListener('change', handleChange);
    document.addEventListener('keydown', handleKeydown);
  }

  function handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) {
      // Click on modal overlay to close
      const overlay = e.target.closest('.modal-overlay');
      if (overlay && e.target === overlay) {
        const modalName = overlay.getAttribute('data-modal');
        closeModal(modalName);
      }
      return;
    }
    const action = btn.getAttribute('data-action');

    switch (action) {
      case 'refresh':
        loadEntries();
        render();
        break;
      case 'openNewEntry':
        resetNewEntryForm();
        state.modals.newEntry = true;
        render();
        break;
      case 'openCashDrawer':
        state.cashDrawerForm = { d500: 0, d200: 0, d100: 0, d50: 0, d20: 0, d10: 0, coins: 0 };
        state.modals.cashDrawer = true;
        render();
        break;
      case 'openQrScanner':
        state.modals.qrScanner = true;
        render();
        break;
      case 'closeModal': {
        const modal = btn.getAttribute('data-modal');
        closeModal(modal);
        break;
      }
      case 'setFilter':
        state.filterCategory = btn.getAttribute('data-filter');
        render();
        break;
      case 'setTab':
        state.activeTab = btn.getAttribute('data-tab');
        render();
        break;
      case 'setEntryType':
        state.newEntryForm.type = btn.getAttribute('data-type');
        render();
        break;
      case 'submitNewEntry':
        submitNewEntry();
        break;
      case 'viewToken': {
        const id = btn.getAttribute('data-id');
        const entry = state.entries.find(x => x.id === id);
        if (entry) {
          state.newlyCreatedEntry = entry;
          state.modals.token = true;
          render();
        }
        break;
      }
      case 'openCheckout': {
        const id = btn.getAttribute('data-id');
        const entry = state.entries.find(x => x.id === id);
        if (entry) {
          state.selectedEntry = entry;
          state.checkoutNotes = '';
          state.modals.checkout = true;
          render();
        }
        break;
      }
      case 'confirmCheckout': {
        const id = btn.getAttribute('data-id');
        const fee = parseInt(btn.getAttribute('data-fee')) || 0;
        const notes = (document.getElementById('checkout-notes') || {}).value || '';
        Storage.checkoutEntry(id, fee, notes);
        loadEntries();
        state.modals.checkout = false;
        state.selectedEntry = null;
        render();
        fireConfetti();
        break;
      }
      case 'sendSMS': {
        const phone = btn.getAttribute('data-phone');
        const sms = btn.getAttribute('data-sms');
        // Simulated SMS send
        showToast('SMS sent to ' + phone);
        break;
      }
      case 'copySMS': {
        const smsEl = document.getElementById('sms-text');
        if (smsEl) {
          navigator.clipboard.writeText(smsEl.textContent).then(() => showToast('Copied to clipboard!'));
        }
        break;
      }
      case 'printToken':
        printToken();
        break;
      case 'callOwner': {
        const phone = btn.getAttribute('data-phone');
        if (phone) window.open('tel:' + phone);
        break;
      }
      case 'exportCSV':
        exportCSV();
        break;
      case 'closeShift':
        closeShift();
        break;
      case 'startCamera':
        startCamera();
        break;
      case 'capturePhoto':
        capturePhoto();
        break;
      case 'retakePhoto':
        state.newEntryForm.photoDataUrl = null;
        stopCamera();
        render();
        setTimeout(() => startCamera(), 100);
        break;
      case 'removePhoto':
        state.newEntryForm.photoDataUrl = null;
        stopCamera();
        render();
        break;
    }
  }

  function handleInput(e) {
    const id = e.target.id;
    if (id === 'main-search') {
      state.searchTerm = e.target.value;
      // Debounced re-render of table only
      clearTimeout(handleInput._t);
      handleInput._t = setTimeout(() => render(), 200);
    } else if (id === 'history-search') {
      state.historySearchTerm = e.target.value;
      clearTimeout(handleInput._t2);
      handleInput._t2 = setTimeout(() => render(), 200);
    } else if (id === 'ne-regNumber') {
      state.newEntryForm.regNumber = e.target.value;
    } else if (id === 'ne-phone') {
      state.newEntryForm.phone = e.target.value;
      // Frequent parker lookup
      if (e.target.value.length >= 10) {
        lookupFrequentParker(e.target.value);
      } else {
        state.newEntryForm.frequentMatch = null;
      }
    } else if (id === 'ne-notes') {
      state.newEntryForm.notes = e.target.value;
    } else if (id === 'checkout-notes') {
      state.checkoutNotes = e.target.value;
    }
    // Denomination inputs
    if (e.target.classList.contains('denom-input')) {
      const key = e.target.getAttribute('data-denom');
      state.cashDrawerForm[key] = parseInt(e.target.value) || 0;
      // Update totals without full re-render
      updateCashTotals();
    }
  }

  function handleChange(e) {
    const id = e.target.id;
    if (id === 'ne-cycleColor') {
      state.newEntryForm.cycleColor = e.target.value;
    } else if (id === 'ne-cycleType') {
      state.newEntryForm.cycleType = e.target.value;
    } else if (id === 'ne-file-upload') {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          state.newEntryForm.photoDataUrl = ev.target.result;
          render();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      // Close topmost modal
      const modals = ['qrScanner', 'checkout', 'token', 'cashDrawer', 'newEntry'];
      for (const m of modals) {
        if (state.modals[m]) {
          closeModal(m);
          break;
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  function closeModal(name) {
    if (name === 'newEntry') stopCamera();
    if (name === 'qrScanner') stopQrScanner();
    state.modals[name] = false;
    render();
  }

  function resetNewEntryForm() {
    state.newEntryForm = {
      type: 'BIKE',
      regNumber: '',
      phone: '',
      cycleColor: '',
      cycleType: '',
      notes: '',
      photoDataUrl: null,
      frequentMatch: null,
    };
  }

  function submitNewEntry() {
    const f = state.newEntryForm;
    // Validate
    if (f.type === 'BIKE') {
      if (!f.regNumber.trim()) {
        showToast('Registration number is required', 'error');
        const el = document.getElementById('ne-regNumber');
        if (el) el.focus();
        return;
      }
    } else {
      if (!f.phone.trim() || f.phone.trim().length < 10) {
        showToast('Valid phone number is required', 'error');
        const el = document.getElementById('ne-phone');
        if (el) el.focus();
        return;
      }
      if (!f.cycleColor) {
        showToast('Please select cycle colour', 'error');
        return;
      }
      if (!f.cycleType) {
        showToast('Please select cycle type', 'error');
        return;
      }
    }

    const data = {
      type: f.type,
      regNumber: f.type === 'BIKE' ? f.regNumber.trim().toUpperCase() : '',
      phone: f.phone.trim(),
      cycleColor: f.type === 'BICYCLE' ? f.cycleColor : '',
      cycleType: f.type === 'BICYCLE' ? f.cycleType : '',
      notes: f.notes.trim(),
      photoUrl: f.photoDataUrl || '',
    };

    const newEntry = Storage.addEntry(data);
    loadEntries();
    stopCamera();
    state.modals.newEntry = false;

    // Open token modal
    state.newlyCreatedEntry = newEntry;
    state.modals.token = true;
    render();
    showToast('Vehicle parked successfully!', 'success');
  }

  function lookupFrequentParker(phone) {
    try {
      const frequents = Storage.getFrequentParkers();
      const match = frequents.find(fp => fp.phone === phone);
      if (match) {
        state.newEntryForm.frequentMatch = match;
        if (match.cycleColor) state.newEntryForm.cycleColor = match.cycleColor;
        if (match.cycleType) state.newEntryForm.cycleType = match.cycleType;
        render();
      }
    } catch (e) { /* ignore */ }
  }

  function exportCSV() {
    const entries = getHistoryEntries();
    if (entries.length === 0) {
      showToast('No history to export', 'error');
      return;
    }
    const headers = ['Token', 'Slot', 'Type', 'Vehicle', 'Phone', 'In-Time', 'Out-Time', 'Fee', 'Status'];
    const rows = entries.map(e => [
      e.tokenId,
      e.slotNumber,
      e.type,
      e.type === 'BIKE' ? e.regNumber : `${e.cycleColor} ${e.cycleType}`,
      e.phone || '',
      formatDateTime(e.inTime),
      formatDateTime(e.outTime),
      e.fee || 0,
      e.status,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trackwheel-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported!');
  }

  function closeShift() {
    const cd = state.cashDrawerForm;
    const shiftData = {
      ...cd,
      closedAt: new Date().toISOString(),
      actualTotal: (cd.d500 * 500) + (cd.d200 * 200) + (cd.d100 * 100) + (cd.d50 * 50) + (cd.d20 * 20) + (cd.d10 * 10) + (cd.coins * 1),
    };
    Storage.saveShiftData(shiftData);
    state.modals.cashDrawer = false;
    render();
    showToast('Shift closed successfully!');
  }

  function updateCashTotals() {
    const cd = state.cashDrawerForm;
    const completed = state.entries.filter(e => e.status === 'COMPLETED');
    const expectedRevenue = completed.reduce((s, e) => s + (e.fee || 0), 0);
    const actualTotal = (cd.d500 * 500) + (cd.d200 * 200) + (cd.d100 * 100) + (cd.d50 * 50) + (cd.d20 * 20) + (cd.d10 * 10) + (cd.coins * 1);
    const variance = actualTotal - expectedRevenue;

    const totalEl = document.querySelector('.cash-total strong');
    if (totalEl) totalEl.textContent = '₹' + actualTotal;

    const varEl = document.querySelector('.cash-variance strong');
    if (varEl) {
      varEl.textContent = (variance >= 0 ? '+' : '') + '₹' + variance;
      varEl.closest('.cash-variance').className = 'cash-variance ' + (variance >= 0 ? 'positive' : 'negative');
    }

    // Update subtotals
    document.querySelectorAll('.denom-input').forEach(inp => {
      const key = inp.getAttribute('data-denom');
      const multiplierMap = { d500: 500, d200: 200, d100: 100, d50: 50, d20: 20, d10: 10, coins: 1 };
      const sub = inp.closest('.denom-row').querySelector('.denom-subtotal');
      if (sub) sub.textContent = '= ₹' + (cd[key] * multiplierMap[key]);
    });
  }

  // --------------------------------------------------------------------------
  // Camera
  // --------------------------------------------------------------------------
  function startCamera() {
    const video = document.getElementById('camera-preview');
    if (!video) return;
    video.style.display = 'block';

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        state.cameraStream = stream;
        video.srcObject = stream;
        // Add capture button
        const actions = video.closest('.photo-capture-area').querySelector('.photo-actions');
        if (actions && !actions.querySelector('[data-action="capturePhoto"]')) {
          actions.innerHTML = `<button class="btn btn-primary btn-sm" data-action="capturePhoto">${Icons.Camera(14)} Capture</button>
            <button class="btn btn-ghost btn-sm" data-action="removePhoto">${Icons.X(14)} Cancel</button>`;
        }
      })
      .catch(err => {
        showToast('Camera not available: ' + err.message, 'error');
        video.style.display = 'none';
      });
  }

  function capturePhoto() {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    state.newEntryForm.photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    stopCamera();
    render();
  }

  function stopCamera() {
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(t => t.stop());
      state.cameraStream = null;
    }
  }

  // --------------------------------------------------------------------------
  // QR Scanner
  // --------------------------------------------------------------------------
  function startQrScanner() {
    if (qrScannerInstance) return;
    const container = document.getElementById('qr-reader');
    if (!container) return;

    if (typeof Html5QrcodeScanner === 'undefined') {
      container.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-muted);">QR scanner library not loaded. Please include html5-qrcode CDN.</p>';
      return;
    }

    qrScannerInstance = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    }, false);

    qrScannerInstance.render(onQrScanSuccess, onQrScanError);
  }

  function onQrScanSuccess(decodedText) {
    // Extract token from URL or raw text
    let token = decodedText;
    const match = decodedText.match(/token\/([A-Za-z0-9]+)/);
    if (match) token = '#' + match[1];
    if (!token.startsWith('#')) token = '#' + token;

    // Find matching active entry
    const entry = state.entries.find(e => e.status === 'ACTIVE' && e.tokenId === token);
    stopQrScanner();
    state.modals.qrScanner = false;

    if (entry) {
      state.selectedEntry = entry;
      state.checkoutNotes = '';
      state.modals.checkout = true;
      render();
    } else {
      // Try populating search
      state.searchTerm = token;
      state.activeTab = 'ACTIVE';
      render();
      showToast('Token ' + token + ' – entry not found or already checked out', 'error');
    }
  }

  function onQrScanError(err) {
    // Ignore scan errors (camera searching)
  }

  function stopQrScanner() {
    if (qrScannerInstance) {
      try { qrScannerInstance.clear(); } catch (e) { /* ignore */ }
      qrScannerInstance = null;
    }
  }

  // --------------------------------------------------------------------------
  // Print Token
  // --------------------------------------------------------------------------
  function printToken() {
    const modal = document.querySelector('.token-modal');
    if (!modal) return;
    const printWin = window.open('', '_blank', 'width=400,height=600');
    printWin.document.write(`
      <html><head><title>TrackWheel Token</title>
      <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; }
        .token-id { font-size: 2rem; font-weight: bold; letter-spacing: 2px; margin: 10px 0; }
        .slot { font-size: 1.2rem; color: #666; }
        svg { max-width: 200px; margin: 10px auto; display: block; }
        .sms { font-size: 0.85rem; color: #444; margin-top: 16px; border: 1px dashed #ccc; padding: 10px; }
      </style></head><body>
        <h2>TrackWheel</h2>
        <div class="slot">${modal.querySelector('.token-slot-badge')?.textContent || ''}</div>
        <div class="token-id">${modal.querySelector('.token-id-large')?.textContent || ''}</div>
        <div>${modal.querySelector('.token-qr')?.innerHTML || ''}</div>
        <div class="sms">${document.getElementById('sms-text')?.textContent || ''}</div>
      </body></html>
    `);
    printWin.document.close();
    printWin.print();
  }

  // --------------------------------------------------------------------------
  // Confetti
  // --------------------------------------------------------------------------
  function fireConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    }
  }

  // --------------------------------------------------------------------------
  // Toast Notification
  // --------------------------------------------------------------------------
  function showToast(message, type) {
    type = type || 'success';
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    const icon = type === 'error' ? Icons.AlertTriangle(16) : Icons.Check(16);
    toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    // Animate in
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------
  function init() {
    loadEntries();
    state.clockText = getNowClock();
    render();
    initEvents();

    // Clock + elapsed timer updates every second
    setInterval(updateElapsedTimers, 1000);
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging if needed
  window.TrackWheel = { state, render, loadEntries };

})();
