import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    function checkDevice() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // Check on mount (client-side)
    checkDevice()

    // Add event listener for window resize
    window.addEventListener("resize", checkDevice)

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return isMobile
}
