import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Download, 
  QrCode, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail,
  MessageCircle,
  Check,
  X
} from 'lucide-react';
import { sharingService } from '../../services/sharingService';
import { Modal } from '../ui';

const ShareBooking = ({ booking, isOpen, onClose }) => {
  const [qrCode, setQrCode] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && booking) {
      generateQRCode();
    }
  }, [isOpen, booking]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await sharingService.generateQRCode(booking._id);
      setQrCode(result.dataUrl);
      setShareUrl(result.shareUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      const success = await sharingService.copyToClipboard(shareUrl);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setError('Failed to copy URL');
      }
    } catch (err) {
      setError('Failed to copy URL');
    }
  };

  const handleWebShare = async () => {
    try {
      await sharingService.shareViaWebAPI(booking._id, booking);
    } catch (err) {
      if (err.message !== 'Web Share API not supported') {
        setError('Failed to share');
      }
    }
  };

  const handleDownloadQR = () => {
    if (qrCode) {
      sharingService.downloadQRCode(qrCode, `booking-${booking._id}-qr.png`);
    }
  };

  const socialUrls = booking ? sharingService.generateSocialShareUrls(booking._id, booking) : {};

  const openSocialShare = (url) => {
    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Booking">
      <div className="p-6 max-w-md mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* QR Code Section */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h3>
          
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : qrCode ? (
            <div className="space-y-4">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img src={qrCode} alt="Booking QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-600">
                Scan this QR code to view the booking confirmation
              </p>
              <button
                onClick={handleDownloadQR}
                className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </button>
            </div>
          ) : (
            <div className="text-gray-500">Failed to generate QR code</div>
          )}
        </div>

        {/* Share URL Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Share Link</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              onClick={handleCopyUrl}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Native Share Button (if supported) */}
        {navigator.share && (
          <div className="mb-6">
            <button
              onClick={handleWebShare}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share via Device
            </button>
          </div>
        )}

        {/* Social Media Share Buttons */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Share on Social Media</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openSocialShare(socialUrls.facebook)}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Facebook className="h-5 w-5 mr-2" />
              Facebook
            </button>
            
            <button
              onClick={() => openSocialShare(socialUrls.twitter)}
              className="flex items-center justify-center px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Twitter className="h-5 w-5 mr-2" />
              Twitter
            </button>
            
            <button
              onClick={() => openSocialShare(socialUrls.whatsapp)}
              className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              WhatsApp
            </button>
            
            <button
              onClick={() => openSocialShare(socialUrls.email)}
              className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              Email
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareBooking;