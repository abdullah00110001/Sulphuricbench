import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Star, Quote } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { reviewsApi } from '@/apis/reviews'

export function ReviewsSection() {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['approved-reviews'],
    queryFn: reviewsApi.getApprovedReviews,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 xl:px-8 2xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              What Our <span className="text-gradient bg-gradient-to-r from-[#00CFFF] to-blue-600 bg-clip-text text-transparent">Students Say</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!reviews.length) {
    return (
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 xl:px-8 2xl:px-16">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              What Our <span className="text-gradient bg-gradient-to-r from-[#00CFFF] to-blue-600 bg-clip-text text-transparent">Students Say</span>
            </h2>
            <p className="text-muted-foreground">Be the first to share your experience!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 xl:px-8 2xl:px-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            What Our <span className="text-gradient bg-gradient-to-r from-[#00CFFF] to-blue-600 bg-clip-text text-transparent">Students Say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of learners who have transformed their careers with our courses
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card 
              key={review.id} 
              className="bg-card hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg"
            >
              <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-[#00CFFF] opacity-60" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed flex-grow text-sm sm:text-base">
                  "{review.review_text}"
                </p>
                
                {/* Author Info */}
                <div className="flex items-center pt-3 sm:pt-4 border-t border-border">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 mr-3 sm:mr-4 ring-2 ring-[#00CFFF]/20">
                    <AvatarImage src={review.user_avatar} alt={review.user_name} />
                    <AvatarFallback className="bg-[#00CFFF]/10 text-[#00CFFF] font-semibold">
                      {review.user_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">{review.user_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {review.user_role}{review.user_company ? ` at ${review.user_company}` : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}