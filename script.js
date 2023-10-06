window.onload = function() {
    var initialViewWidth = window.innerWidth; // grab the initial view width
    var circleAttributes = [
        {
            size: 100,
            svgPath: '<svg fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 481.829 481.829" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M256.621,180.247c0-41.355-33.645-75-75-75s-75,33.645-75,75s33.645,75,75,75S256.621,221.603,256.621,180.247z M181.62,225.247c-24.813,0-45-20.187-45-45s20.187-45,45-45s45,20.187,45,45S206.434,225.247,181.62,225.247z"></path> <path d="M481.829,459.765l-71.348-71.349c12.528-16.886,19.949-37.777,19.949-60.37c0-46.31-31.166-85.477-73.624-97.632 c4.269-15.558,6.435-31.617,6.435-47.945C363.24,82.324,281.765,0.85,181.62,0.85S0,82.324,0,182.469 c0,41.232,13.525,80.127,39.139,112.514L181.62,474.122l66.901-84.114c18.584,24.051,47.7,39.571,80.376,39.571 c22.594,0,43.485-7.421,60.371-19.95l71.348,71.349L481.829,459.765z M181.62,425.928L62.643,276.342 C41.288,249.339,30,216.879,30,182.469C30,98.866,98.016,30.85,181.62,30.85s151.62,68.016,151.62,151.619 c0,15.058-2.197,29.837-6.536,44.072c-54.976,1.171-99.34,46.253-99.34,101.505c0,11.661,1.982,22.867,5.617,33.306L181.62,425.928 z M328.897,399.579c-39.443,0-71.533-32.09-71.533-71.533s32.09-71.533,71.533-71.533s71.532,32.09,71.532,71.533 S368.34,399.579,328.897,399.579z"></path> </g> </g></svg>',
            click: function() { /* your code here */ },
            label: "About Me",
            linkedId: "about"
        },
        {
            size: 120,
            children: [],
            click: function() { /* your code here */ },
            svgPath: '<svg fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 481.829 481.829" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M256.621,180.247c0-41.355-33.645-75-75-75s-75,33.645-75,75s33.645,75,75,75S256.621,221.603,256.621,180.247z M181.62,225.247c-24.813,0-45-20.187-45-45s20.187-45,45-45s45,20.187,45,45S206.434,225.247,181.62,225.247z"></path> <path d="M481.829,459.765l-71.348-71.349c12.528-16.886,19.949-37.777,19.949-60.37c0-46.31-31.166-85.477-73.624-97.632 c4.269-15.558,6.435-31.617,6.435-47.945C363.24,82.324,281.765,0.85,181.62,0.85S0,82.324,0,182.469 c0,41.232,13.525,80.127,39.139,112.514L181.62,474.122l66.901-84.114c18.584,24.051,47.7,39.571,80.376,39.571 c22.594,0,43.485-7.421,60.371-19.95l71.348,71.349L481.829,459.765z M181.62,425.928L62.643,276.342 C41.288,249.339,30,216.879,30,182.469C30,98.866,98.016,30.85,181.62,30.85s151.62,68.016,151.62,151.619 c0,15.058-2.197,29.837-6.536,44.072c-54.976,1.171-99.34,46.253-99.34,101.505c0,11.661,1.982,22.867,5.617,33.306L181.62,425.928 z M328.897,399.579c-39.443,0-71.533-32.09-71.533-71.533s32.09-71.533,71.533-71.533s71.532,32.09,71.532,71.533 S368.34,399.579,328.897,399.579z"></path> </g> </g></svg>',
            label: "Contact Me",
            linkedId: "contacts"
        },
        {
            size: 200,
            children: [],
            click: function() { /* your code here */ },
            svgPath: '<svg fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 481.829 481.829" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M256.621,180.247c0-41.355-33.645-75-75-75s-75,33.645-75,75s33.645,75,75,75S256.621,221.603,256.621,180.247z M181.62,225.247c-24.813,0-45-20.187-45-45s20.187-45,45-45s45,20.187,45,45S206.434,225.247,181.62,225.247z"></path> <path d="M481.829,459.765l-71.348-71.349c12.528-16.886,19.949-37.777,19.949-60.37c0-46.31-31.166-85.477-73.624-97.632 c4.269-15.558,6.435-31.617,6.435-47.945C363.24,82.324,281.765,0.85,181.62,0.85S0,82.324,0,182.469 c0,41.232,13.525,80.127,39.139,112.514L181.62,474.122l66.901-84.114c18.584,24.051,47.7,39.571,80.376,39.571 c22.594,0,43.485-7.421,60.371-19.95l71.348,71.349L481.829,459.765z M181.62,425.928L62.643,276.342 C41.288,249.339,30,216.879,30,182.469C30,98.866,98.016,30.85,181.62,30.85s151.62,68.016,151.62,151.619 c0,15.058-2.197,29.837-6.536,44.072c-54.976,1.171-99.34,46.253-99.34,101.505c0,11.661,1.982,22.867,5.617,33.306L181.62,425.928 z M328.897,399.579c-39.443,0-71.533-32.09-71.533-71.533s32.09-71.533,71.533-71.533s71.532,32.09,71.532,71.533 S368.34,399.579,328.897,399.579z"></path> </g> </g></svg>',
            label: "Project Showcase",
            linkedId: "project"
        },
        {
            size: 160,
            children: [],
            click: function() { /* your code here */ },
            svgPath: '<svg fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 481.829 481.829" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M256.621,180.247c0-41.355-33.645-75-75-75s-75,33.645-75,75s33.645,75,75,75S256.621,221.603,256.621,180.247z M181.62,225.247c-24.813,0-45-20.187-45-45s20.187-45,45-45s45,20.187,45,45S206.434,225.247,181.62,225.247z"></path> <path d="M481.829,459.765l-71.348-71.349c12.528-16.886,19.949-37.777,19.949-60.37c0-46.31-31.166-85.477-73.624-97.632 c4.269-15.558,6.435-31.617,6.435-47.945C363.24,82.324,281.765,0.85,181.62,0.85S0,82.324,0,182.469 c0,41.232,13.525,80.127,39.139,112.514L181.62,474.122l66.901-84.114c18.584,24.051,47.7,39.571,80.376,39.571 c22.594,0,43.485-7.421,60.371-19.95l71.348,71.349L481.829,459.765z M181.62,425.928L62.643,276.342 C41.288,249.339,30,216.879,30,182.469C30,98.866,98.016,30.85,181.62,30.85s151.62,68.016,151.62,151.619 c0,15.058-2.197,29.837-6.536,44.072c-54.976,1.171-99.34,46.253-99.34,101.505c0,11.661,1.982,22.867,5.617,33.306L181.62,425.928 z M328.897,399.579c-39.443,0-71.533-32.09-71.533-71.533s32.09-71.533,71.533-71.533s71.532,32.09,71.532,71.533 S368.34,399.579,328.897,399.579z"></path> </g> </g></svg>',
            label: "Orgainisations",
            linkedId: "orgs"
        },
        {
            size: 60,
            children: [],
            click: function() { /* your code here */ },
            svgPath: '<svg fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 481.829 481.829" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M256.621,180.247c0-41.355-33.645-75-75-75s-75,33.645-75,75s33.645,75,75,75S256.621,221.603,256.621,180.247z M181.62,225.247c-24.813,0-45-20.187-45-45s20.187-45,45-45s45,20.187,45,45S206.434,225.247,181.62,225.247z"></path> <path d="M481.829,459.765l-71.348-71.349c12.528-16.886,19.949-37.777,19.949-60.37c0-46.31-31.166-85.477-73.624-97.632 c4.269-15.558,6.435-31.617,6.435-47.945C363.24,82.324,281.765,0.85,181.62,0.85S0,82.324,0,182.469 c0,41.232,13.525,80.127,39.139,112.514L181.62,474.122l66.901-84.114c18.584,24.051,47.7,39.571,80.376,39.571 c22.594,0,43.485-7.421,60.371-19.95l71.348,71.349L481.829,459.765z M181.62,425.928L62.643,276.342 C41.288,249.339,30,216.879,30,182.469C30,98.866,98.016,30.85,181.62,30.85s151.62,68.016,151.62,151.619 c0,15.058-2.197,29.837-6.536,44.072c-54.976,1.171-99.34,46.253-99.34,101.505c0,11.661,1.982,22.867,5.617,33.306L181.62,425.928 z M328.897,399.579c-39.443,0-71.533-32.09-71.533-71.533s32.09-71.533,71.533-71.533s71.532,32.09,71.532,71.533 S368.34,399.579,328.897,399.579z"></path> </g> </g></svg>',
            label: "Stuff",
            linkedId: "stuf"
        },
        {
            size: 100,
            children: [],
            click: function() { /* your code here */ },
            svgPath: '<svg fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 481.829 481.829" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M256.621,180.247c0-41.355-33.645-75-75-75s-75,33.645-75,75s33.645,75,75,75S256.621,221.603,256.621,180.247z M181.62,225.247c-24.813,0-45-20.187-45-45s20.187-45,45-45s45,20.187,45,45S206.434,225.247,181.62,225.247z"></path> <path d="M481.829,459.765l-71.348-71.349c12.528-16.886,19.949-37.777,19.949-60.37c0-46.31-31.166-85.477-73.624-97.632 c4.269-15.558,6.435-31.617,6.435-47.945C363.24,82.324,281.765,0.85,181.62,0.85S0,82.324,0,182.469 c0,41.232,13.525,80.127,39.139,112.514L181.62,474.122l66.901-84.114c18.584,24.051,47.7,39.571,80.376,39.571 c22.594,0,43.485-7.421,60.371-19.95l71.348,71.349L481.829,459.765z M181.62,425.928L62.643,276.342 C41.288,249.339,30,216.879,30,182.469C30,98.866,98.016,30.85,181.62,30.85s151.62,68.016,151.62,151.619 c0,15.058-2.197,29.837-6.536,44.072c-54.976,1.171-99.34,46.253-99.34,101.505c0,11.661,1.982,22.867,5.617,33.306L181.62,425.928 z M328.897,399.579c-39.443,0-71.533-32.09-71.533-71.533s32.09-71.533,71.533-71.533s71.532,32.09,71.532,71.533 S368.34,399.579,328.897,399.579z"></path> </g> </g></svg>',
            label: "Hobbies",
            linkedId: "hobbies"
        }
        // add more circle objects here
    ];
    var circles = [];
    // Define an array to store time offsets
    var timeOffsets = [];
    var mouseX = 0, mouseY = 0;
    // Scale values according to the initial view width
    var gravity = 300 * initialViewWidth / 1920, damping = 0.95, floatAmplitude = 0.3, floatFrequency = 0.02, springStrength = 0.01, maxDisplacement = 100 * initialViewWidth / 1920, minGravityDistance = 60 * initialViewWidth / 1920, distanceFactor = 10;
    var minEdgeDistance = 50 * initialViewWidth / 1920;
    var minCircleDistance = 100 * initialViewWidth / 1920;
    var shiftFactor = 26 * initialViewWidth / 1920; 
    var lineFadeFrequency = 2;
    // Listen to mouse movement
    document.addEventListener('mousemove', function(e) {
        var rect = container.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    // Get a reference to the canvas
    const container = document.getElementById('container');
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');


  
    // Update canvas size
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Update canvas size when window is resized
    window.addEventListener('resize', function() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    });

    /*
    ctx.beginPath();
    ctx.moveTo(10, 20);
    ctx.lineTo(100, 20);
    ctx.strokeStyle = "#FFAACC";
    ctx.lineWidth = 1;
    ctx.stroke();
    */

    // Initialize the circles
    circleAttributes.forEach(function(attributes, index) {
        var circle = document.createElement('div');
        circle.classList.add('circle');
        var scaledSize = attributes.size * initialViewWidth / 1920;
        // Set style
        circle.style.width = scaledSize + 'px';
        circle.style.height = scaledSize + 'px';
        // Add an id to each circle and corresponding linkedId element
        circle.id = "circle-" + index;
        var linkedElement = document.getElementById(attributes.linkedId);
        if (linkedElement) {
            linkedElement.id = "linked-" + index;
        }
        
        //circle.style.backgroundColor = attributes.color;
        // Append to container
        container.appendChild(circle);

        // Parse the SVG data
        var parser = new DOMParser();
        var svgDoc = parser.parseFromString(attributes.svgPath, "image/svg+xml");

        // Get the SVG element
        var svgElement = svgDoc.documentElement;

        // Modify the SVG attributes
        svgElement.setAttribute("width", scaledSize*0.6);
        svgElement.setAttribute("height", scaledSize*0.6);
        circle.style.display = 'flex';
        circle.style.justifyContent = 'center';
        circle.style.alignItems = 'center';
        circle.style.cursor = 'pointer';
        

        // Append the SVG to the circle
        circle.appendChild(svgElement);

        // Create the label
        var label = document.createElement('span');
        label.innerHTML = attributes.label; // assuming label attribute contains the label text
        label.style.position = 'absolute';
        label.style.top = '-10%'; // position at the edge of the circle (bottom)
        label.style.left = '110%'; // center horizontally
        label.style.whiteSpace = 'pre'; // center horizontally
        //label.style.transform = 'translate(-50%, -50%)';
        label.style.opacity = '0';
        label.style.transition = 'opacity 0.3s ease-in-out'; // modify this line
        circle.appendChild(label);

        // Create the underline
        var underline = document.createElement('span');
        underline.style.position = 'absolute';
        underline.style.top = '90%'; // position a bit below the label
        underline.style.left = '0'; // start from the beginning of the label
        underline.style.transform = 'translateX(0)'; // no need for the horizontal translation
        underline.style.width = '0';
        underline.style.height = '0.3vw'; // adjust as needed
        underline.style.background = '#000'; // adjust as needed
        underline.style.transition = 'width 0.3s ease-in-out';
        label.appendChild(underline); // append the underline to the label

        // Add event listeners
        circle.addEventListener('mouseover', function() {
            label.style.opacity = '1'; // make label visible
            underline.style.width = '100%'; // extend underline
            hoverLinkedElement(this, true);
        });

        circle.addEventListener('mouseout', function() {
            label.style.opacity = '0'; // make label invisible
            underline.style.width = '0'; // retract underline
            hoverLinkedElement(this, false);
        });
        circle.addEventListener('click', attributes.click);

        if (linkedElement) {
            linkedElement.addEventListener('mouseover', function() {
                hoverCircleElement(this, true);
            });
        
            linkedElement.addEventListener('mouseout', function() {
                hoverCircleElement(this, false);
            });
        }

        var sizeInPx = circle.offsetWidth; // get size in pixels

        var initX, initY, isPositionOK;
        do {
            // Random x, y coordinates
            initX = Math.random() * (container.offsetWidth - 2 * (minEdgeDistance + sizeInPx / 2)) + minEdgeDistance + sizeInPx / 2;
            initY = Math.random() * (container.offsetHeight - 2 * (minEdgeDistance + sizeInPx / 2)) + minEdgeDistance + sizeInPx / 2;
            // Check if the new position is okay
            isPositionOK = circles.every(function(otherCircle) {
                var dx = otherCircle.x - initX, dy = otherCircle.y - initY;
                // distance between two circles
                var minDistance = (sizeInPx / 2) + (otherCircle.el.offsetWidth / 2) + minCircleDistance;
                return Math.sqrt(dx * dx + dy * dy) >= minDistance;
            });
        } while (!isPositionOK);
        
        // Push to circles
        circles.push({
            el: circle,
            x: initX,
            y: initY,
            size: sizeInPx,
            color: attributes.color,
            speedX: 0,
            speedY: 0,
            oscillation: Math.random() * Math.PI * 2, // Initial phase of the oscillation
            initX: initX,
            initY: initY
        });
        
        // Update the DOM element position
        circle.style.left = (circles[index].x - circles[index].size / 2) + 'px';
        circle.style.top = (circles[index].y - circles[index].size / 2) + 'px';
        // Create time offsets
        timeOffsets[index] = [];
        for (var j = 0; j < index; j++) {
            timeOffsets[index][j] = Math.random() * 1000; // Random value in milliseconds
        }
    });

    function hoverLinkedElement(circle, isHover) {
        var linkedElement = document.getElementById("linked-" + circle.id.split("-")[1]);
        if (linkedElement) {
            if (isHover) {
                linkedElement.classList.add('hover');
            } else {
                linkedElement.classList.remove('hover');
            }
        }
    }
    
    function hoverCircleElement(linkedElement, isHover) {
        var circleElement = document.getElementById("circle-" + linkedElement.id.split("-")[1]);
        if (circleElement) {
            if (isHover) {
                circleElement.dispatchEvent(new Event('mouseover'));
            } else {
                circleElement.dispatchEvent(new Event('mouseout'));
            }
        }
    }

    // Lerp function for easing
    function lerp(start, end, factor) {
        return start * (1 - factor) + end * factor;
    }

    // Limit displacement function
    function limitDisplacement(circle) {
        var dx = circle.x - circle.initX;
        var dy = circle.y - circle.initY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxDisplacement) {
            var ratio = maxDisplacement / distance;
            circle.x = circle.initX + dx * ratio;
            circle.y = circle.initY + dy * ratio;
        }
    }

    // Animate function
    function animate() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        circles.forEach(function(circle, index) {
            var dx = mouseX - circle.x;
            var dy = mouseY - circle.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            // Define localGravity
            var localGravity = 0;

            if (distance > minGravityDistance) {
                // The closer the mouse gets to the circle, the stronger the gravity
                localGravity = gravity * distanceFactor / (Math.pow(distance, 3));
            } else {
                // When the mouse is within minGravityDistance, invert the effect gradually
                localGravity = gravity * distanceFactor / Math.pow(minGravityDistance, 3) * (distance / minGravityDistance);
            }

            // Apply localGravity
            circle.speedX = (lerp(circle.speedX, dx, localGravity) - (circle.x - circle.initX) * springStrength) * damping;
            circle.speedY = (lerp(circle.speedY, dy, localGravity) - (circle.y - circle.initY) * springStrength) * damping;

            // Apply the speed to the position
            circle.x += circle.speedX;
            circle.y += circle.speedY;

            // Limit displacement
            limitDisplacement(circle);

            // Apply the floating effect to the y position
            circle.oscillation += floatFrequency;
            circle.y += Math.sin(circle.oscillation) * floatAmplitude;

            // Update the DOM element position
            circle.el.style.left = (circle.x  - circle.size / 2) + 'px';
            circle.el.style.top = (circle.y - circle.size / 2) + 'px';

            for (var i = 0; i < circles.length; i++) {
                var circle = circles[i];
            
                for (var j = 0; j < i; j++) {
                    var otherCircle = circles[j];
                    var dx = circle.x - otherCircle.x;
                    var dy = circle.y - otherCircle.y;
                    var distance = Math.sqrt(dx * dx + dy * dy);
                    var distanceLineFactor = Math.min(1, 1 / (distance * 0.01 + 1));
                    var timeOffset;
                    // Ensure we're accessing the lower half of the array
                    if (i > j) {
                        timeOffset = timeOffsets[i][j];
                    } else {
                        timeOffset = timeOffsets[j][i];
                    }
                    var lineOpacity = (Math.sin(((Date.now() * lineFadeFrequency / 1000) + timeOffset))/2+0.5) * distanceLineFactor * 0.3; // Add the time offset to the time
                    //console.log(distanceLineFactor,timeOffset,lineOpacity);
                    ctx.beginPath();
                    ctx.moveTo(circle.x + circle.size/shiftFactor, circle.y + circle.size/shiftFactor);
                    ctx.lineTo(otherCircle.x + otherCircle.size/shiftFactor, otherCircle.y + otherCircle.size/shiftFactor);
                    ctx.lineWidth = 0.8;
                    ctx.strokeStyle = 'rgba(0, 0, 0, ' + lineOpacity + ')';
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    }

    // Start the animation
    animate();
    let accentContainers = document.querySelectorAll('.accentcontainer');
    const delayIncrement = 0.5; // Change this to the amount of delay increment you want
  
    accentContainers.forEach(accentContainer => {
      let sideboxes = accentContainer.querySelectorAll('.sideboxes');
      
      sideboxes.forEach((sidebox, index) => {
        let animationDelay = delayIncrement * index;
        sidebox.style.animationDelay = `${animationDelay}s`;
      });
    });
};



