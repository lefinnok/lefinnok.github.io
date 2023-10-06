window.onload = function() {
    var initialViewWidth = window.innerWidth; // grab the initial view width
    var circleAttributes = [
        {
            size: 30,
            //children: [],
            //hover: function() { /* your code here */ },
            //click: function() { /* your code here */ }
            // add any other attributes here
        },
        {
            size: 60,
            children: [],
            hover: function() { /* your code here */ },
            click: function() { /* your code here */ }
            // add any other attributes here
        },
        {
            size: 100,
            children: [],
            hover: function() { /* your code here */ },
            click: function() { /* your code here */ }
            // add any other attributes here
        },
        {
            size: 80,
            children: [],
            hover: function() { /* your code here */ },
            click: function() { /* your code here */ }
            // add any other attributes here
        },
        {
            size: 20,
            children: [],
            hover: function() { /* your code here */ },
            click: function() { /* your code here */ },
            // add any other attributes here
        },
        {
            size: 30,
            children: [],
            hover: function() { /* your code here */ },
            click: function() { /* your code here */ }
            // add any other attributes here
        }
        // add more circle objects here
    ];
    var circles = [];
    // Define an array to store time offsets
    var timeOffsets = [];
    var mouseX = 0, mouseY = 0;
    // Scale values according to the initial view width
    var gravity = 300 * initialViewWidth / 1920, damping = 0.95, floatAmplitude = 0.2, floatFrequency = 0.02, springStrength = 0.01, maxDisplacement = 100 * initialViewWidth / 1920, minGravityDistance = 60 * initialViewWidth / 1920, distanceFactor = 10;
    var minEdgeDistance = 50 * initialViewWidth / 1920;
    var minCircleDistance = 100 * initialViewWidth / 1920;
    var shiftFactor = 6 * initialViewWidth / 1920; 
    // Listen to mouse movement
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
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
        //circle.style.backgroundColor = attributes.color;
        // Add event listeners
        circle.addEventListener('mouseover', attributes.hover);
        circle.addEventListener('click', attributes.click);
        // Append to container
        container.appendChild(circle);

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
                    var lineOpacity = (Math.sin(((Date.now() / 2000) + timeOffset))/2+0.5) * distanceLineFactor * 0.3; // Add the time offset to the time
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
    
};



