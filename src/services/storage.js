// Storage service managing local state and mock database for TrackWheel

const STORAGE_KEYS = {
  ENTRIES: 'trackwheel_entries',
  SHIFT: 'trackwheel_shift',
  RATES: 'trackwheel_rates',
  FREQUENT_PARKERS: 'trackwheel_frequent_parkers'
};

// Initial default rates: ₹10 for first 2 hrs, ₹5 per additional hour (or part thereof)
const DEFAULT_RATES = {
  bikeBase: 20,
  bikeBaseHours: 2,
  bikeHourlyAfter: 10,
  cycleBase: 10,
  cycleBaseHours: 2,
  cycleHourlyAfter: 5,
  overstayThresholdHours: 8
};

// Sample seed data to make the app immediately look rich & realistic
const INITIAL_ENTRIES = [
  {
    id: 'TW-1001',
    tokenId: '#W8K2P9',
    type: 'BIKE', // BIKE or BICYCLE
    regNumber: 'KA-01-AB-1234',
    phone: '9876543210',
    cycleColor: '',
    cycleCategory: '',
    photoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop',
    slotNumber: 'A-01',
    inTime: new Date(Date.now() - 3 * 3600 * 1000 - 15 * 60 * 1000).toISOString(), // 3h 15m ago
    outTime: null,
    status: 'ACTIVE', // ACTIVE or COMPLETED
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
    inTime: new Date(Date.now() - 9 * 3600 * 1000 - 45 * 60 * 1000).toISOString(), // 9h 45m ago -> OVERSTAY
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
    inTime: new Date(Date.now() - 1 * 3600 * 1000 - 10 * 60 * 1000).toISOString(), // 1h 10m ago
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

export const getEntries = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(INITIAL_ENTRIES));
    return INITIAL_ENTRIES;
  }
  return JSON.parse(data);
};

export const saveEntries = (entries) => {
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
};

export const getRates = () => {
  const data = localStorage.getItem(STORAGE_KEYS.RATES);
  return data ? JSON.parse(data) : DEFAULT_RATES;
};

export const getFrequentParkers = () => {
  const data = localStorage.getItem(STORAGE_KEYS.FREQUENT_PARKERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.FREQUENT_PARKERS, JSON.stringify(INITIAL_FREQUENT));
    return INITIAL_FREQUENT;
  }
  return JSON.parse(data);
};

export const generateToken = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '#';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const calculateFee = (inTime, outTime = new Date(), vehicleType = 'BIKE') => {
  const rates = getRates();
  const start = new Date(inTime);
  const end = new Date(outTime);
  const diffMs = Math.max(0, end - start);
  const totalMinutes = Math.ceil(diffMs / (1000 * 60));
  const totalHours = totalMinutes / 60;

  const isBike = vehicleType === 'BIKE';
  const basePrice = isBike ? rates.bikeBase : rates.cycleBase;
  const baseHours = isBike ? rates.bikeBaseHours : rates.cycleBaseHours;
  const hourlyRate = isBike ? rates.bikeHourlyAfter : rates.cycleHourlyAfter;

  if (totalHours <= baseHours) {
    return {
      fee: basePrice,
      totalMinutes,
      totalHours: totalHours.toFixed(1),
      breakdown: `Flat base rate (up to ${baseHours} hrs): ₹${basePrice}`
    };
  }

  const extraHours = Math.ceil(totalHours - baseHours);
  const extraFee = extraHours * hourlyRate;
  const totalFee = basePrice + extraFee;

  return {
    fee: totalFee,
    totalMinutes,
    totalHours: totalHours.toFixed(1),
    breakdown: `Base (${baseHours}h): ₹${basePrice} + Extra (${extraHours}h @ ₹${hourlyRate}/h): ₹${extraFee}`
  };
};

export const addEntry = (newEntryData) => {
  const entries = getEntries();
  const rates = getRates();

  const tokenId = generateToken();
  const nextNum = entries.length + 1001;
  const slotPrefix = newEntryData.type === 'BIKE' ? 'A' : 'B';
  const randomSlot = `${slotPrefix}-${Math.floor(Math.random() * 20) + 1}`;

  const entry = {
    id: `TW-${nextNum}`,
    tokenId,
    type: newEntryData.type || 'BIKE',
    regNumber: (newEntryData.regNumber || '').toUpperCase(),
    phone: newEntryData.phone || '',
    cycleColor: newEntryData.cycleColor || '',
    cycleCategory: newEntryData.cycleCategory || '',
    photoUrl: newEntryData.photoUrl || '',
    slotNumber: newEntryData.slotNumber || randomSlot,
    inTime: new Date().toISOString(),
    outTime: null,
    status: 'ACTIVE',
    feePaid: null,
    notes: newEntryData.notes || ''
  };

  entries.unshift(entry);
  saveEntries(entries);

  // Frequent Parker update
  if (entry.phone) {
    const frequent = getFrequentParkers();
    frequent[entry.phone] = {
      phone: entry.phone,
      cycleColor: entry.cycleColor || (frequent[entry.phone]?.cycleColor || ''),
      cycleCategory: entry.cycleCategory || (frequent[entry.phone]?.cycleCategory || ''),
      photoUrl: entry.photoUrl || (frequent[entry.phone]?.photoUrl || ''),
      visitCount: (frequent[entry.phone]?.visitCount || 0) + 1,
      lastVisit: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.FREQUENT_PARKERS, JSON.stringify(frequent));
  }

  return entry;
};

export const checkoutEntry = (id, feeAmount, notes = '') => {
  const entries = getEntries();
  const index = entries.findIndex(e => e.id === id || e.tokenId === id);

  if (index === -1) return null;

  entries[index] = {
    ...entries[index],
    outTime: new Date().toISOString(),
    status: 'COMPLETED',
    feePaid: Number(feeAmount),
    notes: notes ? `${entries[index].notes ? entries[index].notes + ' | ' : ''}${notes}` : entries[index].notes
  };

  saveEntries(entries);
  return entries[index];
};

export const getShiftData = () => {
  const data = localStorage.getItem(STORAGE_KEYS.SHIFT);
  const today = new Date().toISOString().split('T')[0];
  
  if (!data) {
    const initialShift = {
      shiftId: `SHIFT-${Date.now().toString().slice(-4)}`,
      date: today,
      startTime: new Date().toISOString(),
      attendant: 'Attendant Alex (Shift 1)',
      status: 'OPEN',
      cashDrawerOpenedAt: new Date().toISOString(),
      history: []
    };
    localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(initialShift));
    return initialShift;
  }
  return JSON.parse(data);
};

export const saveShiftData = (shift) => {
  localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(shift));
};
