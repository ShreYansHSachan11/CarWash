import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Clock, Star } from 'lucide-react';

const Footer = () => {
  const handlePhoneClick = () => {
    window.location.href = 'tel:+15551234567';
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:info@carwashpro.com?subject=Car Wash Inquiry';
  };

  const handleLocationClick = () => {
    window.open('https://maps.google.com/?q=123+Main+St,+City,+State', '_blank');
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                CarWash Pro
              </span>
            </div>
            <p className="text-gray-300 mb-3 max-w-md">
              Professional car washing services with convenient online booking. 
              We make your car shine like new.
            </p>
            
            {/* Rating */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-gray-300 text-sm">4.9/5 from 500+ customers</span>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-blue-600 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-blue-400 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-pink-600 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">Get In Touch</h3>
            <div className="space-y-2">
              <button
                onClick={handlePhoneClick}
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group w-full text-left p-2 rounded-lg hover:bg-gray-800"
                aria-label="Call us"
              >
                <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-500 transition-colors">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Call Us</div>
                  <div className="text-sm text-gray-400">(555) 123-4567</div>
                </div>
              </button>

              <button
                onClick={handleEmailClick}
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group w-full text-left p-2 rounded-lg hover:bg-gray-800"
                aria-label="Email us"
              >
                <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Email Us</div>
                  <div className="text-sm text-gray-400">info@carwashpro.com</div>
                </div>
              </button>

              <button
                onClick={handleLocationClick}
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group w-full text-left p-2 rounded-lg hover:bg-gray-800"
                aria-label="View location"
              >
                <div className="p-2 bg-red-600 rounded-lg group-hover:bg-red-500 transition-colors">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Visit Us</div>
                  <div className="text-sm text-gray-400">123 Main St, City, State</div>
                </div>
              </button>
            </div>
          </div>


        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} CarWash Pro. All rights reserved. Made with ❤️ for car enthusiasts.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;