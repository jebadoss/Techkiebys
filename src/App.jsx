import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ActiveRegister from './components/ActiveRegister';
import HistoryRegister from './components/HistoryRegister';
import NewEntryModal from './components/NewEntryModal';
import DigitalTokenModal from './components/DigitalTokenModal';
import CheckoutModal from './components/CheckoutModal';
import CashDrawerModal from './components/CashDrawerModal';
import QRScannerModal from './components/QRScannerModal';
import { getEntries, addEntry, checkoutEntry, getRates } from './services/storage';
import { Search, QrCode, Filter, Plus, Phone, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'HISTORY'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL'); // 'ALL', 'BIKE', 'BICYCLE', 'OVERSTAY'

  // Modal states
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newlyCreatedEntry, setNewlyCreatedEntry] = useState(null);

  const loadData = () => {
    setEntries(getEntries());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEntry = (entryData) => {
    const created = addEntry(entryData);
    loadData();
    setNewlyCreatedEntry(created);
    setIsTokenModalOpen(true);
  };

  const handleOpenCheckout = (entry) => {
    setSelectedEntry(entry);
    setIsCheckoutOpen(true);
  };

  const handleConfirmCheckout = (id, feeAmount, notes) => {
    checkoutEntry(id, feeAmount, notes);
    loadData();
  };

  const handleQRScanSuccess = (tokenId) => {
    setIsQRScannerOpen(false);
    const found = entries.find(e => e.tokenId.toUpperCase() === tokenId.toUpperCase() && e.status === 'ACTIVE');
    if (found) {
      handleOpenCheckout(found);
    } else {
      alert(`No active parking entry found for Token: ${tokenId}`);
    }
  };

  // Filter logic
  const rates = getRates();
  const now = Date.now();

  const activeEntries = entries.filter(e => e.status === 'ACTIVE');
  const completedEntries = entries.filter(e => e.status === 'COMPLETED');

  const overstayEntries = activeEntries.filter(e => {
    const diffMs = now - new Date(e.inTime).getTime();
    return (diffMs / (1000 * 3600)) >= rates.overstayThresholdHours;
  });

  const totalExpectedCashToday = completedEntries.reduce((sum, e) => sum + (e.feePaid || 0), 0);

  const filteredActiveEntries = activeEntries.filter(entry => {
    const term = searchTerm.toLowerCase();

    // Last 4 digits quick search matching
    const phoneLast4 = entry.phone ? entry.phone.slice(-4) : '';

    const matchesSearch = 
      !searchTerm ||
      entry.tokenId.toLowerCase().includes(term) ||
      (entry.regNumber && entry.regNumber.toLowerCase().includes(term)) ||
      (entry.phone && entry.phone.includes(term)) ||
      phoneLast4.includes(term) ||
      (entry.cycleColor && entry.cycleColor.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (filterCategory === 'BIKE') return entry.type === 'BIKE';
    if (filterCategory === 'BICYCLE') return entry.type === 'BICYCLE';
    if (filterCategory === 'OVERSTAY') {
      const diffMs = now - new Date(entry.inTime).getTime();
      return (diffMs / (1000 * 3600)) >= rates.overstayThresholdHours;
    }

    return true;
  });

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        activeCount={activeEntries.length}
        overstayCount={overstayEntries.length}
        onOpenNewEntry={() => setIsNewEntryOpen(true)}
        onOpenCashDrawer={() => setIsCashDrawerOpen(true)}
        onRefresh={loadData}
      />

      {/* Main Search & Exit Scanner Banner */}
      <div className="search-banner">
        <div className="search-input-group">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Quick Exit Search: Type Token (#G7X2P9), Phone Number, or Last 4 Digits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn-secondary" style={{ borderColor: 'var(--accent-cyan)' }} onClick={() => setIsQRScannerOpen(true)}>
          <QrCode size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>Scan Token QR</span>
        </button>

        <div className="quick-filters">
          <button
            className={`filter-btn ${filterCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterCategory('ALL')}
          >
            All ({activeEntries.length})
          </button>

          <button
            className={`filter-btn ${filterCategory === 'BIKE' ? 'active' : ''}`}
            onClick={() => setFilterCategory('BIKE')}
          >
            Bikes
          </button>

          <button
            className={`filter-btn ${filterCategory === 'BICYCLE' ? 'active' : ''}`}
            onClick={() => setFilterCategory('BICYCLE')}
          >
            Bicycles
          </button>

          {overstayEntries.length > 0 && (
            <button
              className={`filter-btn ${filterCategory === 'OVERSTAY' ? 'active' : ''}`}
              style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)' }}
              onClick={() => setFilterCategory('OVERSTAY')}
            >
              ⚠️ Overstay ({overstayEntries.length})
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="main-tabs">
        <button
          className={`tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => setActiveTab('ACTIVE')}
        >
          <span>Live Digital Notebook</span>
          <span className="tab-count">{activeEntries.length}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
          onClick={() => setActiveTab('HISTORY')}
        >
          <span>Daily Register History</span>
          <span className="tab-count">{completedEntries.length}</span>
        </button>
      </div>

      {/* Register Views */}
      {activeTab === 'ACTIVE' ? (
        <ActiveRegister
          entries={filteredActiveEntries}
          onSelectCheckout={handleOpenCheckout}
          onSelectViewToken={(entry) => {
            setNewlyCreatedEntry(entry);
            setIsTokenModalOpen(true);
          }}
          overstayThresholdHours={rates.overstayThresholdHours}
        />
      ) : (
        <HistoryRegister entries={entries} />
      )}

      {/* Modals */}
      <NewEntryModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        onSubmitEntry={handleCreateEntry}
      />

      <DigitalTokenModal
        entry={newlyCreatedEntry}
        onClose={() => {
          setIsTokenModalOpen(false);
          setNewlyCreatedEntry(null);
        }}
      />

      <CheckoutModal
        entry={selectedEntry}
        onClose={() => {
          setIsCheckoutOpen(false);
          setSelectedEntry(null);
        }}
        onConfirmCheckout={handleConfirmCheckout}
      />

      <CashDrawerModal
        isOpen={isCashDrawerOpen}
        onClose={() => setIsCashDrawerOpen(false)}
        totalExpectedCash={totalExpectedCashToday}
        completedCount={completedEntries.length}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />
    </div>
  );
}
