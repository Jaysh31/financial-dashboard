import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { parseISO, isAfter, isBefore, format } from 'date-fns';
import dayjs from 'dayjs'; // optional for formatting date
import StatChart from './StatChart';


declare global {
  interface Window {
    echarts: any;
  }
}

interface Transaction {
  _id: string;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: string;
  user_profile: string;
}


const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [showAll, setShowAll] = useState(false);
const [fromDate, setFromDate] = useState('');
const [toDate, setToDate] = useState('');
const [profileOpen, setProfileOpen] = useState(false);
const username = localStorage.getItem("username");
console.log("Username from Dashboard:", username);

const months = Array.from({ length: 6 }, (_, i) =>
  dayjs().subtract(5 - i, 'month').format('MMM YYYY')
);

const revenueData = months.map(month =>
  transactions
    .filter(t =>
      t.category === 'Revenue' &&
      dayjs(t.date).format('MMM YYYY') === month
    )
    .reduce((sum, t) => sum + t.amount, 0)
);

const expenseData = months.map(month =>
  transactions
    .filter(t =>
      t.category === 'Expense' &&
      dayjs(t.date).format('MMM YYYY') === month
    )
    .reduce((sum, t) => sum + t.amount, 0)
);
  useEffect(() => {

    // Initialize Overview Chart
    const chartDom = document.getElementById('overviewChart');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Tooltip background remains light
          textStyle: {
            color: '#1f2937' // Tooltip text remains dark for contrast
          }
        },
        grid: {
          left: '0',
          right: '0',
          top: '10',
          bottom: '0',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          axisLine: {
            lineStyle: {
              color: '#4b5563' // Darker color for axis lines on dark background
            }
          },
          axisLabel: {
            color: '#9ca3af' // Lighter color for axis labels
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#374151', // Darker dashed line for grid
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#9ca3af' // Lighter color for axis labels
          }
        },
        series: [
          {
            name: 'Income',
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: {
              width: 3,
              color: 'rgba(87, 181, 231, 1)'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(87, 181, 231, 0.2)'
                }, {
                  offset: 1,
                  color: 'rgba(87, 181, 231, 0.01)'
                }]
              }
            },
            data: [300, 350, 300, 320, 410, 450, 570, 400, 390, 540, 450, 380]
          },
          {
            name: 'Expenses',
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: {
              width: 3,
              color: 'rgba(251, 191, 14, 1)'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(251, 191, 114, 0.2)'
                }, {
                  offset: 1,
                  color: 'rgba(251, 191, 114, 0.01)'
                }]
              }
            },
            data: [120, 200, 150, 80, 70, 110, 130, 180, 220, 270, 210, 160]
          }
        ]
      };
      myChart.setOption(option);
      // Resize chart when window is resized
      const handleResize = () => {
        myChart.resize();
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        myChart.dispose();
      };
    }
  }, []);


  useEffect(() => {
    axios.get('http://localhost:3001/transactions')
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error(err));
  }, []);
  const totalRevenue = transactions
  .filter((t) => t.category === 'Revenue' && t.status === 'Paid')
  .reduce((sum, t) => sum + t.amount, 0);

const totalExpenses = transactions
  .filter((t) => t.category === 'Expense' && t.status === 'Paid')
  .reduce((sum, t) => sum + t.amount, 0);

const balance = totalRevenue - totalExpenses;
const savings = totalRevenue * 0.10; // Example logic for savings

  const filteredTransactions = transactions
    .filter((tx) =>
      tx.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((tx) => {
      const txDate = parseISO(tx.date);
      const from = fromDate ? parseISO(fromDate) : null;
      const to = toDate ? parseISO(toDate) : null;
      return (!from || isAfter(txDate, from)) && (!to || isBefore(txDate, to));
    });

  const visibleTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5);







  useEffect(() => {
    const timeframeDropdown = document.getElementById('timeframeDropdown');
    const timeframeOptions = document.getElementById('timeframeOptions');

    if (!timeframeDropdown || !timeframeOptions) return;

    const handleDropdownClick = () => {
      timeframeOptions.classList.toggle('show');
    };

    const handleWindowClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.matches('#timeframeDropdown') &&
        !target.closest('#timeframeDropdown')
      ) {
        if (timeframeOptions.classList.contains('show')) {
          timeframeOptions.classList.remove('show');
        }
      }
    };

    timeframeDropdown.addEventListener('click', handleDropdownClick);
    window.addEventListener('click', handleWindowClick);

    const options = timeframeOptions.querySelectorAll('a');
    options.forEach((option) => {
      option.addEventListener('click', function(e) {
        e.preventDefault();
        timeframeDropdown.querySelector('span')!.textContent = this.textContent;
        timeframeOptions.classList.remove('show');
      });
    });

    return () => {
      timeframeDropdown.removeEventListener('click', handleDropdownClick);
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  return (
    
    <div className="min-h-screen">
      <div className="flex h-screen overflow-hidden">
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
      <span className="font-semibold z-10 text-white">Dashboard </span>
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



        {/* Main Content (remains the same as previous dark theme) */}
        <main className="flex-1 overflow-y-auto bg-[#1a1c23] custom-scrollbar">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h1 className="text-2xl font-semibold text-white">Dashboard - Hello {username}</h1>
            {/* <h1 className="text-2xl font-semibold text-white"> Hello {username}</h1> */}

            <div className="flex items-center space-x-4">
              <div className="relative">
                <input type="search" placeholder="Search..." className="w-64 px-4 py-2 pl-10 bg-gray-800 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white" />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <i className="ri-search-line"></i>
                </div>
              </div>
              <button className="relative p-2 text-gray-400 hover:text-white">
                <i className="ri-notification-3-line text-xl"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="relative">
  <button
    onClick={() => setProfileOpen(!profileOpen)}
    className="focus:outline-none"
  >
    <img
      src="https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20businessman%20with%20short%20hair%2C%20high%20quality%2C%20studio%20lighting%2C%20professional%20headshot&width=40&height=40&seq=1&orientation=squarish"
      alt="Profile"
      className="w-10 h-10 rounded-full object-cover"
    />
  </button>

  {profileOpen && (
    <div className="absolute right-0 mt-2 w-40 bg-[#22242c] rounded-lg shadow-lg border border-gray-700 z-50">
      <a href="/" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Profile</a>
      <a href="/" className="block px-4 py-2 text-sm text-white hover:bg-gray-700">Settings</a>
      <a href="/" className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-700">Logout</a>
    </div>
  )}
</div>

            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Balance Card */}
              
              
              <div className="stat-card p-6 rounded-lg bg-[#22242c] shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-400 font-medium">Balance</h3>
                  <div className="w-10 h-10 flex items-center justify-center bg-green-500/10 rounded-lg">
                    <i className="ri-wallet-3-line text-primary text-xl"></i>
                  </div>
                </div>
                <p className="text-3xl font-bold mt-2 text-white">${balance.toLocaleString()}</p>
              </div>

              {/* Revenue Card */}
              <div className="stat-card p-6 rounded-lg bg-[#22242c] shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-400 font-medium">Revenue</h3>
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 rounded-lg">
                    <i className="ri-money-dollar-circle-line text-blue-500 text-xl"></i>
                  </div>
                </div>
                <p className="text-3xl font-bold mt-2 text-white">${totalRevenue.toLocaleString()}</p>
              </div>

              {/* Expenses Card */}
              <div className="stat-card p-6 rounded-lg bg-[#22242c] shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-400 font-medium">Expenses</h3>
                  <div className="w-10 h-10 flex items-center justify-center bg-yellow-500/10 rounded-lg">
                    <i className="ri-shopping-cart-line text-yellow-500 text-xl"></i>
                  </div>
                </div>
                <p className="text-3xl font-bold mt-2 text-white">${totalExpenses.toLocaleString()}</p>
              </div>

              {/* Savings Card */}
              <div className="stat-card p-6 rounded-lg bg-[#22242c] shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-400 font-medium">Savings</h3>
                  <div className="w-10 h-10 flex items-center justify-center bg-purple-500/10 rounded-lg">
                    <i className="ri-safe-line text-purple-500 text-xl"></i>
                  </div>
                </div>
                <p className="text-3xl font-bold mt-2 text-white">${savings.toLocaleString()}</p>
              </div>
            </div>


            {/* Charts and Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overview Chart */}
              <div className="chart-container lg:col-span-2 p-6 rounded-lg bg-[#22242c] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Overview</h2>

                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="text-sm text-gray-400">Income</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="text-sm text-gray-400">Expenses</span>
                      </div>
                    </div>
                    <div className="relative">
                      <button id="timeframeDropdown" className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg text-sm !rounded-button whitespace-nowrap text-white">
                        <span>Monthly</span>
                        <i className="ri-arrow-down-s-line"></i>
                      </button>
                      <div id="timeframeOptions" className="dropdown-content bg-gray-800 shadow-lg border border-gray-700">
                        {/* <a href="#" className="text-sm text-white hover:bg-gray-700">Daily</a>
                        <a href="#" className="text-sm text-white hover:bg-gray-700">Weekly</a>
                        <a href="#" className="text-sm text-white hover:bg-gray-700">Monthly</a>
                        <a href="#" className="text-sm text-white hover:bg-gray-700">Yearly</a> */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full h-64">
                <StatChart 
  revenue={revenueData}     // e.g. [300, 320, 310, ...]
  expenses={expenseData}    // e.g. [100, 180, 120, ...]
  months={months}           // e.g. ['Jan', 'Feb', ..., 'Dec']
/>      </div>
              </div>

              {/* Recent Transactions */}
              
    <div className="transactions-container p-6 rounded-lg bg-[#22242c] shadow-sm ">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
        <a href="#" className="text-white text-sm">See all</a>
        </div>

      <div className="space-y-4">
        {transactions.slice(0, 3).map((t, index) => (
          <div key={t._id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={t.user_profile || `https://readdy.ai/api/search-image?query=portrait&width=40&height=40&seq=${index + 2}&orientation=squarish`}
                alt={t.user_id}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-white">
                  {t.category === 'Revenue' ? 'Received from' : 'Paid to'}
                </p>
                <p className="text-sm text-gray-400">{t.user_id}</p>
                <p className="text-xs text-gray-500">{dayjs(t.date).format('MMM D, YYYY')}</p>
              </div>
            </div>
            <span className={`font-medium ${t.category === 'Revenue' ? 'text-green-500' : 'text-red-500'}`}>
              {t.category === 'Revenue' ? '+' : '-'}${t.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
            </div>

            {/* Transactions Table */}
            <div className="transactions-container p-6 rounded-lg bg-[#22242c] shadow-sm">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
    <h2 className="text-xl font-semibold text-white">Transactions</h2>
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
      <div className="relative w-full sm:w-64">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by user ID..."
          className="w-full px-4 py-2 pl-10 bg-gray-800 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          <i className="ri-search-line"></i>
        </div>
      </div>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg"
      />
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg"
      />
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="text-left text-gray-400 border-b border-gray-800">
          <th className="pb-3 font-medium">Name</th>
          <th className="pb-3 font-medium">Date</th>
          <th className="pb-3 font-medium">Amount</th>
          <th className="pb-3 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {visibleTransactions.map((tx) => (
          <tr key={tx._id} className="transaction-row border-b border-gray-800 hover:bg-gray-800/70">
            <td className="py-4">
              <div className="flex items-center space-x-3">
                <img src={tx.user_profile} alt={tx.user_id} className="w-10 h-10 rounded-full object-cover" />
                <span className="text-white">{tx.user_id}</span>
              </div>
            </td>
            <td className="py-4 text-gray-400">
              {format(new Date(tx.date), 'EEE, dd MMM yyyy')}
            </td>
            <td className={`py-4 font-medium ${tx.amount >= 0 ? 'text-green-500' : 'text-yellow-500'}`}>
              {tx.amount >= 0 ? `+$${tx.amount}` : `-$${Math.abs(tx.amount)}`}
            </td>
            <td className="py-4">
              <span className={`
                px-3 py-1 rounded-full text-xs
                ${tx.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                  tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'}
              `}>
                {tx.status}
              </span>
            </td>
          </tr>
        ))}
        {visibleTransactions.length === 0 && (
          <tr><td colSpan={4} className="text-center py-4 text-gray-400">No matching transactions</td></tr>
        )}
      </tbody>
    </table>
  </div>

  {filteredTransactions.length > 5 && (
    <div className="text-center mt-4">
      <button
        onClick={() => setShowAll(!showAll)}
        className="text-sm text-blue-400 hover:underline"
      >
        {showAll ? 'Show Less' : 'Show All'}
      </button>
    </div>
  )}
</div>

          </div>
        </main>
      </div>
    </div>
  );    
};

export default Dashboard;   