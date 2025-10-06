
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle,
  Phone,
  HelpCircle
} from "lucide-react"

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help with your account or courses",
    contact: "support@sulphuricbench.com",
    response: "Response within 24 hours"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our support team",
    contact: "+1 (555) 123-4567",
    response: "Mon-Fri, 9AM-6PM PST"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Quick answers to your questions",
    contact: "Available on website",
    response: "Response within minutes"
  },
  {
    icon: HelpCircle,
    title: "Help Center",
    description: "Browse our comprehensive FAQ",
    contact: "help.sulphuricbench.com",
    response: "Available 24/7"
  }
]

const offices = [
  {
    city: "San Francisco",
    address: "123 Tech Street, Suite 100\nSan Francisco, CA 94105",
    phone: "+1 (555) 123-4567",
    email: "sf@sulphuricbench.com"
  },
  {
    city: "New York",
    address: "456 Learning Ave, Floor 15\nNew York, NY 10001",
    phone: "+1 (555) 987-6543",
    email: "ny@sulphuricbench.com"
  },
  {
    city: "London",
    address: "789 Education Road\nLondon, UK EC1A 1BB",
    phone: "+44 20 7123 4567",
    email: "london@sulphuricbench.com"
  }
]

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-sky-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Get in <span className="text-brand-sky">Touch</span>
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Have questions? We're here to help. Reach out to our support team and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="bg-brand-sky/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <method.icon className="w-8 h-8 text-brand-sky" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{method.description}</p>
                  <div className="text-brand-sky font-medium mb-1">{method.contact}</div>
                  <div className="text-xs text-muted-foreground">{method.response}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us more about your inquiry..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button className="w-full bg-brand-sky hover:bg-brand-sky-dark text-white" size="lg">
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Office Locations */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Our Offices</h2>
              <div className="space-y-6">
                {offices.map((office, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3 text-brand-sky">{office.city}</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div className="text-muted-foreground whitespace-pre-line">
                            {office.address}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div className="text-muted-foreground">{office.phone}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div className="text-muted-foreground">{office.email}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid gap-6">
              {[
                {
                  question: "How do I enroll in a course?",
                  answer: "Simply browse our course catalog, select the course you're interested in, and click 'Enroll Now'. You can pay securely through our platform."
                },
                {
                  question: "Can I get a refund if I'm not satisfied?",
                  answer: "Yes! We offer a 30-day money-back guarantee on all courses. If you're not satisfied, contact our support team for a full refund."
                },
                {
                  question: "Do I get a certificate upon completion?",
                  answer: "Yes, you'll receive a certificate of completion for every course you finish. These certificates can be shared on your LinkedIn profile."
                },
                {
                  question: "Are the courses self-paced?",
                  answer: "Most of our courses are self-paced, allowing you to learn at your own speed. Some specialized courses may have scheduled live sessions."
                }
              ].map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
