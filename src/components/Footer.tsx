
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { 
  Mail, 
  MapPin, 
  BookOpen, 
  User, 
  Home,
  Settings
} from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Browse Courses", href: "/courses" },
        { name: "Categories", href: "/categories" },
        { name: "Pricing", href: "/pricing" },
        { name: "For Business", href: "/business" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Contact Us", href: "/contact" },
        { name: "Community", href: "/community" },
        { name: "System Status", href: "/status" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Blog", href: "/blog" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "Refund Policy", href: "/refund" },
      ]
    }
  ]

  return (
    <footer className="bg-brand-navy text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <img 
                src="/img/logo.svg"
                alt="Sulphuric Bench" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-white">Sulphuric Bench</span>
            </Link>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering learners worldwide with expert-led courses and 
              cutting-edge skills for the modern workforce.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-3" />
                <span>support@sulphuricbench.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 mr-3" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-gray-300 hover:text-brand-sky transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 mb-4 md:mb-0">
              © {currentYear} Sulphuric Bench. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-brand-sky">
                Privacy
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-brand-sky">
                Terms
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-brand-sky">
                Cookies
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
