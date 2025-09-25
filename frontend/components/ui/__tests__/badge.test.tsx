import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from '../badge'

describe('Badge component', () => {
  it('renders with default props', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('data-slot', 'badge')
    expect(badge.tagName).toBe('SPAN')
  })

  it('renders different variants correctly', () => {
    const { rerender } = render(<Badge variant="secondary">Secondary</Badge>)
    let badge = screen.getByText('Secondary')
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground')

    rerender(<Badge variant="destructive">Destructive</Badge>)
    badge = screen.getByText('Destructive')
    expect(badge).toHaveClass('bg-destructive', 'text-white')

    rerender(<Badge variant="outline">Outline</Badge>)
    badge = screen.getByText('Outline')
    expect(badge).toHaveClass('text-foreground')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-class')
  })

  it('renders as child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    )

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveAttribute('data-slot', 'badge')
    expect(link).toHaveTextContent('Link Badge')
  })

  it('forwards other props', () => {
    render(<Badge id="test-badge" data-testid="badge">Test</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('id', 'test-badge')
  })

  it('has correct base styles', () => {
    render(<Badge>Styled Badge</Badge>)
    const badge = screen.getByText('Styled Badge')
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'border',
      'px-2',
      'py-0.5',
      'text-xs',
      'font-medium',
      'w-fit',
      'whitespace-nowrap',
      'shrink-0'
    )
  })
})

describe('badgeVariants', () => {
  it('returns correct classes for default variant', () => {
    const classes = badgeVariants()
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('text-primary-foreground')
  })

  it('returns correct classes for custom variant', () => {
    const classes = badgeVariants({ variant: 'destructive' })
    expect(classes).toContain('bg-destructive')
    expect(classes).toContain('text-white')
  })

  it('includes custom className', () => {
    const classes = badgeVariants({ className: 'custom-test' })
    expect(classes).toContain('custom-test')
  })
})