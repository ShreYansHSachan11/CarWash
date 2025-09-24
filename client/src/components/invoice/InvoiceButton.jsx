import React, { useState } from 'react';
import { Download, Printer, FileText } from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';

const InvoiceButton = ({ booking, variant = 'download', className = '', children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);
      await invoiceService.downloadPDF(booking);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setError('Failed to download invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      setLoading(true);
      setError(null);
      await invoiceService.printInvoice(booking);
    } catch (err) {
      console.error('Error printing invoice:', err);
      setError('Failed to print invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'print':
        return <Printer className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDefaultText = () => {
    switch (variant) {
      case 'print':
        return loading ? 'Printing...' : 'Print Invoice';
      case 'download':
        return loading ? 'Downloading...' : 'Download Invoice';
      default:
        return loading ? 'Processing...' : 'Invoice';
    }
  };

  const handleClick = () => {
    if (variant === 'print') {
      handlePrint();
    } else {
      handleDownload();
    }
  };

  const baseClasses = "inline-flex items-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    download: "bg-green-600 text-white hover:bg-green-700",
    print: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`${baseClasses} ${variantClasses[variant] || variantClasses.secondary} ${className}`}
      >
        {getIcon()}
        <span className="ml-2">
          {children || getDefaultText()}
        </span>
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default InvoiceButton;