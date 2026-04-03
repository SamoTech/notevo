/**
 * Dashboard layout — intentionally minimal.
 * Overrides the root layout so SiteFooter is NOT rendered
 * inside the dashboard. The dashboard is a full-viewport app
 * (height: 100vh, overflow: hidden) and any extra wrapper
 * height (footer, flex column) causes a black / broken screen.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
