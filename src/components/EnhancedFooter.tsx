
import React from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export function EnhancedFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-[#00CFFF]" />
              <span className="text-2xl font-bold text-[#00CFFF]">Sulphuric Bench</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted platform for SSC, HSC, and University Admission preparation. 
              Quality education with expert instructors.
            </p>
            <div className="flex space-x-4">
              <Button size="icon" variant="ghost" className="text-gray-300 hover:text-[#00CFFF] hover:bg-gray-800">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-300 hover:text-[#00CFFF] hover:bg-gray-800">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-300 hover:text-[#00CFFF] hover:bg-gray-800">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-300 hover:text-[#00CFFF] hover:bg-gray-800">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#00CFFF]">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-[#00CFFF] transition-colors text-sm">Home</a></li>
              <li><a href="/courses" className="text-gray-300 hover:text-[#00CFFF] transition-colors text-sm">All Courses</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-[#00CFFF] transition-colors text-sm">About Us</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-[#00CFFF] transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Course Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#00CFFF]">Categories</h3>
            <ul className="space-y-2">
              <li><a href="/courses?category=ssc" className="text-gray-300 hover:text-[#00CFFF] transition-colors text-sm">SSC Preparation</a></li>
              <li><a href="/courses?category=hsc" className="text-gray-300 hover:text-[#00CFFF] transition-colors text-sm">HSC Preparation</a></li>
              <li><a href="/courses?category=admission" className="text-gray-300 hover:text-[#00CFFF] transition-colors text-sm">Admission Preparation</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#00CFFF]">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#00CFFF] flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@sulphuricbench.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#00CFFF] flex-shrink-0" />
                <span className="text-gray-300 text-sm">+880 1XXX-XXXXXX</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#00CFFF] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Dhaka, Bangladesh
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-sm">
                © 2025{' '}
                <span className="text-[#00CFFF] font-semibold">Sulphuric Bench</span>
                . All rights reserved.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-300 text-sm">
                Developed by{' '}
                <a 
                  href="https://abdullah-dev.netlify.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00CFFF] hover:text-[#00B8E6] transition-colors font-cursive font-medium"
                  style={{ fontFamily: 'cursive' }}
                >
                  Muhammad Abdullah
                </a>
              </p>
            </div>
          </div>

          {/* Additional Links */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t border-gray-800">
            <a href="/privacy" className="text-gray-400 hover:text-[#00CFFF] text-xs transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-400 hover:text-[#00CFFF] text-xs transition-colors">
              Terms of Service
            </a>
            <a href="/refund" className="text-gray-400 hover:text-[#00CFFF] text-xs transition-colors">
              Refund Policy
            </a>
            <a href="/help" className="text-gray-400 hover:text-[#00CFFF] text-xs transition-colors">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
