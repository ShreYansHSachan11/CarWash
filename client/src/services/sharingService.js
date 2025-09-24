import QRCode from 'qrcode';

class SharingService {
  constructor() {
    this.baseUrl = window.location.origin;
  }

  // Generate shareable URL for booking confirmation
  generateShareableUrl(bookingId, token = null) {
    if (token) {
      return `${this.baseUrl}/booking/shared/${bookingId}?token=${token}`;
    }
    return `${this.baseUrl}/booking/shared/${bookingId}`;
  }

  // Generate a secure token for sharing (simple implementation)
  generateShareToken(bookingId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return btoa(`${bookingId}-${timestamp}-${random}`).replace(/[+/=]/g, '');
  }

  // Generate QR code for booking details
  async generateQRCode(bookingId, options = {}) {
    const {
      token = this.generateShareToken(bookingId),
      size = 200,
      margin = 2,
      color = {
        dark: '#000000',
        light: '#FFFFFF'
      }
    } = options;

    try {
      const shareUrl = this.generateShareableUrl(bookingId, token);
      
      const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
        width: size,
        margin: margin,
        color: color,
        errorCorrectionLevel: 'M'
      });

      return {
        dataUrl: qrCodeDataUrl,
        shareUrl: shareUrl,
        token: token
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Generate QR code as SVG
  async generateQRCodeSVG(bookingId, options = {}) {
    const {
      token = this.generateShareToken(bookingId),
      size = 200,
      margin = 2
    } = options;

    try {
      const shareUrl = this.generateShareableUrl(bookingId, token);
      
      const qrCodeSVG = await QRCode.toString(shareUrl, {
        type: 'svg',
        width: size,
        margin: margin,
        errorCorrectionLevel: 'M'
      });

      return {
        svg: qrCodeSVG,
        shareUrl: shareUrl,
        token: token
      };
    } catch (error) {
      console.error('Error generating QR code SVG:', error);
      throw new Error('Failed to generate QR code SVG');
    }
  }

  // Copy URL to clipboard
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return successful;
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  // Share via Web Share API (if supported)
  async shareViaWebAPI(bookingId, bookingDetails) {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    const shareUrl = this.generateShareableUrl(bookingId);
    
    try {
      await navigator.share({
        title: 'Car Wash Booking Confirmation',
        text: `Booking confirmation for ${bookingDetails.customerName} - ${bookingDetails.serviceType}`,
        url: shareUrl
      });
      return true;
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled the share
        return false;
      }
      throw error;
    }
  }

  // Generate social media sharing URLs
  generateSocialShareUrls(bookingId, bookingDetails) {
    const shareUrl = this.generateShareableUrl(bookingId);
    const text = `Check out my car wash booking confirmation for ${bookingDetails.serviceType}`;
    
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent('Car Wash Booking Confirmation')}&body=${encodeURIComponent(text + '\n\n' + shareUrl)}`
    };
  }

  // Download QR code as image
  downloadQRCode(dataUrl, filename = 'booking-qr-code.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Validate share token (basic validation)
  validateShareToken(token, bookingId) {
    try {
      const decoded = atob(token);
      const parts = decoded.split('-');
      return parts.length >= 3 && parts[0] === bookingId;
    } catch (error) {
      return false;
    }
  }
}

export const sharingService = new SharingService();
export default sharingService;