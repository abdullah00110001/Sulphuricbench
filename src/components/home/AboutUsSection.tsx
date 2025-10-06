import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Eye, Heart, MapPin, Calendar, Users, Linkedin, Twitter, Github } from "lucide-react"

export function AboutUsSection() {
  const values = [
    {
      icon: Target,
      title: "Mission",
      description: "To democratize quality education and make learning accessible to everyone, everywhere through innovative technology and passionate educators."
    },
    {
      icon: Eye,
      title: "Vision",
      description: "To become the leading platform that bridges the gap between knowledge seekers and expert educators, fostering a global learning community."
    },
    {
      icon: Heart,
      title: "Values",
      description: "Excellence, Innovation, Accessibility, Community, Integrity, and Continuous Learning drive everything we do."
    }
  ]

  const timeline = [
    {
      year: "2023",
      title: "Foundation",
      description: "Sulphuric Bench was founded with a vision to revolutionize online education"
    },
    {
      year: "2024",
      title: "Growth Phase",
      description: "Expanded our course offerings and built a community of passionate learners"
    },
    {
      year: "2024",
      title: "Present",
      description: "Continuing to innovate and provide world-class education to students globally"
    }
  ]

  const team = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      bio: "Passionate educator with 15+ years in EdTech",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#"
      }
    },
    {
      name: "Sarah Chen",
      role: "Head of Curriculum",
      bio: "Expert in curriculum design and educational psychology",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Michael Rodriguez",
      role: "Lead Developer",
      bio: "Full-stack developer building the future of learning",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      social: {
        linkedin: "#",
        github: "#"
      }
    }
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              About Sulphuric Bench
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Empowering Minds Through <span className="text-gradient">Quality Education</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to make quality education accessible to everyone, everywhere
            </p>
          </div>

          {/* Mission, Vision, Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Timeline */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center mb-12">Our Journey</h3>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-primary/20"></div>
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                          <Badge className="mb-2 bg-primary/10 text-primary">
                            {item.year}
                          </Badge>
                          <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                          <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-12">Meet Our Team</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-square relative">
                    <img 
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-semibold mb-2">{member.name}</h4>
                    <Badge className="mb-4 bg-primary/10 text-primary">
                      {member.role}
                    </Badge>
                    <p className="text-muted-foreground mb-6">{member.bio}</p>
                    <div className="flex justify-center space-x-4">
                      {member.social.linkedin && (
                        <Button variant="ghost" size="sm" className="hover:text-primary">
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      )}
                      {member.social.twitter && (
                        <Button variant="ghost" size="sm" className="hover:text-primary">
                          <Twitter className="h-4 w-4" />
                        </Button>
                      )}
                      {member.social.github && (
                        <Button variant="ghost" size="sm" className="hover:text-primary">
                          <Github className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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