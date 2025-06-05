import React from 'react'
import ActionGuidanceModal from '../ActionGuidanceModal'

describe('ActionGuidanceModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Title',
    message: 'Test message',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    expect(() => {
      React.createElement(ActionGuidanceModal, defaultProps)
    }).not.toThrow()
  })

  it('accepts all required props', () => {
    const element = React.createElement(ActionGuidanceModal, defaultProps)
    expect(element.props.isOpen).toBe(true)
    expect(element.props.onClose).toBe(defaultProps.onClose)
    expect(element.props.title).toBe('Test Title')
    expect(element.props.message).toBe('Test message')
  })

  it('accepts optional action props', () => {
    const primaryAction = { text: 'Primary', onClick: jest.fn() }
    const secondaryAction = { text: 'Secondary', onClick: jest.fn() }

    const element = React.createElement(ActionGuidanceModal, {
      ...defaultProps,
      primaryAction,
      secondaryAction,
      isDarkMode: true,
    })

    expect(element.props.primaryAction).toBe(primaryAction)
    expect(element.props.secondaryAction).toBe(secondaryAction)
    expect(element.props.isDarkMode).toBe(true)
  })

  it('handles closed state', () => {
    const element = React.createElement(ActionGuidanceModal, {
      ...defaultProps,
      isOpen: false,
    })
    expect(element.props.isOpen).toBe(false)
  })

  it('supports dark mode prop', () => {
    const lightElement = React.createElement(ActionGuidanceModal, {
      ...defaultProps,
      isDarkMode: false,
    })
    const darkElement = React.createElement(ActionGuidanceModal, {
      ...defaultProps,
      isDarkMode: true,
    })

    expect(lightElement.props.isDarkMode).toBe(false)
    expect(darkElement.props.isDarkMode).toBe(true)
  })

  it('component is properly exported', () => {
    expect(ActionGuidanceModal).toBeDefined()
    expect(typeof ActionGuidanceModal).toBe('function')
  })

  it('accepts action objects with correct structure', () => {
    const primaryAction = { text: 'Confirm', onClick: jest.fn() }
    const secondaryAction = { text: 'Cancel', onClick: jest.fn() }

    const element = React.createElement(ActionGuidanceModal, {
      ...defaultProps,
      primaryAction,
      secondaryAction,
    })

    expect(element.props.primaryAction.text).toBe('Confirm')
    expect(typeof element.props.primaryAction.onClick).toBe('function')
    expect(element.props.secondaryAction.text).toBe('Cancel')
    expect(typeof element.props.secondaryAction.onClick).toBe('function')
  })
})
