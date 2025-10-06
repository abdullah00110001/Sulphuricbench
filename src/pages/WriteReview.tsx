import { ReviewForm } from '@/components/reviews/ReviewForm'
import { MainLayout } from '@/components/layout/MainLayout'

// Fixed: Enhanced review form with proper dropdown selection
export default function WriteReview() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                Share Your <span className="text-gradient bg-gradient-to-r from-[#00CFFF] to-blue-600 bg-clip-text text-transparent">Experience</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Help other students by sharing your learning experience
              </p>
            </div>
            <ReviewForm />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}