
import { FeaturedCoursesSection } from '@/components/home/FeaturedCoursesSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { EnhancedFooter } from '@/components/EnhancedFooter'
import { HeroSection } from '@/components/home/HeroSection'
import { MainLayout } from '@/components/layout/MainLayout'
import { Navigation } from '@/components/Navigation'
import { AboutUsSection } from '@/components/home/AboutUsSection'
import { AchievementSection } from '@/components/home/AchievementSection'
import { FAQSection } from '@/components/home/FAQSection'

export default function Index() {
  return (
    <MainLayout excludeMargins>
      <div className="min-h-screen">
        <Navigation />
        <div className="mx-4 lg:mx-8 xl:mx-16 2xl:mx-24">
          <HeroSection />
        </div>
        {/* Sections without margins */}
        <AboutUsSection />
        <div className="mx-4 lg:mx-8 xl:mx-16 2xl:mx-24">
          <FeaturedCoursesSection />
        </div>
        <AchievementSection />
        <div className="mx-4 lg:mx-8 xl:mx-16 2xl:mx-24">
          <TestimonialsSection />
        </div>
        <FAQSection />
        {/* Newsletter and Footer without margins */}
        <NewsletterSection />
        <EnhancedFooter />
      </div>
    </MainLayout>
  )
}
