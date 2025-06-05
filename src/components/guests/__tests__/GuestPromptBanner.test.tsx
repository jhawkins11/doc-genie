import React from 'react'
import GuestPromptBanner from '../GuestPromptBanner'

describe('GuestPromptBanner', () => {
  const defaultProps = {
    message: 'Test message',
    ctaText: 'Test CTA',
    onCtaClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    expect(() => {
      React.createElement(GuestPromptBanner, defaultProps)
    }).not.toThrow()
  })

  it('accepts all required props', () => {
    const element = React.createElement(GuestPromptBanner, defaultProps)
    expect(element.props.message).toBe('Test message')
    expect(element.props.ctaText).toBe('Test CTA')
    expect(element.props.onCtaClick).toBe(defaultProps.onCtaClick)
  })

  it('accepts optional props', () => {
    const element = React.createElement(GuestPromptBanner, {
      ...defaultProps,
      variant: 'warning',
      dismissible: false,
      isDarkMode: true,
      onDismiss: jest.fn(),
    })
    expect(element.props.variant).toBe('warning')
    expect(element.props.dismissible).toBe(false)
    expect(element.props.isDarkMode).toBe(true)
    expect(typeof element.props.onDismiss).toBe('function')
  })

  it('has correct component type', () => {
    const element = React.createElement(GuestPromptBanner, defaultProps)
    expect(element.type).toBe(GuestPromptBanner)
  })

  it('component is properly exported', () => {
    expect(GuestPromptBanner).toBeDefined()
    expect(typeof GuestPromptBanner).toBe('function')
  })

  it('supports all variant types', () => {
    const variants = ['info', 'warning', 'incentive'] as const
    variants.forEach((variant) => {
      const element = React.createElement(GuestPromptBanner, {
        ...defaultProps,
        variant,
      })
      expect(element.props.variant).toBe(variant)
    })
  })

  it('supports dark mode prop', () => {
    const lightElement = React.createElement(GuestPromptBanner, {
      ...defaultProps,
      isDarkMode: false,
    })
    const darkElement = React.createElement(GuestPromptBanner, {
      ...defaultProps,
      isDarkMode: true,
    })

    expect(lightElement.props.isDarkMode).toBe(false)
    expect(darkElement.props.isDarkMode).toBe(true)
  })
})
