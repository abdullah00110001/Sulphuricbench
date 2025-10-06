import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Award, TrendingUp, Play, Quote } from "lucide-react"

export function AchievementSection() {
  const stats = [
    {
      icon: Users,
      label: "Students Graduated",
      value: "2,547",
      growth: "+25%",
      description: "From Hope 1.0 Program"
    },
    {
      icon: BookOpen,
      label: "Courses Completed",
      value: "8,432",
      growth: "+40%",
      description: "Total Course Completions"
    },
    {
      icon: Award,
      label: "Certificates Issued",
      value: "2,193",
      growth: "+35%",
      description: "Professional Certificates"
    },
    {
      icon: TrendingUp,
      label: "Success Rate",
      value: "94%",
      growth: "+8%",
      description: "Course Completion Rate"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Web Developer",
      company: "Tech Solutions Inc.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      video: true,
      quote: "The Hope 1.0 program completely transformed my career. I went from having no coding experience to landing my dream job as a web developer in just 6 months."
    },
    {
      name: "Michael Chen",
      role: "Data Analyst",
      company: "Analytics Corp",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      video: false,
      quote: "The practical approach and expert mentorship made all the difference. I'm now working with Fortune 500 companies analyzing complex datasets."
    },
    {
      name: "Emily Rodriguez",
      role: "Digital Marketer",
      company: "Growth Agency",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      video: true,
      quote: "Sulphuric Bench didn't just teach me digital marketing - they taught me how to think strategically and deliver real results for clients."
    }
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              Hope 1.0 Outcome
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Achievement & <span className="text-gradient">Success Stories</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See the incredible results from our Hope 1.0 program and the success stories of our students
            </p>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-sm text-green-600 font-medium mb-2">{stat.growth}</div>
                    <div className="font-medium mb-1">{stat.label}</div>
                    <div className="text-sm text-muted-foreground">{stat.description}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Infographic Section */}
          <div className="mb-20">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-12 text-center">
                <h3 className="text-2xl font-bold mb-6">Hope 1.0 Program Impact</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">6 Months</div>
                    <div className="text-muted-foreground">Average Time to Employment</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">$65K</div>
                    <div className="text-muted-foreground">Average Starting Salary</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">150%</div>
                    <div className="text-muted-foreground">Career Growth Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Stories */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-12">Student Success Stories</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="relative mr-4">
                        <img 
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        {testimonial.video && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Play className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-primary">{testimonial.role}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                      </div>
                      <Quote className="h-8 w-8 text-primary/20" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{testimonial.quote}</p>
                    {testimonial.video && (
                      <Button variant="ghost" size="sm" className="mt-4 p-0 h-auto text-primary hover:text-primary/80">
                        <Play className="h-4 w-4 mr-2" />
                        Watch Video Story
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}