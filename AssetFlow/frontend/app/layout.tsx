import './globals.css'
import ClientLayout from '@/components/ui/ClientLayout'

export const metadata = {
  title: 'AssetFlow',
  description: 'Premium Asset Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
