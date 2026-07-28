export const RATE_CARD = { firstHours: 2, firstFee: 10, extraHourFee: 5 };

export const seedActive = [
  {
    token: 'G7X2P9',
    type: 'bicycle',
    color: 'Blue',
    cycleType: 'Non-Gear',
    regNo: null,
    phone: '9876543210',
    slot: 'A-4',
    inTime: Date.now() - 1000 * 60 * 135,
    status: 'ACTIVE',
    photoLabel: 'Blue cycle, frame scratch near seat',
  },
  {
    token: 'K1M4T8',
    type: 'bike',
    color: null,
    cycleType: null,
    regNo: 'KA-01-AB-1234',
    phone: '9123456780',
    slot: 'B-1',
    inTime: Date.now() - 1000 * 60 * 42,
    status: 'ACTIVE',
    photoLabel: null,
  },
  {
    token: 'R3W9L2',
    type: 'bicycle',
    color: 'Red',
    cycleType: 'Gear',
    regNo: null,
    phone: '9988776655',
    slot: 'A-9',
    inTime: Date.now() - 1000 * 60 * 60 * 9,
    status: 'ACTIVE',
    photoLabel: 'Red gear cycle, yellow sticker on bar',
  },
];

export const seedHistory = [
  {
    token: 'D5F0Q1',
    type: 'bicycle',
    color: 'Black',
    regNo: null,
    phone: '9012345678',
    slot: 'A-2',
    inTime: Date.now() - 1000 * 60 * 60 * 5,
    outTime: Date.now() - 1000 * 60 * 60 * 3,
    fee: 15,
    status: 'CLOSED',
  },
  {
    token: 'P8H6C3',
    type: 'bike',
    regNo: 'KA-05-XY-9911',
    phone: '9333221100',
    slot: 'B-3',
    inTime: Date.now() - 1000 * 60 * 60 * 8,
    outTime: Date.now() - 1000 * 60 * 60 * 6,
    fee: 20,
    status: 'CLOSED',
  },
];

export function genToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function calcFee(inTime, outTime = Date.now()) {
  const start = new Date(inTime).getTime();
  const end = new Date(outTime).getTime();
  const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
  if (hours <= RATE_CARD.firstHours) return RATE_CARD.firstFee;
  return RATE_CARD.firstFee + (hours - RATE_CARD.firstHours) * RATE_CARD.extraHourFee;
}

export function formatDuration(inTime, ref = Date.now()) {
  const start = new Date(inTime).getTime();
  const end = new Date(ref).getTime();
  const mins = Math.floor((end - start) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
