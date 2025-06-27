import { useState, useRef, useEffect } from 'react';
import { RiCalendarLine, RiFilterLine, RiMoneyDollarCircleLine, RiDownloadLine, RiCloseLine, RiCheckboxBlankLine, RiCheckboxFill } from 'react-icons/ri';

const CSVExportModal = ({ onClose, onExport }) => {
  const [dateRange, setDateRange] = useState('Jun 1 - Jun 25, 2025');
  const [transactionType, setTransactionType] = useState('All Transactions');
  const [amountFilter, setAmountFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState([
    'id', 'date', 'amount', 'category', 'status', 'user_id'
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const modalRef = useRef(null);

  // Available fields for export
  const allFields = [
    { id: 'id', label: 'Transaction ID' },
    { id: 'date', label: 'Date' },
    { id: 'amount', label: 'Amount' },
    { id: 'category', label: 'Type' },
    { id: 'status', label: 'Status' },
    { id: 'user_id', label: 'User ID' },
    { id: 'payment_method', label: 'Payment Method' },
    { id: 'description', label: 'Description' },
    { id: 'reference', label: 'Reference' }
  ];

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: { target: any; }) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const toggleFieldSelection = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(f => f !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const handleExport = () => {
    const config = {
      dateRange,
      transactionType,
      amountFilter,
      searchQuery,
      fields: selectedFields
    };
    onExport(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Export Configuration</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Date Range */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="relative">
              <input
                type="text"
                value={dateRange}
                readOnly
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <RiCalendarLine className="absolute right-3 top-3 text-gray-400" />
            </div>
            {showDatePicker && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <RiCalendarLine />
                  </button>
                  <span className="font-medium">June 2025</span>
                  <button className="p-1 text-gray-500 hover:text-gray-700">
                    <RiCalendarLine />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-gray-500 text-center">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <button
                      key={i}
                      className={`p-1 rounded-full text-sm ${i < 25 && i >= 1 ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <button 
                    className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Type */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <div className="relative">
              <input
                type="text"
                value={transactionType}
                readOnly
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <RiFilterLine className="absolute right-3 top-3 text-gray-400" />
            </div>
            {showTypeDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                {['All Transactions', 'Income', 'Expenses', 'Transfers'].map(type => (
                  <button
                    key={type}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${transactionType === type ? 'text-blue-600' : 'text-gray-700'}`}
                    onClick={() => {
                      setTransactionType(type);
                      setShowTypeDropdown(false);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter amount range"
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <RiMoneyDollarCircleLine className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Filter</label>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Fields to Include */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fields to Include</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {allFields.map(field => (
                <button
                  key={field.id}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm border ${selectedFields.includes(field.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => toggleFieldSelection(field.id)}
                >
                  {selectedFields.includes(field.id) ? (
                    <RiCheckboxFill className="text-blue-600" />
                  ) : (
                    <RiCheckboxBlankLine className="text-gray-400" />
                  )}
                  <span>{field.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Format Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format Options</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="format"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">CSV (Comma Delimited)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="format"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Excel</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center space-x-2"
          >
            <RiDownloadLine size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Example usage in your component:
const ExportExample = () => {
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExport = (config: any) => {
    console.log('Exporting with config:', config);
    // Implement your export logic here
  };

  return (
    <div className="p-6">
      <button
        onClick={() => setShowExportModal(true)}
        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        <RiDownloadLine />
        <span>Show Export Modal</span>
      </button>

      {showExportModal && (
        <CSVExportModal 
          onClose={() => setShowExportModal(false)} 
          onExport={handleExport} 
        />
      )}
    </div>
  );
};

export default ExportExample;