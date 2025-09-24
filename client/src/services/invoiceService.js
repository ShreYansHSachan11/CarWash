import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class InvoiceService {
  generateInvoiceNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${timestamp}-${random}`;
  }

  async generatePDF(booking, options = {}) {
    const {
      invoiceNumber = this.generateInvoiceNumber(),
      invoiceDate = new Date(),
      filename = `invoice-${booking._id}.pdf`
    } = options;

    try {
      // Create a temporary container for the invoice
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);

      // Create the invoice HTML
      const invoiceHTML = this.createInvoiceHTML(booking, invoiceNumber, invoiceDate);
      tempContainer.innerHTML = invoiceHTML;

      // Wait for any images or fonts to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate canvas from HTML
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123, // A4 height in pixels at 96 DPI
        scrollX: 0,
        scrollY: 0
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return {
        pdf,
        filename,
        invoiceNumber,
        invoiceDate
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF invoice');
    }
  }

  async downloadPDF(booking, options = {}) {
    try {
      const { pdf, filename } = await this.generatePDF(booking, options);
      pdf.save(filename);
      return true;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  async printInvoice(booking, options = {}) {
    const {
      invoiceNumber = this.generateInvoiceNumber(),
      invoiceDate = new Date()
    } = options;

    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Create the invoice HTML with print styles
      const invoiceHTML = this.createPrintableInvoiceHTML(booking, invoiceNumber, invoiceDate);
      
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };

      return true;
    } catch (error) {
      console.error('Error printing invoice:', error);
      throw error;
    }
  }

  createInvoiceHTML(booking, invoiceNumber, invoiceDate) {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatPrice = (price) => {
      return `$${price.toFixed(2)}`;
    };

    const getServicePrice = (serviceType) => {
      const servicePricing = {
        'Basic Wash': 15,
        'Deluxe Wash': 25,
        'Full Detailing': 50
      };
      return servicePricing[serviceType] || 0;
    };

    const getAddOnPrice = (addon) => {
      const addOnPricing = {
        'Interior Cleaning': 10,
        'Polishing': 15,
        'Wax Protection': 20,
        'Tire Shine': 5,
        'Air Freshener': 3
      };
      return addOnPricing[addon] || 0;
    };

    const basePrice = getServicePrice(booking.serviceType);
    const addOnsTotal = booking.addOns?.reduce((total, addon) => total + getAddOnPrice(addon), 0) || 0;

    return `
      <div style="max-width: 794px; margin: 0 auto; background: white; padding: 40px; font-family: Arial, sans-serif; color: #333;">
        <!-- Header -->
        <div style="border-bottom: 3px solid #2563eb; padding-bottom: 24px; margin-bottom: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1 style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 0 0 8px 0;">CarWash Pro</h1>
              <p style="color: #666; margin: 0 0 16px 0;">Professional Car Washing Services</p>
              <div style="font-size: 14px; color: #666; line-height: 1.4;">
                <p style="margin: 0;">123 Main Street</p>
                <p style="margin: 0;">City, State 12345</p>
                <p style="margin: 0;">Phone: (555) 123-4567</p>
                <p style="margin: 0;">Email: info@carwashpro.com</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 24px; font-weight: bold; color: #333; margin: 0 0 8px 0;">INVOICE</h2>
              <div style="font-size: 14px; color: #666; line-height: 1.4;">
                <p style="margin: 0;"><strong>Invoice #:</strong> ${invoiceNumber}</p>
                <p style="margin: 0;"><strong>Date:</strong> ${new Date(invoiceDate).toLocaleDateString()}</p>
                <p style="margin: 0;"><strong>Booking ID:</strong> ${booking._id}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer and Service Info -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 32px;">
          <div style="width: 48%;">
            <h3 style="font-size: 18px; font-weight: 600; color: #333; margin: 0 0 16px 0;">Bill To:</h3>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
              <p style="font-weight: 500; color: #333; margin: 0;">${booking.customerName}</p>
              <p style="color: #666; margin: 4px 0 0 0;">Customer</p>
            </div>
          </div>
          <div style="width: 48%;">
            <h3 style="font-size: 18px; font-weight: 600; color: #333; margin: 0 0 16px 0;">Service Details:</h3>
            <div style="font-size: 14px; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${formatDate(booking.date)}</p>
              <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${booking.timeSlot}</p>
              <p style="margin: 0;"><strong>Status:</strong> <span style="color: ${
                booking.status === 'Completed' ? '#059669' : 
                booking.status === 'Confirmed' ? '#2563eb' : 
                booking.status === 'In Progress' ? '#7c3aed' :
                booking.status === 'Pending' ? '#d97706' : '#dc2626'
              }; font-weight: 500;">${booking.status}</span></p>
            </div>
          </div>
        </div>

        <!-- Vehicle Information -->
        <div style="margin-bottom: 32px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #333; margin: 0 0 16px 0;">Vehicle Information:</h3>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
            <p style="font-weight: 500; color: #333; margin: 0 0 4px 0;">
              ${booking.carDetails.year} ${booking.carDetails.make} ${booking.carDetails.model}
            </p>
            <p style="color: #666; margin: 0; text-transform: capitalize;">Type: ${booking.carDetails.type}</p>
          </div>
        </div>

        <!-- Services Table -->
        <div style="margin-bottom: 32px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #333; margin: 0 0 16px 0;">Services:</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 500; color: #333; border-bottom: 1px solid #e5e7eb;">Service</th>
                <th style="padding: 12px 16px; text-align: center; font-size: 14px; font-weight: 500; color: #333; border-bottom: 1px solid #e5e7eb;">Duration</th>
                <th style="padding: 12px 16px; text-align: right; font-size: 14px; font-weight: 500; color: #333; border-bottom: 1px solid #e5e7eb;">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px 16px; font-size: 14px; color: #333; border-bottom: 1px solid #e5e7eb;">${booking.serviceType}</td>
                <td style="padding: 12px 16px; font-size: 14px; color: #666; text-align: center; border-bottom: 1px solid #e5e7eb;">${booking.duration} minutes</td>
                <td style="padding: 12px 16px; font-size: 14px; color: #333; text-align: right; font-weight: 500; border-bottom: 1px solid #e5e7eb;">${formatPrice(basePrice)}</td>
              </tr>
              ${booking.addOns ? booking.addOns.map(addon => `
                <tr>
                  <td style="padding: 12px 16px; font-size: 14px; color: #333; border-bottom: 1px solid #e5e7eb;">${addon} (Add-on)</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #666; text-align: center; border-bottom: 1px solid #e5e7eb;">-</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #333; text-align: right; font-weight: 500; border-bottom: 1px solid #e5e7eb;">${formatPrice(getAddOnPrice(addon))}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>

        <!-- Total -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
          <div style="width: 300px;">
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 14px; color: #666;">Subtotal:</span>
                <span style="font-size: 14px; font-weight: 500;">${formatPrice(basePrice + addOnsTotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 14px; color: #666;">Tax (0%):</span>
                <span style="font-size: 14px; font-weight: 500;">$0.00</span>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 18px; font-weight: 600; color: #333;">Total:</span>
                  <span style="font-size: 20px; font-weight: bold; color: #2563eb;">${formatPrice(booking.price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center; font-size: 14px; color: #666;">
          <p style="margin: 0 0 8px 0;">Thank you for choosing CarWash Pro!</p>
          <p style="margin: 0;">For questions about this invoice, please contact us at (555) 123-4567 or info@carwashpro.com</p>
        </div>
      </div>
    `;
  }

  createPrintableInvoiceHTML(booking, invoiceNumber, invoiceDate) {
    const invoiceContent = this.createInvoiceHTML(booking, invoiceNumber, invoiceDate);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            @media print {
              body { margin: 0; }
              @page { margin: 0.5in; }
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          ${invoiceContent}
        </body>
      </html>
    `;
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;