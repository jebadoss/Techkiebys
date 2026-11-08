/**
 * TrackWheel Storage Module
 * Handles all localStorage operations, fee calculations, and data management.
 * Exposed as window.Storage
 */
(function () {
  'use strict';

  const STORAGE_KEYS = {
    ENTRIES: 'trackwheel_entries',
    SHIFT: 'trackwheel_shift',
    RATES: 'trackwheel_rates',
    FREQUENT_PARKERS: 'trackwheel_frequent_parkers'
  };

  const DEFAULT_RATES = {
    bikeBase: 20,
    bikeBaseHours: 2,
    bikeHourlyAfter: 10,
    cycleBase: 10,
    cycleBaseHours: 2,
    cycleHourlyAfter: 5,
    overstayThresholdHours: 8
  };

  const INITIAL_ENTRIES = [
    {
      id: 'TW-1001',
      tokenId: '#W8K2P9',
      type: 'BIKE',
      regNumber: 'KA-01-AB-1234',
      phone: '9876543210',
      cycleColor: '',
      cycleCategory: '',
      photoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop',
      slotNumber: 'A-01',
      inTime: new Date(Date.now() - 3 * 3600 * 1000 - 15 * 60 * 1000).toISOString(),
      outTime: null,
      status: 'ACTIVE',
      feePaid: null,
      notes: 'Helmets kept at counter'
    },
    {
      id: 'TW-1002',
      tokenId: '#R4X9T2',
      type: 'BICYCLE',
      regNumber: '',
      phone: '9845012345',
      cycleColor: 'Red',
      cycleCategory: 'Gear',
      photoUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop',
      slotNumber: 'B-04',
      inTime: new Date(Date.now() - 9 * 3600 * 1000 - 45 * 60 * 1000).toISOString(),
      outTime: null,
      status: 'ACTIVE',
      feePaid: null,
      notes: 'Scratch on left handle bar'
    },
    {
      id: 'TW-1003',
      tokenId: '#M3J7Y1',
      type: 'BICYCLE',
      regNumber: '',
      phone: '9900112233',
      cycleColor: 'Blue',
      cycleCategory: 'Non-Gear',
      photoUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&auto=format&fit=crop',
      slotNumber: 'B-07',
      inTime: new Date(Date.now() - 1 * 3600 * 1000 - 10 * 60 * 1000).toISOString(),
      outTime: null,
      status: 'ACTIVE',
      feePaid: null,
      notes: ''
    },
    {
      id: 'TW-1000',
      tokenId: '#B9K1N3',
      type: 'BIKE',
      regNumber: 'KA-05-EV-9988',
      phone: '9123456789',
      cycleColor: '',
      cycleCategory: '',
      photoUrl: '',
      slotNumber: 'A-02',
      inTime: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      outTime: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      status: 'COMPLETED',
      feePaid: 30,
      notes: 'Paid via cash'
    }
  ];

  const INITIAL_FREQUENT = {
    '9845012345': {
      phone: '9845012345',
      cycleColor: 'Red',
      cycleCategory: 'Gear',
      photoUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop',
      visitCount: 4,
      lastVisit: new Date().toISOString()
    }
  };

  // ── Entries ──────────────────────────────────────────────

  function getEntries() {
    var raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!raw) {
      saveEntries(INITIAL_ENTRIES);
      return INITIAL_ENTRIES;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing entries:', e);
      return INITIAL_ENTRIES;
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  }

  // ── Rates ────────────────────────────────────────────────

  function getRates() {
    var raw = localStorage.getItem(STORAGE_KEYS.RATES);
    if (!raw) return DEFAULT_RATES;
    try {
      return Object.assign({}, DEFAULT_RATES, JSON.parse(raw));
    } catch (e) {
      return DEFAULT_RATES;
    }
  }

  // ── Frequent Parkers ────────────────────────────────────

  function getFrequentParkers() {
    var raw = localStorage.getItem(STORAGE_KEYS.FREQUENT_PARKERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FREQUENT_PARKERS, JSON.stringify(INITIAL_FREQUENT));
      return INITIAL_FREQUENT;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return INITIAL_FREQUENT;
    }
  }

  function saveFrequentParkers(data) {
    localStorage.setItem(STORAGE_KEYS.FREQUENT_PARKERS, JSON.stringify(data));
  }

  // ── Token Generator ─────────────────────────────────────

  function generateToken() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    var token = '#';
    for (var i = 0; i < 6; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // ── Fee Calculator ──────────────────────────────────────

  function calculateFee(entry, outTime) {
    var rates = getRates();
    var inMs = new Date(entry.inTime).getTime();
    var outMs = outTime ? new Date(outTime).getTime() : Date.now();
    var diffHours = (outMs - inMs) / (1000 * 60 * 60);
    var hours = Math.ceil(diffHours);
    if (hours < 1) hours = 1;

    var fee = 0;
    if (entry.type === 'BIKE') {
      if (hours <= rates.bikeBaseHours) {
        fee = rates.bikeBase;
      } else {
        fee = rates.bikeBase + (hours - rates.bikeBaseHours) * rates.bikeHourlyAfter;
      }
    } else {
      // BICYCLE
      if (hours <= rates.cycleBaseHours) {
        fee = rates.cycleBase;
      } else {
        fee = rates.cycleBase + (hours - rates.cycleBaseHours) * rates.cycleHourlyAfter;
      }
    }

    var isOverstay = diffHours >= rates.overstayThresholdHours;

    return {
      fee: fee,
      hours: diffHours,
      isOverstay: isOverstay
    };
  }

  // ── Add Entry ───────────────────────────────────────────

  function addEntry(entryData) {
    var entries = getEntries();
    var nextId = 'TW-' + (1000 + entries.length + 1);

    // Ensure unique ID
    var existingIds = entries.map(function (e) { return e.id; });
    while (existingIds.indexOf(nextId) !== -1) {
      nextId = 'TW-' + (parseInt(nextId.split('-')[1]) + 1);
    }

    var newEntry = {
      id: nextId,
      tokenId: generateToken(),
      type: entryData.type || 'BIKE',
      regNumber: entryData.regNumber || '',
      phone: entryData.phone || '',
      cycleColor: entryData.cycleColor || '',
      cycleCategory: entryData.cycleCategory || '',
      photoUrl: entryData.photoUrl || '',
      slotNumber: entryData.slotNumber || '',
      inTime: entryData.inTime || new Date().toISOString(),
      outTime: null,
      status: 'ACTIVE',
      feePaid: null,
      notes: entryData.notes || ''
    };

    entries.unshift(newEntry);
    saveEntries(entries);

    // Update frequent parkers for bicycles
    if (newEntry.type === 'BICYCLE' && newEntry.phone) {
      var frequent = getFrequentParkers();
      if (frequent[newEntry.phone]) {
        frequent[newEntry.phone].visitCount += 1;
        frequent[newEntry.phone].lastVisit = new Date().toISOString();
        if (newEntry.cycleColor) frequent[newEntry.phone].cycleColor = newEntry.cycleColor;
        if (newEntry.cycleCategory) frequent[newEntry.phone].cycleCategory = newEntry.cycleCategory;
        if (newEntry.photoUrl) frequent[newEntry.phone].photoUrl = newEntry.photoUrl;
      } else {
        frequent[newEntry.phone] = {
          phone: newEntry.phone,
          cycleColor: newEntry.cycleColor,
          cycleCategory: newEntry.cycleCategory,
          photoUrl: newEntry.photoUrl,
          visitCount: 1,
          lastVisit: new Date().toISOString()
        };
      }
      saveFrequentParkers(frequent);
    }

    return newEntry;
  }

  // ── Checkout Entry ──────────────────────────────────────

  function checkoutEntry(entryId, feePaid) {
    var entries = getEntries();
    var outTime = new Date().toISOString();
    var updated = entries.map(function (entry) {
      if (entry.id === entryId) {
        return Object.assign({}, entry, {
          outTime: outTime,
          status: 'COMPLETED',
          feePaid: feePaid
        });
      }
      return entry;
    });
    saveEntries(updated);
    return updated.find(function (e) { return e.id === entryId; });
  }

  // ── Shift Data ──────────────────────────────────────────

  function getShiftData() {
    var raw = localStorage.getItem(STORAGE_KEYS.SHIFT);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveShiftData(data) {
    if (data) {
      localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SHIFT);
    }
  }

  // ── Expose on window ───────────────────────────────────

  window.Storage = {
    STORAGE_KEYS: STORAGE_KEYS,
    DEFAULT_RATES: DEFAULT_RATES,
    getEntries: getEntries,
    saveEntries: saveEntries,
    getRates: getRates,
    getFrequentParkers: getFrequentParkers,
    saveFrequentParkers: saveFrequentParkers,
    generateToken: generateToken,
    calculateFee: calculateFee,
    addEntry: addEntry,
    checkoutEntry: checkoutEntry,
    getShiftData: getShiftData,
    saveShiftData: saveShiftData
  };
})();
