import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Clock, Star, TrendingUp, Award } from "lucide-react"

export function CourseSection() {
  const categories = [
    {
      title: "Web Development",
      description: "Master modern web technologies",
      courses: 45,
      students: 1200,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Data Science",
      description: "Analyze data and build ML models",
      courses: 32,
      students: 890,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Digital Marketing",
      description: "Grow your business online",
      courses: 28,
      students: 650,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Graphic Design",
      description: "Create stunning visual content",
      courses: 25,
      students: 420,
      icon: Award,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ]

  const features = [
    {
      icon: Clock,
      title: "Flexible Learning",
      description: "Learn at your own pace with lifetime access"
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals"
    },
    {
      icon: Award,
      title: "Certificates",
      description: "Earn certificates upon completion"
    },
    {
      icon: Star,
      title: "Quality Content",
      description: "High-quality, up-to-date course material"
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              Our Courses
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Explore Our <span className="text-gradient">Course Categories</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover a wide range of courses designed to help you achieve your learning goals
            </p>
          </div>

          {/* Course Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 ${category.bgColor} rounded-full flex items-center justify-center`}>
                      <Icon className={`h-8 w-8 ${category.color}`} />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">{category.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Courses:</span>
                        <span className="font-semibold">{category.courses}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Students:</span>
                        <span className="font-semibold">{category.students}+</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Explore Courses
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}