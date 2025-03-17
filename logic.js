function createEquilateralTrianglePath(centerCoordinates, size) {
    const height = (Math.sqrt(3) / 2) * size;
    const halfSize = size / 2;

    const globalOffsetX = Number(offsetX.value);
    const globalOffsetY = Number(offsetY.value);

    // Calculate vertices for downward-pointing triangle
    const x1 = centerCoordinates[0] - halfSize;
    const y1 = centerCoordinates[1] - height/2;
    const x2 = centerCoordinates[0] + halfSize;
    const y2 = centerCoordinates[1] - height/2;
    const x3 = centerCoordinates[0];
    const y3 = centerCoordinates[1] + height/2;

    return {
        path: `M ${x1 + globalOffsetX} ${y1 + globalOffsetY} L ${x2 + globalOffsetX} ${y2 + globalOffsetY} L ${x3 + globalOffsetX} ${y3 + globalOffsetY} Z`,
        vertices: [[x1 + globalOffsetX, y1 + globalOffsetY], [x2 + globalOffsetX, y2 + globalOffsetY], [x3 + globalOffsetX, y3 + globalOffsetY]]
    };
}

function getSelectedChevronLeg(triangleIndex) {
    return parseInt(document.querySelector(`input[name="triangle${triangleIndex + 1}-leg"]:checked`).value);
}

function getChevronPosition(triangleIndex) {
    return parseFloat(document.getElementById(`position${triangleIndex + 1}`).value);
}

function getSelectedCrossoverLeg(triangleIndex) {
    return parseInt(document.querySelector(`input[name="crossoverTriangle${triangleIndex + 1}-leg"]:checked`).value);
}

function getCrossoverPosition(triangleIndex) {
    return parseFloat(document.getElementById(`crossoverPosition${triangleIndex + 1}`).value);
}

function createChevronPath(startPoint, endPoint, width, position) {
    const dx = endPoint[0] - startPoint[0];
    const dy = endPoint[1] - startPoint[1];
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / length;
    const unitY = dy / length;

    // Calculate chevron points
    const chevronWidth = width * 1.5;  // Make chevron slightly wider than stroke
    const depthMultiplier = Number(chevronDepthSlider.value) * (invertChevrons.checked ? -1 : 1);
    const chevronDepth = width * depthMultiplier;    // Depth of chevron cut

    // Calculate middle point of the line
    const midX = startPoint[0] + (endPoint[0] - startPoint[0]) * position;
    const midY = startPoint[1] + (endPoint[1] - startPoint[1]) * position;

    // Calculate points for chevron that points along the line direction
    const chevronPoint1X = midX + unitX * chevronDepth/2;
    const chevronPoint1Y = midY + unitY * chevronDepth/2;
    const chevronPoint2X = midX - unitX * chevronDepth/2;
    const chevronPoint2Y = midY - unitY * chevronDepth/2;

    // Calculate the width points perpendicular to the line
    const perpX = -unitY;  // Perpendicular vector
    const perpY = unitX;

    // Create the four points of the chevron
    const p1x = chevronPoint1X + perpX * chevronWidth/2;
    const p1y = chevronPoint1Y + perpY * chevronWidth/2;
    const p2x = chevronPoint1X - perpX * chevronWidth/2;
    const p2y = chevronPoint1Y - perpY * chevronWidth/2;
    const p3x = chevronPoint2X;
    const p3y = chevronPoint2Y;

    document.getElementById('chevron-angle-value').innerText = calculateAngle([[p1x, p1y], [p2x, p2y], [p3x, p3y]])[2].toFixed(2);

    return `M ${p1x} ${p1y}
            L ${p3x} ${p3y}
            L ${p2x} ${p2y}`;
}

function createCrossoverPath(startPoint, endPoint, width, position, depth) {
    const dx = endPoint[0] - startPoint[0];
    const dy = endPoint[1] - startPoint[1];

    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI/2;

    // Calculate center point using the position parameter (0-100%)
    const centerX = startPoint[0] + Math.cos(perpAngle) * (-0.5 * width) + (dx * (position / 100));
    const centerY = startPoint[1] +  Math.sin(perpAngle) * (-0.5* width) + (dy * (position / 100));

    // Calculate the angles for the three points of the triangle
    // Rotate everything by 60 degrees (π/3 radians) from the perpendicular
    const rotationAngle = Math.PI/3;  // 60 degrees
    const point1Angle = angle - Math.PI/2 + rotationAngle;
    const point2Angle = point1Angle + (2 * Math.PI/3);  // Add 120 degrees for equilateral triangle
    const point3Angle = point2Angle + (2 * Math.PI/3);  // Add another 120 degrees

    // Calculate the three points of the triangle
    const radius = width;  // Keep the size contained within the stroke width
    const point1X = centerX + Math.cos(point1Angle) + (dx * depth);
    const point1Y = centerY + Math.sin(point1Angle) + (dy * depth);
    const point2X = centerX + Math.cos(point2Angle) * radius * .5;
    const point2Y = centerY + Math.sin(point2Angle) * radius * .5;
    const point3X = centerX + Math.cos(point3Angle) - (dx * depth);
    const point3Y = centerY + Math.sin(point3Angle) - (dy * depth);

    document.getElementById('crossover-angle-value').innerText = (180 - calculateAngle([[point1X, point1Y], [point2X, point2Y], [point3X, point3Y]])[1]).toFixed(2);

    // Create the triangular path
    return `M ${point1X} ${point1Y} L ${point2X} ${point2Y} L ${point3X} ${point3Y} Z`;
}

function createOpposingCrossoverPath(startPoint, endPoint, width, position, depth) {
    const dx = endPoint[0] - startPoint[0];
    const dy = endPoint[1] - startPoint[1];

    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI/2;

    // Calculate center point using the position parameter (0-100%)
    const centerX = startPoint[0] + Math.cos(perpAngle) * (width * .5) + (dx * (position / 100));
    const centerY = startPoint[1] + Math.sin(perpAngle) * (width * .5) + (dy * (position / 100));

    // Calculate the angles for the three points of the triangle
    // Rotate everything by 60 degrees (π/3 radians) from the perpendicular
    const rotationAngle = 0;  // 60 degrees
    const point1Angle = angle - Math.PI/2 + rotationAngle;
    const point2Angle = point1Angle + (2 * Math.PI/3);  // Add 120 degrees for equilateral triangle
    const point3Angle = point2Angle + (2 * Math.PI/3);  // Add another 120 degrees

    // Calculate the three points of the triangle
    const radius = width;  // Keep the size contained within the stroke width
    const point1X = centerX + Math.cos(point1Angle) * radius * .5;
    const point1Y = centerY + Math.sin(point1Angle) * radius * .5;
    const point2X = centerX + Math.cos(point2Angle) + (dx * depth);
    const point2Y = centerY + Math.sin(point2Angle) + (dy * depth);
    const point3X = centerX + Math.cos(point3Angle) - (dx * depth);
    const point3Y = centerY + Math.sin(point3Angle) - (dy * depth);

    // Create the triangular path
    return `M ${point1X} ${point1Y} L ${point2X} ${point2Y} L ${point3X} ${point3Y} Z`;
}

function saveToURL() {
    const fields = {
        'stroke-width': 'value',
        'triangle-size': 'value',
        'spacing-size': 'value',
        'backing-size': 'value',
        'chevron-stroke': 'value',
        'chevron-depth': 'value',
        'crossoverPosition1': 'value',
        'crossoverPosition2': 'value',
        'crossoverPosition3': 'value',
        'position1': 'value',
        'position2': 'value',
        'position3': 'value',
        'crossover-depth': 'value',
        'x-offset': 'value',
        'y-offset': 'value',
        'should-weave': 'check',
        'sync-positions': 'check',
        'invert-chevrons': 'check',
        'sync-crossover-positions': 'check',
        'triangle1-leg-0': 'check',
        'triangle1-leg-1': 'check',
        'triangle1-leg-2': 'check',
        'triangle2-leg-0': 'check',
        'triangle2-leg-1': 'check',
        'triangle2-leg-2': 'check',
        'triangle3-leg-0': 'check',
        'triangle3-leg-1': 'check',
        'triangle3-leg-2': 'check',
        'crossoverTriangle1-leg-0': 'check',
        'crossoverTriangle1-leg-1': 'check',
        'crossoverTriangle1-leg-2': 'check',
        'crossoverTriangle2-leg-0': 'check',
        'crossoverTriangle2-leg-1': 'check',
        'crossoverTriangle2-leg-2': 'check',
        'crossoverTriangle3-leg-0': 'check',
        'crossoverTriangle3-leg-1': 'check',
        'crossoverTriangle3-leg-2': 'check'
    }

    const savedData = [];
    for (field of Object.keys(fields)) {
        let value;
        if (fields[field] === 'value') {
           value = document.getElementById(field).value;
        } else {
            // checkbox
            value = document.getElementById(field).checked;
        }
        savedData.push({fieldName: field, fieldType: fields[field], value: value})
    }

    history.pushState(null, null, '#' + btoa(JSON.stringify(savedData)));
}

function downloadSVG(svgElementId, filename) {
    // Get the SVG element
    const svgElement = document.getElementById(svgElementId);
    if (!svgElement) {
        throw new Error(`No SVG element found with ID: ${svgElementId}`);
    }

    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true);

    // Ensure proper XML namespaces are set
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Get the SVG as a string
    const svgData = new XMLSerializer().serializeToString(svgClone);

    // Create a Blob with the SVG data
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

    // Create the download URL
    const url = URL.createObjectURL(svgBlob);

    // Create a temporary link element
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;

    // Append link to body (required for Firefox)
    document.body.appendChild(downloadLink);

    // Trigger the download
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}


function trimCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = pixels.data;
    let bounds = {
        top: null,
        left: null,
        right: null,
        bottom: null
    };

    // Scan from top to bottom for the first non-white pixel
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3];
            // Check if pixel is not white (allowing for some tolerance)
            if (data[index] < 255 || data[index + 1] < 255 || data[index + 2] < 255 || alpha < 255) {
                bounds.top = bounds.top !== null ? bounds.top : y;
                bounds.bottom = y;
            }
        }
    }

    // Scan from left to right for the first non-white pixel
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3];
            if (data[index] < 255 || data[index + 1] < 255 || data[index + 2] < 255 || alpha < 255) {
                bounds.left = bounds.left !== null ? bounds.left : x;
                bounds.right = x;
            }
        }
    }

    // If no non-white pixels were found, return original canvas
    if (bounds.top === null) {
        return canvas;
    }

    // Add a small padding
    const padding = 10;
    bounds.top = Math.max(0, bounds.top - padding);
    bounds.left = Math.max(0, bounds.left - padding);
    bounds.right = Math.min(canvas.width - 1, bounds.right + padding);
    bounds.bottom = Math.min(canvas.height - 1, bounds.bottom + padding);

    // Create new canvas with trimmed dimensions
    const trimmedWidth = bounds.right - bounds.left + 1;
    const trimmedHeight = bounds.bottom - bounds.top + 1;
    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = trimmedWidth;
    trimmedCanvas.height = trimmedHeight;

    // Draw trimmed image
    const trimmedCtx = trimmedCanvas.getContext('2d');
    trimmedCtx.drawImage(
        canvas,
        bounds.left, bounds.top, trimmedWidth, trimmedHeight,
        0, 0, trimmedWidth, trimmedHeight
    );

    return trimmedCanvas;
}

function downloadSVGAsPNG(svgId, filename) {
    // Get the SVG element
    const svgElement = document.getElementById(svgId);
    if (!svgElement) {
        console.error('SVG element not found');
        return;
    }

    // Get SVG data and dimensions
    const svgData = new XMLSerializer().serializeToString(svgElement);

    // Get the viewBox values
    const viewBox = svgElement.getAttribute('viewBox');
    let width, height;

    if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
        width = vbWidth;
        height = vbHeight;
    } else {
        // If no viewBox, try to get width/height directly
        width = parseFloat(svgElement.getAttribute('width')) || svgElement.getBoundingClientRect().width;
        height = parseFloat(svgElement.getAttribute('height')) || svgElement.getBoundingClientRect().height;
    }

    // Create canvas with proper dimensions
    const canvas = document.createElement('canvas');
    const scale = 2; // Increase resolution for better quality
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Create a blob from the SVG data
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create image object
    const img = new Image();

    img.onload = function() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw SVG to canvas at the correct dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to PNG and initiate download
        const trimmedCanvas = trimCanvas(canvas);
        try {
            const pngUrl = trimmedCanvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = filename || 'download.png';
            downloadLink.href = pngUrl;
            downloadLink.click();

            // Cleanup
            URL.revokeObjectURL(svgUrl);
        } catch (e) {
            console.error('Error converting to PNG:', e);
        }
    };

    // Handle potential errors
    img.onerror = function(e) {
        console.error('Error loading SVG:', e);
        URL.revokeObjectURL(svgUrl);
    };

    // Set base URI to handle potential relative URLs in SVG
    img.src = svgUrl;
}

function loadFromURL() {
    let data = window.location.hash.slice(1);

    if (!data) {
        data = bookmarks['candidates']["[current favorite] external crossover/mouth, clustered"]
    }

    // use url data
    for (inputValue of JSON.parse(atob(data))) {
        if (inputValue.fieldType === 'value') {
            document.getElementById(inputValue.fieldName).value = inputValue.value;
        } else {
            document.getElementById(inputValue.fieldName).checked = inputValue.value;
        }
    }

    updateTriangles();
}

// accepts [[x1,y1], [x2,y2], [x3,y3]]
// returns angle formed in degrees for each angle
function calculateAngle(points) {
    // Validate input
    if (!Array.isArray(points) || points.length !== 3 ||
        !points.every(p => Array.isArray(p) && p.length === 2 &&
        p.every(coord => typeof coord === 'number'))) {
        throw new Error('Invalid input: Expected array of three points [[x1,y1], [x2,y2], [x3,y3]]');
    }

    const [[x1, y1], [x2, y2], [x3, y3]] = points;

    // Calculate side lengths
    const a = Math.sqrt(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2)); // Side opposite to point 1
    const b = Math.sqrt(Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2)); // Side opposite to point 2
    const c = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)); // Side opposite to point 3

    // Check for degenerate triangle
    if (a === 0 || b === 0 || c === 0) {
        throw new Error('Invalid points: Two points cannot be identical');
    }

    // Check if points form a valid triangle
    if (a + b <= c || b + c <= a || a + c <= b) {
        return [180, 180, 180];
    }

    // Calculate angles using law of cosines
    // angle = arccos((b² + c² - a²) / (2bc))
    const angle1 = Math.acos((b * b + c * c - a * a) / (2 * b * c));
    const angle2 = Math.acos((a * a + c * c - b * b) / (2 * a * c));
    const angle3 = Math.acos((a * a + b * b - c * c) / (2 * a * b));

    // Convert to degrees
    const toDegrees = angle => angle * (180 / Math.PI);

    // Return angles rounded to 2 decimal places
    return [
        Number(toDegrees(angle1).toFixed(2)),
        Number(toDegrees(angle2).toFixed(2)),
        Number(toDegrees(angle3).toFixed(2))
    ];
}

// Get elements
// shapes
const triangle1 = document.getElementById('triangle1');
const triangle2 = document.getElementById('triangle2');
const triangle3 = document.getElementById('triangle3');

const triangle1backing = document.getElementById('triangle1backing');
const triangle2backing = document.getElementById('triangle2backing');
const triangle3backing = document.getElementById('triangle3backing');

const chevron1 = document.getElementById('chevron1');
const chevron2 = document.getElementById('chevron2');
const chevron3 = document.getElementById('chevron3');

const crossover1 = document.getElementById('crossover1');
const crossover2 = document.getElementById('crossover2');
const crossover3 = document.getElementById('crossover3');

// UI
const strokeWidthSlider = document.getElementById('stroke-width');
const strokeWidthValue = document.getElementById('stroke-width-value');

const triangleSizeSlider = document.getElementById('triangle-size');
const sizeValue = document.getElementById('size-value');

const spacingSlider = document.getElementById('spacing-size');
const spacingValue = document.getElementById('spacing-value');

const backingSlider = document.getElementById('backing-size');
const backingValue = document.getElementById('backing-value');

const chevronStrokeSlider = document.getElementById('chevron-stroke');
const chevronStrokeValue = document.getElementById('chevron-stroke-value');
const chevronDepthSlider = document.getElementById('chevron-depth');
const chevronDepthValue = document.getElementById('chevron-depth-value');
const invertChevrons = document.getElementById('invert-chevrons');

const crossoverDepthSlider = document.getElementById('crossover-depth');
const crossoverDepthValue = document.getElementById('crossover-depth-value');

const rotationSlider = document.getElementById('rotation');
const rotationValue = document.getElementById('rotation-value');

const shouldWeaveCheckbox = document.getElementById('should-weave');
const shouldWeaveEdgeCorrectionCheckbox = document.getElementById('should-edge-correct');

const offsetX = document.getElementById('x-offset');
const offsetY = document.getElementById('y-offset');
const offsetXValue = document.getElementById('x-offset-value');
const offsetYValue = document.getElementById('y-offset-value');

// Function to update triangle paths and chevrons
function updateTriangles() {
    const centroid = [400, 400];
    const size = Number(triangleSizeSlider.value);
    const spacing = Number(spacingSlider.value);
    const width = Number(strokeWidthSlider.value);

    const backing = Number(backingSlider.value);

    const chevronStroke = Number(chevronStrokeSlider.value);
    const chevronDepth = Number(chevronDepthSlider.value);

    const crossoverDepth = Number(crossoverDepthSlider.value);

    const offsetXAmount = Number(offsetX.value);
    const offsetYAmount = Number(offsetY.value);
    const rotation = Number(rotationSlider.value);

    const shouldWeave = shouldWeaveCheckbox.checked;
    const shouldCorrectWeave = shouldWeaveEdgeCorrectionCheckbox.checked;

    strokeWidthValue.textContent = width;
    backingValue.textContent = backing;
    sizeValue.textContent = size;
    spacingValue.textContent = spacing;

    chevronStrokeValue.textContent = chevronStroke;
    chevronDepthValue.textContent = chevronDepth;

    crossoverDepthValue.textContent = crossoverDepth;

    offsetXValue.textContent = offsetXAmount;
    offsetYValue.textContent = offsetYAmount;
    rotationValue.innerText = rotation;

    // update triangle stroke width
    [triangle1, triangle2, triangle3, triangleWeaveTopMask].forEach(triangle => {
        triangle.setAttribute('stroke-width', width);
    });

    // update backing stroke width
    [triangle1backing, triangle2backing, triangle3backing].forEach(triangle => {
        triangle.setAttribute('stroke-width', width + Number(backingSlider.value));
    });

    // need correcting value for crisp edges
    triangleWeaveBackingMask.setAttribute('stroke-width', width + Number(backingSlider.value) - (shouldCorrectWeave ? 1 : 0));

    // update chevron stroke width
    [chevron1, chevron2, chevron3].forEach(chevron => {
        chevron.setAttribute('stroke-width', chevronStroke);
    });

    // Update triangles and their chevrons
    const positions = [
        [centroid[0], centroid[1] + spacing],
        centroid,
        [centroid[0] - (spacing * (Math.sqrt(3) / 2)), centroid[1] + (spacing / 2)]
    ];

    [triangle1backing, triangle2backing, triangle3backing].forEach((tirangleBacking, i) => {
        const triangleData = createEquilateralTrianglePath(positions[i], size);
        tirangleBacking.setAttribute('d', triangleData.path);

        if (i === 1) {
            // only retain the necessary data so we don't cause mask errors elsewhere when triangles overlap at other points
            const choppedPathData =  triangleData.path.split('L')[0] + triangleData.path.split('L')[2].slice(0, -1)
            document.getElementById('triangleWeaveBackingMask').setAttribute('d', shouldWeave ? choppedPathData: '');
        }
    });

    [triangle1, triangle2, triangle3].forEach((triangle, i) => {
        const triangleData = createEquilateralTrianglePath(positions[i], size);
        triangle.setAttribute('d', triangleData.path);

        if (i === 1) {
            // only retain the necessary data so we don't cause mask errors elsewhere
            const choppedPathData =  triangleData.path.split('L')[0] + triangleData.path.split('L')[2].slice(0, -1)
            document.getElementById('triangleWeaveTopMask').setAttribute('d', shouldWeave ? choppedPathData : '');
        }

        // Create chevron on the selected leg of each triangle
        const chevron = document.getElementById(`chevron${i + 1}`);
        const vertices = triangleData.vertices;
        const selectedLeg = getSelectedChevronLeg(i);
        const position = getChevronPosition(i);
        const startVertex = vertices[selectedLeg];
        const endVertex = vertices[(selectedLeg + 1) % 3];
        const chevronPath = createChevronPath(startVertex, endVertex, width, position);
        chevron.setAttribute('d', chevronPath);

        // Create crossover on the selected leg of each triangle
        const crossover = document.getElementById(`crossover${i + 1}`);
        const crossoverVertices = triangleData.vertices;
        const selectedCrossoverLeg = getSelectedCrossoverLeg(i);
        const crossoverPosition = getCrossoverPosition(i);
        const startCrossVertex = crossoverVertices[selectedCrossoverLeg];
        const endCrossVertex = crossoverVertices[(selectedCrossoverLeg + 1) % 3];
        const crossoverPath = createCrossoverPath(startCrossVertex, endCrossVertex, width, crossoverPosition, crossoverDepth);
        crossover.setAttribute('d', crossoverPath);

        const crossoverOpposing = document.getElementById(`crossover${i + 1}opposing`);
        const opposingCrossoverPath = createOpposingCrossoverPath(startCrossVertex, endCrossVertex, width, crossoverPosition, crossoverDepth);
        crossoverOpposing.setAttribute('d', opposingCrossoverPath);
    });

    document.getElementById('canvas').style.transform = `rotate(${rotation}deg)`;

    //saveToURL();
}

// Set up listeners to update triangle
for (element of [strokeWidthSlider, backingSlider, triangleSizeSlider, spacingSlider, chevronStrokeSlider, chevronDepthSlider, crossoverDepthSlider, shouldWeaveCheckbox, shouldWeaveEdgeCorrectionCheckbox, offsetX, offsetY, rotationSlider, invertChevrons]){
    element.addEventListener('input', updateTriangles);
}

document.getElementById('downloadPNG').addEventListener('click', () => {saveToURL(); downloadSVGAsPNG('canvas', window.location.hash.slice(1)); history.replaceState(null, null, window.location.pathname + window.location.search)});
document.getElementById('downloadPNGShort').addEventListener('click', () => {saveToURL(); downloadSVGAsPNG('canvas', `design_${Date.now()}.png`); history.replaceState(null, null, window.location.pathname + window.location.search)});
document.getElementById('downloadSVG').addEventListener('click', () => {saveToURL(); downloadSVG('canvas', window.location.hash.slice(1)); history.replaceState(null, null, window.location.pathname + window.location.search)});
document.getElementById('downloadSVGShort').addEventListener('click', () => {saveToURL(); downloadSVG('canvas', `design_${Date.now()}.svg`); history.replaceState(null, null, window.location.pathname + window.location.search)});
document.getElementById('saveToURL').addEventListener('click', saveToURL);
document.getElementById('clearURL').addEventListener('click', () => {history.replaceState(null, null, window.location.pathname + window.location.search)});
document.getElementById('copyToClipboard').addEventListener('click', () => {saveToURL(); navigator.clipboard.writeText(window.location.hash.slice(1)); history.replaceState(null, null, window.location.pathname + window.location.search)});

document.getElementById('canvas').addEventListener('click', () => {document.getElementById('canvas').classList.toggle('canvas-regular-size'); document.getElementById('canvas').classList.toggle('canvas-full-screen');})

document.getElementById('reset-global').addEventListener('click', () => {document.getElementById('x-offset').value = 0; document.getElementById('y-offset').value = 0; updateTriangles();})
document.getElementById('correct-global').addEventListener('click', () => {document.getElementById('x-offset').value = 50; document.getElementById('y-offset').value = -70; updateTriangles();})

// group movement
document.querySelectorAll('.group-movement').forEach(button => {button.addEventListener('click', (e) => {
    const chevronPosition = document.getElementById("position1");
    const crossoverPosition = document.getElementById("crossoverPosition1");

    if (e.target.dataset.direction == 'negative') {
        chevronPosition.value = chevronPosition.value - Number(e.target.dataset.amount) / 100;
        crossoverPosition.value = crossoverPosition.value - Number(e.target.dataset.amount);
    } else {
        chevronPosition.value = Number(chevronPosition.value) + Number(e.target.dataset.amount) / 100;
        crossoverPosition.value = Number(crossoverPosition.value) + Number(e.target.dataset.amount);
    }

    const updateEvent = new Event("input", {
        bubbles: true,
      });

    chevronPosition.dispatchEvent(updateEvent);
    crossoverPosition.dispatchEvent(updateEvent);
})});

// Set up radio button controls
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', updateTriangles);
});

// Set up chevron sliders
for (let i = 1; i <= 3; i++) {
    const slider = document.getElementById(`position${i}`);
    const value = document.getElementById(`position${i}-value`);
    slider.addEventListener('input', function() {
        const newPosition = this.value;
        value.textContent = Number(newPosition).toFixed(2);

        // If sync is enabled, update all position sliders
        if (document.getElementById('sync-positions').checked) {
            for (let j = 1; j <= 3; j++) {
                if (j !== i) {  // Skip the current slider
                    const otherSlider = document.getElementById(`position${j}`);
                    const otherValue = document.getElementById(`position${j}-value`);
                    otherSlider.value = newPosition;
                    otherValue.textContent = Number(newPosition).toFixed(2);
                }
            }
        }

        updateTriangles();
    });
}

// set up crossover sliders
for (let i = 1; i <= 3; i++) {
    const slider = document.getElementById(`crossoverPosition${i}`);
    const value = document.getElementById(`crossoverPosition${i}-value`);
    slider.addEventListener('input', function() {
        const newPosition = this.value;
        value.textContent = Number(newPosition).toFixed(2);

        // If sync is enabled, update all position sliders
        if (document.getElementById('sync-crossover-positions').checked) {
            for (let j = 1; j <= 3; j++) {
                if (j !== i) {  // Skip the current slider
                    const otherSlider = document.getElementById(`crossoverPosition${j}`);
                    const otherValue = document.getElementById(`crossoverPosition${j}-value`);
                    otherSlider.value = newPosition;
                    otherValue.textContent = Number(newPosition).toFixed(2);
                }
            }
        }

        updateTriangles();
    });
}

function targetSliderForResult(changableDiv, outputDiv, target) {
    const roughRounds = 20;
    const fineTuneRounds = 50;
    let upperBound = Number(document.getElementById(changableDiv).max);
    let lowerBound = Number(document.getElementById(changableDiv).min);
    let output = document.getElementById(outputDiv);

    for (i = 0; i <= roughRounds; i++) {
        let midpoint = (upperBound + lowerBound) / 2;

        document.getElementById(changableDiv).value = midpoint;
        updateTriangles();
        if (Number(output.innerText) == target) {
            break;
        }

        if (Number(output.innerText) > target) {
            lowerBound = midpoint;
        } else {
            upperBound = midpoint;

        }
    }

    updateTriangles();
}
renderBookmarkedDesigns();
loadFromURL();
