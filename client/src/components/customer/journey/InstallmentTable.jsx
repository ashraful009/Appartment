import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

const dummyInstallments = [
  { id: '110487', charge: 'Booking Money', invoiceDate: 'Monday, March 23rd, 2026', dueDate: 'Wednesday, April 22nd, 2026', total: '৳1,699.00BDT', status: 'Unpaid' },
  { id: '956', charge: '1st Installment', invoiceDate: 'Sunday, February 17th, 2026', dueDate: 'Sunday, February 17th, 2026', total: '৳150.00BDT', status: 'Paid' },
  { id: '957', charge: '2nd Installment', invoiceDate: 'Sunday, March 17th, 2026', dueDate: 'Sunday, March 17th, 2026', total: '৳150.00BDT', status: 'Paid' }
];

const InstallmentTable = () => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mt-4">

      {/* The Table Header & Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b-4 border-green-500 text-gray-700">
            <tr>
              {['Invoice #', 'Charge', 'Invoice Date', 'Due Date', 'Total', 'Status'].map((col) => (
                <th key={col} className="px-6 py-4 text-sm font-semibold whitespace-nowrap cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    {col}
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dummyInstallments.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.charge}</td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.invoiceDate}</td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.dueDate}</td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{item.total}</td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                  {item.status === 'Unpaid' ? (
                    <span className="px-6 py-1.5 border border-red-300 text-red-500 font-medium rounded-sm">Unpaid</span>
                  ) : (
                    <span className="px-6 py-1.5 border border-green-300 text-green-600 font-medium rounded-sm">Paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstallmentTable;
