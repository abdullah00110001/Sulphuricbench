
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Award, Globe, Target, Heart, Lightbulb, Rocket } from "lucide-react"
import { BecomeInstructorModal } from "@/components/shared/BecomeInstructorModal"
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

const About = () => {
  const [instructorModalOpen, setInstructorModalOpen] = useState(false)

  const stats = [
    { icon: Users, label: "Active Students", value: "10,000+", color: "text-blue-600" },
    { icon: BookOpen, label: "Courses Available", value: "500+", color: "text-green-600" },
    { icon: Award, label: "Certificates Issued", value: "8,500+", color: "text-yellow-600" },
    { icon: Globe, label: "Countries Reached", value: "50+", color: "text-purple-600" },
  ]

  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for the highest quality in education and learning experiences."
    },
    {
      icon: Heart,
      title: "Accessibility",
      description: "Education should be accessible to everyone, regardless of background or location."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We embrace new technologies and methodologies to enhance learning."
    },
    {
      icon: Rocket,
      title: "Growth",
      description: "We believe in continuous learning and personal development for all."
    }
  ]

  // We'll fetch actual teachers from the database
  const { data: teachers } = useQuery({
    queryKey: ['teachers-for-about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .limit(6)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching teachers:', error)
        return []
      }
      return data || []
    }
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-sky-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-brand-sky/20 text-white hover:bg-brand-sky/30 border-brand-sky/30">
              About Sulphuric Bench
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Empowering Minds Through 
              <span className="text-brand-sky block">Quality Education</span>
            </h1>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              At Sulphuric Bench, we believe that education is the catalyst for transformation. 
              Our platform connects passionate instructors with eager learners, creating a 
              vibrant community where knowledge flows freely and skills are developed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-brand-sky hover:bg-brand-sky-dark text-white">
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Courses
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setInstructorModalOpen(true)}
                className="border-white text-white hover:bg-white hover:text-brand-navy"
              >
                <Users className="mr-2 h-5 w-5" />
                Become an Instructor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="bg-brand-sky/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className={`h-8 w-8 text-brand-sky`} />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  We're on a mission to make quality education accessible to everyone, everywhere. 
                  Through innovative technology and passionate educators, we're breaking down 
                  barriers and creating opportunities for lifelong learning.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Whether you're a student looking to acquire new skills or an expert wanting 
                  to share your knowledge, Sulphuric Bench provides the platform and community 
                  to achieve your goals.
                </p>
                <Button 
                  size="lg"
                  onClick={() => setInstructorModalOpen(true)}
                  className="bg-brand-sky hover:bg-brand-sky-dark text-white"
                >
                  Join Our Teaching Community
                </Button>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
                  alt="Students learning together"
                  className="rounded-lg shadow-lg w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/20 to-brand-sky/20 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-0">
                      <div className="bg-brand-sky/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-brand-sky" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Meet Our <span className="text-gradient">Teachers</span></h2>
              <p className="text-xl text-muted-foreground">
                The passionate educators who make learning possible
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachers && teachers.length > 0 ? teachers.map((teacher, index) => (
                <Card key={index} className="text-center overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-brand-sky/20">
                  <div className="aspect-square relative bg-gradient-to-br from-brand-sky/10 to-brand-navy/5">
                    {teacher.image_url ? (
                      <img 
                        src={teacher.image_url}
                        alt={teacher.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-brand-sky/20 rounded-full flex items-center justify-center">
                          <span className="text-3xl font-bold text-brand-sky">
                            {teacher.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{teacher.full_name}</h3>
                    <Badge className="mb-4 bg-brand-sky/10 text-brand-sky border-brand-sky/20">
                      {teacher.institution || 'Instructor'}
                    </Badge>
                    {teacher.experience_years && (
                      <p className="text-sm text-brand-sky font-medium mb-2">
                        {teacher.experience_years} years experience
                      </p>
                    )}
                    <p className="text-muted-foreground text-sm">
                      {teacher.bio || `Passionate educator specializing in ${teacher.specializations?.slice(0, 2).join(', ') || 'various subjects'}`}
                    </p>
                  </CardContent>
                </Card>
              )) : (
                // Fallback while loading or if no teachers
                [1, 2, 3].map((index) => (
                  <Card key={index} className="text-center overflow-hidden animate-pulse">
                    <div className="aspect-square bg-muted"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-20 mx-auto mb-4"></div>
                      <div className="h-16 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-navy to-brand-sky-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students and instructors who are already part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-brand-navy hover:bg-gray-100">
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Courses
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-brand-navy"
              onClick={() => setInstructorModalOpen(true)}
            >
              <Users className="mr-2 h-5 w-5" />
              Become an Instructor
            </Button>
          </div>
        </div>
      </section>

      <BecomeInstructorModal 
        open={instructorModalOpen} 
        onOpenChange={setInstructorModalOpen} 
      />
    </div>
  )
}

export default About
