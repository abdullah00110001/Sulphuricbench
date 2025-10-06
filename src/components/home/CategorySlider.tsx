
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Code, 
  Palette, 
  BarChart3, 
  Camera, 
  Music, 
  Briefcase,
  Globe,
  Heart
} from "lucide-react"

const categories = [
  {
    id: 1,
    name: "Programming",
    icon: Code,
    courses: 342,
    color: "bg-blue-500"
  },
  {
    id: 2,
    name: "Design",
    icon: Palette,
    courses: 128,
    color: "bg-purple-500"
  },
  {
    id: 3,
    name: "Business",
    icon: Briefcase,
    courses: 234,
    color: "bg-green-500"
  },
  {
    id: 4,
    name: "Marketing",
    icon: BarChart3,
    courses: 189,
    color: "bg-orange-500"
  },
  {
    id: 5,
    name: "Photography",
    icon: Camera,
    courses: 97,
    color: "bg-pink-500"
  },
  {
    id: 6,
    name: "Music",
    icon: Music,
    courses: 156,
    color: "bg-indigo-500"
  },
  {
    id: 7,
    name: "Languages",
    icon: Globe,
    courses: 203,
    color: "bg-teal-500"
  },
  {
    id: 8,
    name: "Health",
    icon: Heart,
    courses: 87,
    color: "bg-red-500"
  }
]

export function CategorySlider() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Explore <span className="text-gradient">Categories</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect course for your interests and career goals
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
          {categories.map((category) => (
            <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-card">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-brand-sky transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.courses} courses
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="px-8">
            View All Categories
          </Button>
        </div>
      </div>
    </section>
  )
}
