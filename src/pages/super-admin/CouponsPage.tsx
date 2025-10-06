import { CouponManager } from '@/components/super-admin/CouponManager'

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
        <p className="text-muted-foreground">
          Create and manage discount coupons for your courses
        </p>
      </div>
      <CouponManager />
    </div>
  )
}