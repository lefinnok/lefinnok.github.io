// Enhanced debounce function to optimize performance
function debounce(func, wait, immediate) {
    let timeout
    return function() {
        const context = this
        const args = arguments
        const later = function() {
            timeout = null
            if (!immediate) func.apply(context, args)
        }
        const callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) func.apply(context, args)
    }
}

// Adapt to device capabilities
const isMobile = window.innerWidth <= 768
const scrollThrottleTime = isMobile ? 100 : 50

document.addEventListener('DOMContentLoaded', function() {
    const contents = document.getElementById('contents')
    if (!contents) return
    
    // Handle scroll events with debouncing for better performance
    contents.addEventListener('scroll', debounce(function() {
        // For future scroll-related code
    }, scrollThrottleTime))
    
    // Fix for iOS scroll behavior
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        contents.style.webkitOverflowScrolling = 'touch'
    }
    
    // Adaptive scroll snap based on screen size
    function updateScrollSnap() {
        if (window.innerWidth <= 768) {
            contents.style.scrollSnapType = 'y mandatory'
        } else {
            contents.style.scrollSnapType = 'y proximity'
        }
    }
    
    // Update on resize with debounce
    window.addEventListener('resize', debounce(function() {
        updateScrollSnap()
    }, 150))
    
    // Initial setup
    updateScrollSnap()
})