import { render, screen } from '@testing-library/react'
import Home from '../page'

interface MockImageProps {
  src: string
  alt: string
  width?: string | number
  height?: string | number
  priority?: boolean
  className?: string
  [key: string]: unknown
}

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, priority, className, ...props }: MockImageProps) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-priority={priority}
      {...props}
    />
  ),
}))

describe('Home page', () => {
  it('renders the main layout structure', () => {
    render(<Home />)

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('flex', 'flex-col', 'gap-[32px]')
  })

  it('displays the Next.js logo', () => {
    render(<Home />)

    const logo = screen.getByAltText('Next.js logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/next.svg')
    expect(logo).toHaveAttribute('width', '180')
    expect(logo).toHaveAttribute('height', '38')
    expect(logo).toHaveAttribute('data-priority', 'true')
  })

  it('displays the getting started instructions', () => {
    render(<Home />)

    expect(screen.getByText(/Get started by editing/)).toBeInTheDocument()
    expect(screen.getByText('app/page.tsx')).toBeInTheDocument()
    expect(screen.getByText('Save and see your changes instantly.')).toBeInTheDocument()
  })

  it('renders the deploy button with correct link', () => {
    render(<Home />)

    const deployLink = screen.getByRole('link', { name: /deploy now/i })
    expect(deployLink).toBeInTheDocument()
    expect(deployLink).toHaveAttribute('href', 'https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app')
    expect(deployLink).toHaveAttribute('target', '_blank')
    expect(deployLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders the docs button with correct link', () => {
    render(<Home />)

    const docsLink = screen.getByRole('link', { name: /read our docs/i })
    expect(docsLink).toBeInTheDocument()
    expect(docsLink).toHaveAttribute('href', 'https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app')
    expect(docsLink).toHaveAttribute('target', '_blank')
    expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders all footer links', () => {
    render(<Home />)

    const learnLink = screen.getByRole('link', { name: /learn/i })
    expect(learnLink).toBeInTheDocument()
    expect(learnLink).toHaveAttribute('href', 'https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app')

    const examplesLink = screen.getByRole('link', { name: /examples/i })
    expect(examplesLink).toBeInTheDocument()
    expect(examplesLink).toHaveAttribute('href', 'https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app')

    const nextjsLink = screen.getByRole('link', { name: /go to nextjs\.org/i })
    expect(nextjsLink).toBeInTheDocument()
    expect(nextjsLink).toHaveAttribute('href', 'https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app')
  })

  it('displays icons in footer links', () => {
    render(<Home />)

    expect(screen.getByAltText('File icon')).toBeInTheDocument()
    expect(screen.getByAltText('Window icon')).toBeInTheDocument()
    expect(screen.getByAltText('Globe icon')).toBeInTheDocument()
  })

  it('has responsive layout classes', () => {
    render(<Home />)

    const container = screen.getByRole('main').parentElement
    expect(container).toHaveClass(
      'font-sans',
      'grid',
      'grid-rows-[20px_1fr_20px]',
      'items-center',
      'justify-items-center',
      'min-h-screen',
      'p-8',
      'pb-20',
      'gap-16',
      'sm:p-20'
    )
  })

  it('has proper semantic structure', () => {
    render(<Home />)

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})