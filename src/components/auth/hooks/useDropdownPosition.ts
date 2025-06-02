import { useCallback, useLayoutEffect, useState } from 'react'

interface DropdownPosition {
  top: number
  left: number
}

export const useDropdownPosition = (
  anchorEl: HTMLElement | null,
  dropdownRef: React.RefObject<HTMLDivElement>,
  compact: boolean,
  fixedButton: boolean
) => {
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
  })

  const determineDropdownPosition = useCallback(
    (
      buttonRect: DOMRect,
      dropdownElement: HTMLDivElement,
      isCompact: boolean,
      isFixedButton: boolean
    ): DropdownPosition => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const PADDING = 8
      const MIN_VIEWPORT_PADDING = 16

      const ddHeight = dropdownElement.offsetHeight
      const ddWidth = dropdownElement.offsetWidth

      let topPos: number
      let leftPos: number

      if (!isFixedButton && isCompact) {
        topPos = buttonRect.top - ddHeight - PADDING
        leftPos = buttonRect.left + buttonRect.width / 2 - ddWidth / 2
        if (topPos < MIN_VIEWPORT_PADDING) {
          const belowTopPos = buttonRect.bottom + PADDING
          if (belowTopPos + ddHeight <= viewportHeight - MIN_VIEWPORT_PADDING) {
            topPos = belowTopPos
          } else {
            topPos = MIN_VIEWPORT_PADDING
          }
        }
      } else {
        topPos = buttonRect.bottom + PADDING
        if (topPos + ddHeight > viewportHeight - MIN_VIEWPORT_PADDING) {
          const upwardAttempt = buttonRect.top - ddHeight - PADDING
          if (upwardAttempt > MIN_VIEWPORT_PADDING) {
            topPos = upwardAttempt
          } else {
            topPos = Math.max(
              MIN_VIEWPORT_PADDING,
              viewportHeight - ddHeight - MIN_VIEWPORT_PADDING
            )
          }
        }
        leftPos = buttonRect.right - ddWidth
        if (isFixedButton) {
          leftPos = Math.min(
            leftPos,
            viewportWidth - ddWidth - MIN_VIEWPORT_PADDING
          )
        }
      }

      if (leftPos + ddWidth > viewportWidth - MIN_VIEWPORT_PADDING) {
        leftPos = viewportWidth - ddWidth - MIN_VIEWPORT_PADDING
      }
      if (leftPos < MIN_VIEWPORT_PADDING) {
        leftPos = MIN_VIEWPORT_PADDING
      }
      return { top: topPos, left: leftPos }
    },
    []
  )

  useLayoutEffect(() => {
    if (anchorEl && dropdownRef.current) {
      const buttonRect = anchorEl.getBoundingClientRect()
      const position = determineDropdownPosition(
        buttonRect,
        dropdownRef.current,
        compact,
        fixedButton
      )
      setDropdownPosition(position)
    }
  }, [anchorEl, compact, fixedButton, determineDropdownPosition])

  return dropdownPosition
}
