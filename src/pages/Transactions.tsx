import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { 
  RiDashboardLine, RiExchangeDollarLine, RiWallet3Line, RiLineChartLine, 
  RiUserLine, RiMessage3Line, RiSettingsLine, RiSearchLine, 
  RiNotification3Line, RiArrowDownSLine, RiCalendarLine, RiFilterLine, 
  RiMoneyDollarCircleLine, RiAddLine, RiDownloadLine, RiEyeLine, 
  RiMore2Fill, RiShareLine, RiPrinterLine, RiDeleteBinLine, 
  RiCloseLine, RiCheckLine, RiBankCardLine, RiArrowLeftSLine, 
  RiArrowRightSLine, RiArrowUpDownLine, RiSpotifyFill 
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

type Transaction = {
  _id: string;
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile?: string;
  name?: string;
  email?: string;
  paymentMethod?: string;
  notes?: string;
  bank?: string;
  accountNumber?: string;
};

const TransactionsPage = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 5, 25));
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(new Date(2025, 5, 1));
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(new Date(2025, 5, 25));
  
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTypeFilter, setShowTypeFilter] = useState<boolean>(false);
  const [showAmountFilter, setShowAmountFilter] = useState<boolean>(false);
  const [showEntries, setShowEntries] = useState<boolean>(false);
  const [showSortBy, setShowSortBy] = useState<boolean>(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  
  const [maxAmount, setMaxAmount] = useState<number>(5000);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ 
    key: 'date', 
    direction: 'descending' 
  });
  const [transactionType, setTransactionType] = useState<string>('All Transactions');
  
  // Form state for add transaction
  const [newTransaction, setNewTransaction] = useState({
    id: Math.floor(Math.random() * 10000),
    date: new Date().toISOString().slice(0, 16),
    amount: 0,
    category: 'Revenue',
    status: 'Paid',
    user_id: '',
    user_profile: 'https://thispersondoesnotexist.com/'
  });

  // Refs
  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateRangeBtnRef = useRef<HTMLButtonElement>(null);
  const typeFilterRef = useRef<HTMLDivElement>(null);
  const amountFilterRef = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);
  const sortByRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Sample transaction data
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    axios.get<Transaction[]>('http://localhost:3001/transactions')
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error('Error fetching transactions:', err));
  };

  const handleAddTransaction = () => {
    axios.post('http://localhost:3001/transactions', newTransaction, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(() => {
      fetchTransactions();
      setShowAddModal(false);
      setNewTransaction({
        id: Math.floor(Math.random() * 10000),
        date: new Date().toISOString().slice(0, 16),
        amount: 0,
        category: 'Revenue',
        status: 'Paid',
        user_id: '',
        user_profile: 'https://thispersondoesnotexist.com/'
      });
    })
    .catch(err => console.error('Error adding transaction:', err));
  };

  const exportAllTransactions = () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1 style="text-align: center; margin-bottom: 20px;">Transactions Report</h1>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ddd;">ID</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Date</th>
            <th style="padding: 8px; border: 1px solid #ddd;">User</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Type</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Amount</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(tx => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${tx.id}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(tx.date).toLocaleString()}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${tx.user_id}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${tx.category}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${tx.amount}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${tx.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="text-align: right; margin-top: 20px;">Generated on ${new Date().toLocaleDateString()}</p>
    `;
    
    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: 'transactions-report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      })
      .save();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node) && 
          dateRangeBtnRef.current && !dateRangeBtnRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (typeFilterRef.current && !typeFilterRef.current.contains(event.target as Node)) {
        setShowTypeFilter(false);
      }
      if (amountFilterRef.current && !amountFilterRef.current.contains(event.target as Node)) {
        setShowAmountFilter(false);
      }
      if (entriesRef.current && !entriesRef.current.contains(event.target as Node)) {
        setShowEntries(false);
      }
      if (sortByRef.current && !sortByRef.current.contains(event.target as Node)) {
        setShowSortBy(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (date > selectedStartDate!) {
      setSelectedEndDate(date);
    } else {
      setSelectedEndDate(selectedStartDate);
      setSelectedStartDate(date);
    }
  };

  // Apply date filter
  const applyDateFilter = () => {
    setShowDatePicker(false);
  };

  // Reset date filter
  const resetDateFilter = () => {
    setSelectedStartDate(new Date(2025, 5, 1));
    setSelectedEndDate(new Date(2025, 5, 25));
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!selectedStartDate) return 'Select Date Range';
    if (!selectedEndDate) return selectedStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const startStr = selectedStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = selectedEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const yearStr = selectedEndDate.getFullYear();
    
    return `${startStr} - ${endStr}, ${yearStr}`;
  };

  // Handle transaction type filter
  const handleTransactionType = (type: string) => {
    setTransactionType(type);
    setShowTypeFilter(false);
  };

  // Handle amount filter
  const applyAmountFilter = () => {
    setShowAmountFilter(false);
  };

  // Handle entries per page change
  const handleEntriesChange = (entries: number) => {
    setEntriesPerPage(entries);
    setCurrentPage(1);
    setShowEntries(false);
  };

  // Handle sort
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    const key = sortConfig.key as keyof Transaction;
    
    // Handle undefined values by treating them as "smaller" than defined values
    if (a[key] === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (b[key] === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
    
    // Handle different types appropriately
    if (typeof a[key] === 'string' && typeof b[key] === 'string') {
      const aValue = a[key] as string;
      const bValue = b[key] as string;
      return sortConfig.direction === 'ascending' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    if (typeof a[key] === 'number' && typeof b[key] === 'number') {
      const aValue = a[key] as number;
      const bValue = b[key] as number;
      return sortConfig.direction === 'ascending' 
        ? aValue - bValue 
        : bValue - aValue;
    }
  
    // Fallback for other cases
    const aValue = a[key] as any;
    const bValue = b[key] as any;
    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });
  // Filter transactions based on search query
  const filteredTransactions = sortedTransactions.filter(transaction => {
    const matchesSearch = transaction.user_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         transaction._id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = transactionType === 'All Transactions' || 
                       (transactionType === 'Income' && transaction.category === 'Revenue') ||
                       (transactionType === 'Expenses' && transaction.category === 'Expense') ||
                       (transactionType === 'Transfers' && transaction.category === 'Transfer');
    const matchesAmount = transaction.amount <= maxAmount;
    
    return matchesSearch && matchesType && matchesAmount;
  });

  // Pagination
  const indexOfLastTransaction = currentPage * entriesPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - entriesPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / entriesPerPage);

  // Handle pagination
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Open transaction details
  const openTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsPanel(true);
  };

  // Toggle action menu
  const toggleActionMenu = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setActiveActionMenu(activeActionMenu === id ? null : id);
  };

  // Render calendar
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const days = [];
    
    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm cursor-not-allowed"></div>
      );
    }

    // Days of month
    for (let i = 1; i <= lastDate; i++) {
      const currentDateObj = new Date(year, month, i);
      const isInRange = selectedStartDate && selectedEndDate && 
                        currentDateObj >= selectedStartDate && 
                        currentDateObj <= selectedEndDate;
      const isStartOrEnd = selectedStartDate && selectedEndDate && 
                          (currentDateObj.toDateString() === selectedStartDate.toDateString() || 
                           currentDateObj.toDateString() === selectedEndDate.toDateString());

      const dayClasses = [
        'w-8 h-8 flex items-center justify-center text-sm rounded',
        'cursor-pointer hover:bg-[#2d303a]',
        isInRange ? 'bg-[rgba(74,222,128,0.2)]' : '',
        isStartOrEnd ? 'bg-primary text-[#1a1c23]' : ''
      ].join(' ');

      days.push(
        <div 
          key={`day-${i}`}
          className={dayClasses}
          onClick={() => handleDateClick(currentDateObj)}
        >
          {i}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <button 
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1 text-gray-400 hover:text-white"
          >
            <RiArrowLeftSLine />
          </button>
          <span className="font-medium">{monthNames[month]} {year}</span>
          <button 
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1 text-gray-400 hover:text-white"
          >
            <RiArrowRightSLine />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  // Download transaction details
  const downloadTransactionDetails = () => {
    if (!selectedTransaction) return;
    
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #333; margin-bottom: 30px;">Transaction Receipt</h1>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #555; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px;">
            Transaction #${selectedTransaction.id}
          </h2>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #777;">Date:</span>
            <span>${new Date(selectedTransaction.date).toLocaleString()}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #777;">Amount:</span>
            <span style="font-weight: bold; color: ${selectedTransaction.category === 'Revenue' ? 'green' : 'red'}">
              ${selectedTransaction.category === 'Revenue' ? '+' : '-'}$${selectedTransaction.amount.toFixed(2)}
            </span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #777;">Type:</span>
            <span>${selectedTransaction.category}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #777;">Status:</span>
            <span>${selectedTransaction.status}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #777;">User:</span>
            <span>${selectedTransaction.user_id}</span>
          </div>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>This is an official receipt for your transaction.</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: `transaction-${selectedTransaction.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      })
      .save();
  };

  // Print transaction details
  const printTransactionDetails = () => {
    if (!selectedTransaction) return;
    const content = `
      <h1>Transaction Receipt</h1>
      <p>ID: ${selectedTransaction.id}</p>
      <p>Date: ${new Date(selectedTransaction.date).toLocaleString()}</p>
      <p>Amount: ${selectedTransaction.amount}</p>
      <p>Type: ${selectedTransaction.category}</p>
      <p>Status: ${selectedTransaction.status}</p>
      <p>User: ${selectedTransaction.user_id}</p>
    `;
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow?.document.write(content);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
    printWindow?.close();
  };

  // Share transaction details
  const shareTransactionDetails = () => {
    if (!selectedTransaction) return;
    if (navigator.share) {
      navigator.share({
        title: `Transaction #${selectedTransaction.id}`,
        text: `Transaction details: Amount: $${selectedTransaction.amount}, Type: ${selectedTransaction.category}`,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      alert('Web Share API not supported in your browser');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#1a1c23]">
      {/* Sidebar */}
      <aside className="dashboard-sidebar bg-black text-white w-64 h-full flex flex-col pt-6 pb-4">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-4">
            <img
              src="/adobe-analytics-logo.svg"
              alt="Penta Logo"
              className="w-8 h-8"
            />
            <div className="text-white text-2xl font-['Pacifico']">Penta</div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <a href="/dashboard" className="flex items-center px-4 py-3 text-white bg-white/10 rounded-lg relative overflow-hidden group">
            <span className="absolute left-0 top-0 h-full w-1 bg-white transform transition-transform duration-300 ease-out group-hover:scale-y-100 scale-y-100"></span>
            <div className="w-6 h-6 flex items-center justify-center mr-3 z-10">
              <i className="ri-dashboard-line text-white"></i>
            </div>
            <span className="font-semibold z-10 text-white">Dashboard</span>
          </a>

          <Link to="/transactions" className="flex items-center px-4 py-3 text-white hover:bg-gray-700 rounded-lg transition-all duration-200 group relative overflow-hidden">
            <span className="absolute left-0 top-0 h-full w-1 bg-white transform scale-y-0 transition-transform duration-300 ease-out group-hover:scale-y-100"></span>
            <div className="w-6 h-6 flex items-center justify-center mr-3 z-10">
              <i className="ri-exchange-dollar-line text-white"></i>
            </div>
            <span className="z-10 text-white">Transactions</span>
          </Link>

          {[
            { href: '#', icon: 'ri-wallet-3-line', label: 'Wallet' },
            { href: '#', icon: 'ri-line-chart-line', label: 'Analytics' },
            { href: '#', icon: 'ri-user-line', label: 'Personal' },
            { href: '#', icon: 'ri-message-3-line', label: 'Message' },
            { href: '#', icon: 'ri-settings-line', label: 'Settings' }
          ].map((item, idx) => (
            <a key={idx} href={item.href} className="flex items-center px-4 py-3 text-white hover:bg-gray-700 rounded-lg transition-all duration-200 group relative overflow-hidden">
              <span className="absolute left-0 top-0 h-full w-1 bg-white transform scale-y-0 transition-transform duration-300 ease-out group-hover:scale-y-100"></span>
              <div className="w-6 h-6 flex items-center justify-center mr-3 z-10">
                <i className={`${item.icon} text-white`}></i>
              </div>
              <span className="z-10 text-white">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h1 className="text-2xl font-semibold text-white">Transactions</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="search" 
                placeholder="Search..." 
                className="w-64 px-4 py-2 pl-10 bg-gray-800 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <RiSearchLine />
              </div>
            </div>
            <button className="relative p-2 text-gray-400 hover:text-white">
              <RiNotification3Line className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center">
              <img 
                src="https://readdy.ai/api/search-image?query=professional%2520portrait%2520photo%2520of%2520a%2520young%2520businessman%2520with%2520short%2520hair%252C%2520high%2520quality%252C%2520studio%2520lighting%252C%2520professional%2520headshot&width=40&height=40&seq=1&orientation=squarish" 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Transactions Content */}
        <div className="p-6 space-y-6">
          {/* Filters and Actions */}
          <div className="bg-black-300 p-6 rounded-lg">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Date Range Filter */}
                <div className="relative" ref={typeFilterRef}>
                  <button 
                    ref={dateRangeBtnRef}
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg text-sm whitespace-nowrap text-white"
                  >
                    <RiCalendarLine className="mr-2" />
                    <span>{formatDateRange()}</span>
                    <RiArrowDownSLine className="ml-2" />
                  </button>
                  
                  {showDatePicker && (
                    <div 
                      ref={datePickerRef}
                      className="absolute top-full left-0 z-10 w-72 bg-[#22242c] rounded-lg shadow-lg mt-1 p-4 text-white"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-white">Select Date Range</h3>
                        <button 
                          onClick={() => setShowDatePicker(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <RiCloseLine />
                        </button>
                      </div>
                      {renderCalendar()}
                      <div className="flex justify-between">
                        <button 
                          onClick={resetDateFilter}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white"
                        >
                          Reset
                        </button>
                        <button 
                          onClick={applyDateFilter}
                          className="px-3 py-1.5 bg-primary text-black hover:bg-primary/90 rounded-lg text-sm"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transaction Type Filter */}
                <div className="relative" ref={typeFilterRef}>
                  <button 
                    onClick={() => setShowTypeFilter(!showTypeFilter)}
                    className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg text-sm whitespace-nowrap text-white"
                  >
                    <RiFilterLine className="mr-2" />
                    <span>{transactionType}</span>
                    <RiArrowDownSLine className="ml-2" />
                  </button>

                  {showTypeFilter && (
                    <div className="absolute top-full left-0 z-10 bg-[#22242c] min-w-[160px] shadow-lg rounded-lg mt-1 text-white">
                      {['All Transactions', 'Income', 'Expenses', 'Transfers'].map((type) => (
                        <a
                          key={type}
                          href="#"
                          className="block px-4 py-2 hover:bg-[#2d303a]"
                          onClick={(e) => {
                            e.preventDefault();
                            handleTransactionType(type);
                          }}
                        >
                          {type}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amount Range Filter */}
                <div className="relative" ref={amountFilterRef}>
                  <button 
                    onClick={() => setShowAmountFilter(!showAmountFilter)}
                    className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg text-sm whitespace-nowrap text-white"
                  >
                    <RiMoneyDollarCircleLine className="mr-2" />
                    <span>Amount</span>
                    <RiArrowDownSLine className="ml-2" />
                  </button>

                  {showAmountFilter && (
                    <div className="absolute top-full left-0 z-10 bg-[#22242c] w-72 shadow-lg rounded-lg mt-1 p-4 text-white">
                      <h3 className="font-medium mb-4">Amount Range</h3>
                      <div className="flex justify-between mb-2 text-sm text-gray-300">
                        <span>$0</span>
                        <span>${maxAmount.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="15000" 
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(parseInt(e.target.value))}
                        className="w-full h-1 bg-[#374151] rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-end mt-4">
                        <button 
                          onClick={applyAmountFilter}
                          className="px-3 py-1.5 bg-primary text-black hover:bg-primary/90 rounded-lg text-sm"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <input 
                    type="search" 
                    placeholder="Search transactions..." 
                    className="w-64 px-4 py-2 pl-10 bg-gray-800 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <RiSearchLine />
                  </div>
                </div>

                {/* Export Button */}
                <button 
                  className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg text-sm text-white hover:bg-gray-700 transition-colors whitespace-nowrap"
                  onClick={exportAllTransactions}
                >
                  <RiDownloadLine className="mr-1" />
                  <span>Export</span>
                </button>

                {/* Add Transaction Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  <RiAddLine className="mr-1" />
                  <span>Add Transaction</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-[#22242c] p-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Transaction History</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Show:</span>
                  <div className="relative" ref={entriesRef}>
                    <button 
                      onClick={() => setShowEntries(!showEntries)}
                      className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap text-white"
                    >
                      <span>{entriesPerPage} entries</span>
                      <RiArrowDownSLine />
                    </button>
                    {showEntries && (
                      <div className="absolute top-full right-0 z-10 bg-[#22242c] min-w-[160px] shadow-lg rounded-lg mt-1 text-white">
                        {[10, 25, 50, 100].map((entries) => (
                          <a 
                            key={entries}
                            href="#" 
                            className="block px-4 py-2 hover:bg-[#2d303a]"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEntriesChange(entries);
                            }}
                          >
                            {entries} entries
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Sort by:</span>
                  <div className="relative" ref={sortByRef}>
                    <button 
                      onClick={() => setShowSortBy(!showSortBy)}
                      className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap text-white"
                    >
                      <span>
                        {sortConfig.key === 'date' && 'Date'}
                        {sortConfig.key === 'amount' && 'Amount'}
                        {sortConfig.key === 'category' && 'Type'}
                        {sortConfig.key === 'status' && 'Status'}
                        {sortConfig.direction === 'ascending' ? ' (asc)' : ' (desc)'}
                      </span>
                      <RiArrowDownSLine />
                    </button>
                    {showSortBy && (
                      <div className="absolute top-full right-0 z-10 bg-[#22242c] min-w-[160px] shadow-lg rounded-lg mt-1 text-white">
                        {['date', 'amount', 'category', 'status'].map((key) => (
                          <a 
                            key={key}
                            href="#" 
                            className="block px-4 py-2 hover:bg-[#2d303a]"
                            onClick={(e) => {
                              e.preventDefault();
                              requestSort(key);
                              setShowSortBy(false);
                            }}
                          >
                            {key.charAt(0).toUpperCase() + key.slice(1)} 
                            {sortConfig.key === key && (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="pb-3 font-medium">
                      <div className="flex items-center">
                        <span>Transaction ID</span>
                        <button 
                          className="ml-1 text-gray-500"
                          onClick={() => requestSort('id')}
                        >
                          <RiArrowUpDownLine className="text-xs" />
                        </button>
                      </div>
                    </th>
                    <th className="pb-3 font-medium">
                      <div className="flex items-center">
                        <span>Name</span>
                        <button 
                          className="ml-1 text-gray-500"
                          onClick={() => requestSort('user_id')}
                        >
                          <RiArrowDownSLine className="text-xs" />
                        </button>
                      </div>
                    </th>
                    <th className="pb-3 font-medium">
                      <div className="flex items-center">
                        <span>Date</span>
                        <button 
                          className="ml-1 text-gray-500"
                          onClick={() => requestSort('date')}
                        >
                          <RiArrowUpDownLine className="text-xs" />
                        </button>
                      </div>
                    </th>
                    <th className="pb-3 font-medium">
                      <div className="flex items-center">
                        <span>Type</span>
                        <button 
                          className="ml-1 text-gray-500"
                          onClick={() => requestSort('category')}
                        >
                          <RiArrowUpDownLine className="text-xs" />
                        </button>
                      </div>
                    </th>
                    <th className="pb-3 font-medium">
                      <div className="flex items-center">
                        <span>Amount</span>
                        <button 
                          className="ml-1 text-gray-500"
                          onClick={() => requestSort('amount')}
                        >
                          <RiArrowUpDownLine className="text-xs" />
                        </button>
                      </div>
                    </th>
                    <th className="pb-3 font-medium">
                      <div className="flex items-center">
                        <span>Status</span>
                        <button 
                          className="ml-1 text-gray-500"
                          onClick={() => requestSort('status')}
                        >
                          <RiArrowUpDownLine className="text-xs" />
                        </button>
                      </div>
                    </th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((transaction) => (
                    <tr 
                      key={transaction._id}
                      className="border-b border-gray-800 cursor-pointer hover:bg-[#2d303a] transition-colors text-white"
                      onClick={() => openTransactionDetails(transaction)}
                    >
                      <td className="py-4 text-sm text-gray-400">#{transaction.id}</td>

                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          {transaction.user_profile ? (
                            <img src={transaction.user_profile} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <RiUserLine className="text-blue-500" />
                            </div>
                          )}
                          <span>{transaction.user_id}</span>
                        </div>
                      </td>

                      <td className="py-4 text-gray-400">
                        {new Date(transaction.date).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          transaction.category === 'Revenue' ? 'bg-green-500/10 text-green-500' :
                          transaction.category === 'Expense' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {transaction.category}
                        </span>
                      </td>

                      <td className={`py-4 font-medium ${
                        transaction.category === 'Revenue' ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {transaction.category === 'Revenue' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </td>

                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          transaction.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                          transaction.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>

                      <td className="py-4 text-right">
                        <div className="relative" ref={actionMenuRef}>
                          <button 
                            className="p-2 text-gray-400 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActionMenu(transaction._id, e);
                            }}
                          >
                            <RiMore2Fill />
                          </button>
                          {activeActionMenu === transaction._id && (
                            <div className="absolute right-0 z-10 bg-[#22242c] min-w-[160px] shadow-lg rounded-lg mt-1 text-white">
                              <a 
                                href="#" 
                                className="flex items-center px-4 py-2 hover:bg-[#2d303a]"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openTransactionDetails(transaction);
                                  setActiveActionMenu(null);
                                }}
                              >
                                <RiEyeLine className="mr-2" />
                                <span>View</span>
                              </a>
                              <a 
                                href="#" 
                                className="flex items-center px-4 py-2 hover:bg-[#2d303a]"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  alert('Edit functionality would be implemented here');
                                  setActiveActionMenu(null);
                                }}
                              >
                                <RiSettingsLine className="mr-2" />
                                <span>Edit</span>
                              </a>
                              <a 
                                href="#" 
                                className="flex items-center px-4 py-2 hover:bg-[#2d303a] text-red-500"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (confirm('Are you sure you want to delete this transaction?')) {
                                    axios.delete(`http://localhost:3001/transactions/${transaction._id}`)
                                      .then(() => fetchTransactions())
                                      .catch(err => console.error('Error deleting transaction:', err));
                                  }
                                  setActiveActionMenu(null);
                                }}
                              >
                                <RiDeleteBinLine className="mr-2" />
                                <span>Delete</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
  {/* Entry count */}
  <div className="text-sm text-gray-400">
    Showing <span className="font-medium">{indexOfFirstTransaction + 1}</span> to <span className="font-medium">
      {Math.min(indexOfLastTransaction, filteredTransactions.length)}
    </span> of <span className="font-medium">{filteredTransactions.length}</span> entries
  </div>

  {/* Pagination controls */}
  <div className="flex items-center gap-1">
    {/* Prev */}
    <button 
      className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800 text-white text-sm hover:bg-gray-700 disabled:opacity-40"
      disabled={currentPage === 1}
      onClick={() => paginate(currentPage - 1)}
    >
      <RiArrowLeftSLine />
    </button>

    {/* Page Numbers */}
    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
      <button 
        key={number}
        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition ${
          currentPage === number 
            ? 'bg-primary text-black' 
            : 'bg-gray-800 text-white hover:bg-gray-700'
        }`}
        onClick={() => paginate(number)}
      >
        {number}
      </button>
    ))}

    {/* Next */}
    <button 
      className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800 text-white text-sm hover:bg-gray-700 disabled:opacity-40"
      disabled={currentPage === totalPages}
      onClick={() => paginate(currentPage + 1)}
    >
      <RiArrowRightSLine />
    </button>
  </div>
</div>

          </div>
        </div>
      </main>

      {/* Transaction Details Panel */}
      {showDetailsPanel && selectedTransaction && (
        <div className="fixed top-0 right-0 w-full sm:w-96 h-full bg-[#2c2f33] shadow-lg z-50 transition-transform transform translate-x-0 text-white">
          <div className="p-6 border-b border-gray-600 bg-[#2c2f33]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Transaction Details</h2>
              <button 
                onClick={() => setShowDetailsPanel(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto bg-[#32363b]" style={{ height: 'calc(100vh - 80px)' }}>
            <div className="space-y-6" id="transaction-details-panel">
              {/* Transaction Status */}
              <div className="flex flex-col items-center p-6 bg-[#3a3f44] rounded-lg">
                <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${
                  selectedTransaction.status === 'Completed' ? 'bg-green-500/20' : 
                  selectedTransaction.status === 'Pending' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                }`}>
                  {selectedTransaction.status === 'Completed' ? (
                    <RiCheckLine className="text-green-400 text-3xl" />
                  ) : selectedTransaction.status === 'Pending' ? (
                    <RiSpotifyFill className="text-yellow-400 text-3xl" />
                  ) : (
                    <RiCloseLine className="text-red-400 text-3xl" />
                  )}
                </div>
                <h3 className="text-xl font-semibold">
                  {selectedTransaction.status === 'Completed' ? 'Payment Completed' : 
                  selectedTransaction.status === 'Pending' ? 'Payment Pending' : 'Payment Failed'}
                </h3>
                <p className={`text-2xl font-bold mt-2 ${
                  selectedTransaction.category === 'Revenue' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {selectedTransaction.category === 'Revenue' ? '+' : '-'}${selectedTransaction.amount.toFixed(2)}
                </p>
                <p className="text-gray-400 mt-1">
                  {new Date(selectedTransaction.date).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Transaction Info */}
              <div className="bg-[#3a3f44] rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Transaction Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction ID</span>
                    <span>#{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type</span>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      selectedTransaction.category === 'Revenue' ? 'bg-green-500/20 text-green-300' :
                      selectedTransaction.category === 'Expense' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {selectedTransaction.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      selectedTransaction.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                      selectedTransaction.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Method</span>
                    <div className="flex items-center">
                      <RiBankCardLine className="mr-2" />
                      <span>{selectedTransaction.paymentMethod || 'Credit Card'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sender/Recipient Info */}
              <div className="bg-[#3a3f44] rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">
                  {selectedTransaction.category === 'Revenue' ? 'Sender' : 'Recipient'} Information
                </h3>
                <div className="flex items-center space-x-4 mb-6">
                  {selectedTransaction.user_profile ? (
                    <img 
                      src={selectedTransaction.user_profile} 
                      alt={selectedTransaction.user_id} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <RiUserLine className="text-blue-400 text-xl" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedTransaction.user_id}</p>
                    <p className="text-sm text-gray-400">{selectedTransaction.email || 'user@example.com'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Number</span>
                    <span>{selectedTransaction.accountNumber || '•••• •••• •••• 1234'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bank</span>
                    <span>{selectedTransaction.bank || 'Penta Bank'}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedTransaction.notes && (
                <div className="bg-[#3a3f44] rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Notes</h3>
                  <p className="text-gray-300">{selectedTransaction.notes}</p>
                </div>
              )}

              {/* Receipt */}
              <div className="bg-[#3a3f44] rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Receipt</h3>
                <div className="bg-[#2c2f33] p-4 rounded-lg" id="receipt-section">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-primary text-xl font-pacifico">Penta</div>
                    <div className="text-sm text-gray-400">Receipt #R-{selectedTransaction.id}</div>
                  </div>
                  <div className="border-t border-gray-600 pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Amount</span>
                      <span>${selectedTransaction.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Fee</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${selectedTransaction.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-6">
                    <p>This is an electronic receipt for your transaction.</p>
                    <p>© 2025 Penta Financial Services</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button 
                  className="flex-1 flex items-center justify-center space-x-2 bg-[#3a3f44] py-3 rounded-lg hover:bg-[#444a52] transition-colors whitespace-nowrap"
                  onClick={downloadTransactionDetails}
                >
                  <RiDownloadLine />
                  <span>Download</span>
                </button>

                <button 
                  className="flex-1 flex items-center justify-center space-x-2 bg-[#3a3f44] py-3 rounded-lg hover:bg-[#444a52] transition-colors whitespace-nowrap"
                  onClick={printTransactionDetails}
                >
                  <RiPrinterLine />
                  <span>Print</span>
                </button>

                <button 
                  className="flex-1 flex items-center justify-center space-x-2 bg-[#3a3f44] py-3 rounded-lg hover:bg-[#444a52] transition-colors whitespace-nowrap"
                  onClick={shareTransactionDetails}
                >
                  <RiShareLine />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2c2f33] rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Transaction</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">User Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-[#3a3f44] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                  value={newTransaction.user_id}
                  onChange={(e) => setNewTransaction({...newTransaction, user_id: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-[#3a3f44] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select
                  className="w-full px-3 py-2 bg-[#3a3f44] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                >
                  <option value="Revenue">Income</option>
                  <option value="Expense">Expense</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 bg-[#3a3f44] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                  value={newTransaction.status}
                  onChange={(e) => setNewTransaction({...newTransaction, status: e.target.value})}
                >
                  <option value="Paid">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 bg-[#3a3f44] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-black"
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;