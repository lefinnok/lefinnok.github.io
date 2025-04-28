// Enhanced debounce function with immediate option
function debounce(func, wait, immediate) {
    let timeout
    return function(...args) {
        const context = this
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            clearTimeout(timeout)
            if (!immediate) func.apply(context, args)
        }, wait)
        if (immediate && !timeout) func.apply(context, args)
    }
}

// Animation functions with performance considerations
const addScaleAnimation = (element, delay) => {
    element.style.transform = 'scale(1)'
    element.style.transitionDelay = `${delay}ms`
}

const removeScaleAnimation = (element) => {
    element.style.transform = ''
    element.style.transitionDelay = ''
}

// Adaptive grid creation based on device capabilities
function createGrid(parent, squareSize, cols, rows) {
    // Find or create container
    let container = parent.querySelector('.grid-container')
    if (container) {
        container.innerHTML = ''
    } else {
        container = document.createElement('div')
        container.classList.add('grid-container')
        container.style.position = 'absolute'
        container.style.top = '0'
        container.style.left = '0'
        container.style.width = '100%'
        container.style.height = '100%'
        parent.appendChild(container)
    }

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment()
    
    // Reduce grid density on mobile for performance
    const isMobile = window.innerWidth <= 768
    const density = isMobile ? 1.5 : 1
    const adjustedRows = Math.floor(rows / density)
    const adjustedCols = Math.floor(cols / density)
    const adjustedSize = squareSize * density
    
    // Create grid squares
    for (let row = 0; row < adjustedRows; row++) {
        for (let col = 0; col < adjustedCols; col++) {
            const square = document.createElement('div')
            square.classList.add('navsquare')
            square.style.width = `${adjustedSize}px`
            square.style.height = `${adjustedSize}px`
            square.style.position = 'absolute'
            square.style.top = row * adjustedSize + 'px'
            square.style.left = col * adjustedSize + 'px'
            fragment.appendChild(square)
        }
    }
    
    container.appendChild(fragment)
}

// Optimized active link detection
function updateActiveNavLink() {
    calculateSquaresPerRow()
    
    const contentsElement = document.querySelector('#contents')
    const sections = document.querySelectorAll('#contents section')
    const navLinks = document.querySelectorAll('#navbar ul li a')
    const headerHeight = document.querySelector('.header-container').offsetHeight
    const contentsHeight = contentsElement.offsetHeight
    
    // Adaptive viewport offset based on screen size
    const viewportOffset = window.innerWidth <= 768 ? 0.2 : 0.3
    const viewportOffsetHeight = viewportOffset * window.innerHeight
    
    let scrollPosition = contentsElement.scrollTop + headerHeight + viewportOffsetHeight
    let bottomThreshold = contentsElement.scrollHeight - contentsHeight
    let currentSection = ''
    
    // Find current section based on scroll position
    sections.forEach(section => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight
        
        if (sectionTop <= scrollPosition && sectionTop + sectionHeight > scrollPosition) {
            currentSection = section.getAttribute('id')
        }
    })
    
    // Handle bottom of page
    if (contentsElement.scrollTop >= bottomThreshold) {
        currentSection = sections[sections.length - 1].getAttribute('id')
    }
    
    // If no section is found, find closest one
    if (currentSection === '') {
        let closestSection = ''
        let minDistance = Infinity
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop
            const sectionHeight = section.offsetHeight
            const distance = Math.abs(scrollPosition - (sectionTop + sectionHeight / 2))
            
            if (distance < minDistance) {
                minDistance = distance
                closestSection = section.getAttribute('id')
            }
        })
        
        currentSection = closestSection
    }
    
    // Update all nav links
    navLinks.forEach(link => {
        const listItem = link.closest('li')
        squaresPerRow = Math.floor(listItem.offsetWidth / squareSize) + 2
        const squares = listItem.querySelectorAll('.navsquare')
        
        if (link.getAttribute('href') === `#${currentSection}`) {
            // Active link
            link.classList.add('active')
            listItem.classList.add('active')
            link.classList.add('text-black')
            
            // Adaptive animation timing based on device
            const isMobile = window.innerWidth <= 768
            const baseDelay = isMobile ? baseDelayPerCol * 1.5 : baseDelayPerCol
            const maxRandomDelay = isMobile ? maxAdditionalDelayPerRow * 0.8 : maxAdditionalDelayPerRow
            
            squares.forEach((square, index) => {
                const col = index % squaresPerRow
                const delay = Math.random() * maxRandomDelay + col * baseDelay
                addScaleAnimation(square, delay)
            })
        } else {
            // Inactive link
            link.classList.remove('active')
            listItem.classList.remove('active')
            link.classList.remove('text-black')
            squares.forEach(square => {
                removeScaleAnimation(square)
            })
        }
    })
}

function calculateSquaresPerRow() {
    const link = document.querySelector('#navbar ul li a')
    if (link) {
        const listItem = link.closest('li')
        squaresPerRow = Math.floor(listItem.offsetWidth / squareSize) + 2
    }
}

function setupNavSquares(squareSize, baseDelay, maxRandomDelay) {
    document.querySelectorAll('#navbar li a').forEach(link => {
        const listItem = link.closest('li')
        const width = listItem.offsetWidth
        const height = listItem.offsetHeight
        
        // Calculate grid dimensions based on element size
        const cols = Math.floor(width / squareSize) + 2
        const rows = Math.floor(height / squareSize) + 2
        
        // Create the grid
        createGrid(listItem, squareSize, cols, rows)
        
        // Add hover effects (only on non-touch devices)
        if (window.matchMedia('(hover: hover)').matches) {
            listItem.addEventListener('mouseenter', () => {
                if (!link.classList.contains('active')) {
                    link.classList.add('text-black')
                    
                    listItem.querySelectorAll('.navsquare').forEach((square, index) => {
                        const col = index % cols
                        const delay = Math.random() * maxRandomDelay + col * baseDelay
                        addScaleAnimation(square, delay)
                    })
                }
            })
            
            listItem.addEventListener('mouseleave', () => {
                if (!link.classList.contains('active')) {
                    link.classList.remove('text-black')
                    
                    listItem.querySelectorAll('.navsquare').forEach(square => {
                        removeScaleAnimation(square)
                    })
                }
            })
        }
    })
}

// Adaptive configuration for different devices
const squareSize = window.innerWidth <= 768 ? 8 : 5
const baseDelayPerCol = window.innerWidth <= 768 ? 5 : 3
const maxAdditionalDelayPerRow = window.innerWidth <= 768 ? 15 : 10
let squaresPerRow

// Responsive handlers with optimized debounce timing
const resizeDebounceTime = window.innerWidth <= 768 ? 150 : 100
const scrollDebounceTime = window.innerWidth <= 768 ? 50 : 15

// Event listeners
window.addEventListener('resize', debounce(() => {
    calculateSquaresPerRow()
    setupNavSquares(squareSize, baseDelayPerCol, maxAdditionalDelayPerRow)
    updateActiveNavLink()
}, resizeDebounceTime))

document.addEventListener('DOMContentLoaded', () => {
    // Initial setup
    calculateSquaresPerRow()
    setupNavSquares(squareSize, baseDelayPerCol, maxAdditionalDelayPerRow)
    updateActiveNavLink()
    
    // Scroll handling with improved performance
    const contentsElement = document.querySelector('#contents')
    contentsElement.addEventListener('scroll', debounce(() => {
        updateActiveNavLink()
    }, scrollDebounceTime))
    
    // Smooth scrolling with adaptive offset
    document.querySelectorAll('#navbar ul li a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault()
            
            const targetId = this.getAttribute('href').replace(/^#/, '')
            const targetElement = document.getElementById(targetId)
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header-container').offsetHeight
                const offset = window.innerWidth <= 768 ? 20 : 10
                const targetPosition = targetElement.offsetTop - headerHeight - offset
                
                contentsElement.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                })
            }
        })
    })
})

// Mobile menu handling
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menu')
    const navItems = document.querySelectorAll('#navbar ul li')
    
    // Toggle mobile menu
    menuButton.addEventListener('click', () => {
        const isExpanded = navItems[0].classList.contains('expanded1')
        
        navItems.forEach((item, index) => {
            item.classList.remove(`expanded${index + 1}`)
            
            if (!isExpanded) {
                item.classList.add(`expanded${index + 1}`)
            }
        })
    })
    
    // Close menu when clicking outside
    document.addEventListener('click', e => {
        if (!e.target.closest('#navbar')) {
            navItems.forEach((item, index) => {
                item.classList.remove(`expanded${index + 1}`)
            })
        }
    })
    
    // Close menu after clicking a link
    navItems.forEach((item) => {
        item.addEventListener('click', () => {
            navItems.forEach((navItem, index) => {
                navItem.classList.remove(`expanded${index + 1}`)
            })
        })
    })
})