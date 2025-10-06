
import { Button } from "@/components/ui/button"
import { Play, BookOpen } from "lucide-react"
import { Link } from "react-router-dom"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-background via-background to-muted/20 py-16 lg:py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00CFFF]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 xl:px-8 2xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Learn Without{" "}
                <span className="text-gradient bg-gradient-to-r from-[#00CFFF] to-blue-600 bg-clip-text text-transparent">
                  Limits
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Discover thousands of courses, learn from expert instructors, and advance your career with our comprehensive learning platform.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#00CFFF] rounded-full"></div>
                <span>Expert instructors</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#00CFFF] rounded-full"></div>
                <span>Lifetime access</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#00CFFF] rounded-full"></div>
                <span>Mobile learning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#00CFFF] rounded-full"></div>
                <span>Certificate of completion</span>
              </div>
            </div>

            {/* CTA Buttons - Properly centered and styled */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start justify-center sm:justify-start">
              <Button 
                size="lg" 
                className="bg-[#00CFFF] hover:bg-[#00B8E6] text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                asChild
              >
                <Link to="/courses">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Start Learning Now
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-[#00CFFF] text-[#00CFFF] hover:bg-[#00CFFF] hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300"
                asChild
              >
                <Link to="/about">
                  <Play className="mr-2 h-5 w-5" />
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-border justify-center sm:justify-start">
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-[#00CFFF]">10K+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-[#00CFFF]">500+</div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl font-bold text-[#00CFFF]">50+</div>
                <div className="text-sm text-muted-foreground">Instructors</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Animation */}
          <div className="relative">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-[#00CFFF]/10 to-blue-600/10 rounded-2xl p-8 backdrop-blur-sm border border-[#00CFFF]/20">
                <div className="space-y-6">
                  {/* Mock course preview */}
                  <div className="bg-background rounded-lg p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-[#00CFFF] rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Course Preview</h3>
                        <p className="text-sm text-muted-foreground">Interactive Learning</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-[#00CFFF] rounded-full"></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Progress: 75%</span>
                        <span>12 lessons</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock achievement */}
                  <div className="bg-background rounded-lg p-6 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">🏆</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">Achievement Unlocked</h3>
                        <p className="text-sm text-muted-foreground">Course Completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#00CFFF]/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
