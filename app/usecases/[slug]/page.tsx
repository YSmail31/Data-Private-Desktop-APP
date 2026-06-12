import UseCaseClientPage from './client'

// Required for static export (output: 'export')
export function generateStaticParams() {
  return [
    { slug: 'juridique' },
    { slug: 'contentieux' },
    { slug: 'comptabilite' },
    { slug: 'medical' },
    { slug: 'rh' },
    { slug: 'confidentiel' },
  ]
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <UseCaseClientPage slug={slug} />
}
