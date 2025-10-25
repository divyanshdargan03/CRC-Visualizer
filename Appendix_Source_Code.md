# Appendix: Full Source Code for CRC Visualizer

This file contains the complete source files for the CRC Visualizer project. You can open each file directly under `d:\cnproject\` as well, but they're reproduced here for convenience.

---

## File: d:\cnproject\index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRC Visualizer</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/additional.css">
    <link rel="stylesheet" href="css/scroll.css">
</head>
<body>
    <div class="container">
        <div id="topSection">
            <div class="top-row">
                <h1>CRC Visualizer</h1>
                <div class="header-controls">
                    <div class="theme-toggle">
                        <input type="checkbox" id="themeToggle" aria-label="Toggle dark mode">
                        <label for="themeToggle" class="toggle-label" title="Toggle dark mode">
                            <span class="toggle-knob">
                                <!-- Sun icon (circle + rays group for rotation) -->
                                <svg class="icon sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                    <g class="sun-rays" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
                                        <path d="M12 2.5v2.5" />
                                        <path d="M12 19v2.5" />
                                        <path d="M4.5 5.5l1.8 1.8" />
                                        <path d="M17.7 16.7l1.8 1.8" />
                                        <path d="M2.5 12h2.5" />
                                        <path d="M19 12h2.5" />
                                        <path d="M4.5 18.5l1.8-1.8" />
                                        <path d="M17.7 7.3l1.8-1.8" />
                                    </g>
                                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                                </svg>
                                <!-- Moon icon (crescent) -->
                                <svg class="icon moon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                    <path fill="currentColor" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                                </svg>
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="project-meta">
                <div><strong>Project:</strong> CRC Visualizer — Computer Networks</div>
                <div><strong>Student:</strong> Divyansh Dargan (Reg: 24BCE5131)</div>
                <div><strong>Professor:</strong> Dr. Swaminathan A</div>
            </div>
        
        <div class="input-section">
            <div class="form-group">
                <label for="inputFormat">Input Format:</label>
                <select id="inputFormat">
                    <option value="binary">Binary</option>
                    <option value="decimal">Decimal</option>
                    <option value="hex">Hexadecimal</option>
                    <option value="ascii">ASCII</option>
                    <option value="text">Text</option>
                </select>
            </div>

            <div class="form-group">
                <label for="inputData">Input Data:</label>
                <input type="text" id="inputData" placeholder="Enter your data">
            </div>

            <div class="form-group">
                <label for="polynomialType">Generator Polynomial:</label>
                <select id="polynomialType">
                    <option value="custom">Custom</option>
                    <option value="crc8">CRC-8 (x⁸ + x² + x + 1)</option>
                    <option value="crc16">CRC-16 (x¹⁶ + x¹⁵ + x² + 1)</option>
                    <option value="crc32">CRC-32 (x³² + x²⁶ + x²³ + x²² + x¹⁶ + x¹² + x¹¹ + x¹⁰ + x⁸ + x⁷ + x⁵ + x⁴ + x² + x + 1)</option>
                </select>
            </div>

            <div id="customPolyDiv" class="form-group">
                <label for="customPoly">Custom Polynomial (binary):</label>
                <input type="text" id="customPoly" placeholder="e.g., 1011 for x³ + x + 1">
            </div>

            <div class="form-group">
                <label for="mode">Mode:</label>
                <select id="mode">
                    <option value="sender">Sender (Encode)</option>
                    <option value="receiver">Receiver (Verify)</option>
                </select>
            </div>

            <button id="calculate" class="primary-btn">Calculate CRC</button>
        </div>

        <div class="visualization-section">
            <h2>Binary Conversion</h2>
            <div id="binaryConversion" class="result-box"></div>

            <h2>CRC Calculation Steps</h2>
            <div id="crcSteps" class="result-box"></div>

            <h2>Final Result</h2>
            <div id="finalResult" class="result-box"></div>
        </div>

        <div class="error-simulation-section">
            <h2>Error Simulation</h2>
            <div class="form-group">
                <label for="errorType">Error Type:</label>
                <select id="errorType">
                    <option value="single">Single-bit Error</option>
                    <option value="double">Double-bit Error</option>
                    <option value="burst">Burst Error</option>
                </select>
            </div>
            <div class="form-group">
                <label for="bitPosition">Bit Position(s):</label>
                <input type="text" id="bitPosition" placeholder="e.g., 3 or 1,4 for multiple positions">
            </div>
            <button id="simulateError" class="secondary-btn">Simulate Error</button>
            <div id="errorResult" class="result-box"></div>
        </div>

        <div id="polynomialVisual" class="polynomial-section">
            <h2>Polynomial Visualization</h2>
            <div class="result-box">
                <div id="polyMath"></div>
                <div id="polyBinary"></div>
            </div>
        </div>
    </div>
    <script src="js/crc.js"></script>
</body>
</html>
```

---

## File: d:\cnproject\js\crc.js

```javascript
// CRC Calculator Class
class CRCCalculator {
    constructor() {
        this.commonPolynomials = {
            'crc8': '100000111',  // x⁸ + x² + x + 1
            'crc16': '11000000000000101', // x¹⁶ + x¹⁵ + x² + 1
            'crc32': '100000100110000010001110110110111' // Standard CRC-32 polynomial
        };
    }

    // Convert various input formats to binary
    convertToBinary(input, format) {
        switch(format) {
            case 'binary':
                if (!/^[01]+$/.test(input)) throw new Error('Invalid binary input');
                return input;
            case 'decimal':
                return parseInt(input).toString(2);
            case 'hex':
                return parseInt(input, 16).toString(2);
            case 'ascii':
            case 'text':
                return input.split('').map(char => 
                    char.charCodeAt(0).toString(2).padStart(8, '0')
                ).join('');
            default:
                throw new Error('Unsupported input format');
        }
    }

    // Perform binary division and return steps
    binaryDivision(dividend, divisor) {
        let steps = [];
        let workingData = dividend;
        let quotient = '';
        
        // Record initial state
        steps.push({
            step: 'Initial data',
            dividend: workingData,
            divisor: divisor,
            operation: 'Start'
        });

        while (workingData.length >= divisor.length) {
            if (workingData[0] === '1') {
                quotient += '1';
                let xorResult = this.xorStrings(workingData.slice(0, divisor.length), divisor);
                workingData = xorResult + workingData.slice(divisor.length);
                
                steps.push({
                    step: 'XOR operation',
                    dividend: workingData,
                    divisor: divisor,
                    operation: 'XOR'
                });
            } else {
                quotient += '0';
                workingData = workingData.slice(1);
                
                steps.push({
                    step: 'Shift',
                    dividend: workingData,
                    divisor: divisor,
                    operation: 'Shift'
                });
            }
        }

        return {
            remainder: workingData,
            quotient: quotient,
            steps: steps
        };
    }

    // XOR two binary strings of equal length
    xorStrings(a, b) {
        let result = '';
        for (let i = 0; i < a.length; i++) {
            result += a[i] === b[i] ? '0' : '1';
        }
        return result;
    }

    // Calculate CRC
    calculateCRC(input, polynomial) {
        const degree = polynomial.length - 1;
        const paddedInput = input + '0'.repeat(degree);
        const result = this.binaryDivision(paddedInput, polynomial);
        return result;
    }

    // Verify CRC
    verifyCRC(message, polynomial) {
        const result = this.binaryDivision(message, polynomial);
        return result.remainder === '0'.repeat(result.remainder.length);
    }

    // Simulate errors
    simulateError(data, positions) {
        let modifiedData = data.split('');
        positions.forEach(pos => {
            if (pos >= 0 && pos < data.length) {
                modifiedData[pos] = modifiedData[pos] === '0' ? '1' : '0';
            }
        });
        return modifiedData.join('');
    }

    // Convert polynomial to mathematical notation
    polynomialToMath(binary) {
        let terms = [];
        for (let i = 0; i < binary.length; i++) {
            if (binary[i] === '1') {
                const power = binary.length - 1 - i;
                if (power === 0) terms.push('1');
                else if (power === 1) terms.push('x');
                else terms.push(`x<sup>${power}</sup>`);
            }
        }
        return terms.join(' + ');
    }
}

// UI Handler
// Function to smoothly scroll to an element
function smoothScrollTo(element, offset = 0) {
    if (!element) return;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// NOTE: verifyInReceiverMode is defined inside DOMContentLoaded so it has access to UI variables

document.addEventListener('DOMContentLoaded', function() {
    const calculator = new CRCCalculator();
    
    // Elements
    const inputFormat = document.getElementById('inputFormat');
    const inputData = document.getElementById('inputData');
    const polynomialType = document.getElementById('polynomialType');
    const customPoly = document.getElementById('customPoly');
    const mode = document.getElementById('mode');
    const calculateBtn = document.getElementById('calculate');
    const simulateErrorBtn = document.getElementById('simulateError');
    const errorType = document.getElementById('errorType');
    const bitPosition = document.getElementById('bitPosition');

    // Results display elements
    const binaryConversion = document.getElementById('binaryConversion');
    const crcSteps = document.getElementById('crcSteps');
    const finalResult = document.getElementById('finalResult');
    const errorResult = document.getElementById('errorResult');
    const polyMath = document.getElementById('polyMath');
    const polyBinary = document.getElementById('polyBinary');

    // Helper to toggle sections smoothly (uses CSS classes)
    function toggleSection(el, show) {
        if (!el) return;
        el.classList.add('smooth-toggle');
        if (show) {
            el.classList.remove('smooth-hidden');
            el.classList.add('smooth-shown');
        } else {
            el.classList.add('smooth-hidden');
            el.classList.remove('smooth-shown');
        }
    }

    // Update UI based on mode
    function updateUI() {
        const isReceiver = mode.value === 'receiver';
        const isCustomPoly = polynomialType.value === 'custom';

        const customDiv = document.getElementById('customPolyDiv');
        const binaryConvWrapper = binaryConversion ? binaryConversion.parentElement : null;
        const errorSection = document.querySelector('.error-simulation-section');

        if (isReceiver) {
            // In receiver mode, lock the polynomial selection and show binary-only input
            polynomialType.disabled = true;
            toggleSection(customDiv, false);
            inputFormat.value = 'binary';
            inputFormat.disabled = true;
            inputData.placeholder = 'Enter the received binary message';

            // Hide binary conversion in receiver mode
            toggleSection(binaryConvWrapper, false);

            // Try to use the same polynomial that was used for encoding
            const lastUsedPoly = localStorage.getItem('lastUsedPolynomial');
            if (lastUsedPoly) {
                polynomialType.value = lastUsedPoly;
            }

            // Update labels to show we're using the same polynomial
            const polyLabel = document.querySelector('label[for="polynomialType"]');
            polyLabel.textContent = 'Generator Polynomial (same as sender):';
        } else {
            // In sender mode, enable all options
            polynomialType.disabled = false;
            inputFormat.disabled = false;
            toggleSection(customDiv, isCustomPoly);
            inputData.placeholder = 'Enter your data';

            // Show binary conversion in sender mode
            toggleSection(binaryConvWrapper, true);

            // Reset label
            const polyLabel = document.querySelector('label[for="polynomialType"]');
            polyLabel.textContent = 'Generator Polynomial:';
        }

        // Update other UI elements (error simulation section)
        toggleSection(errorSection, !isReceiver);
    }

    // Add event listeners
    polynomialType.addEventListener('change', updateUI);
    mode.addEventListener('change', updateUI);

    // Initial UI setup
    updateUI();

    // Expose verify function globally so inline onclick from error simulation can call it
    window.verifyInReceiverMode = function(message) {
        try {
            // Smooth scroll to top of page
            if (window.scrollTo) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                document.documentElement.scrollTop = 0;
            }

            // After short delay (give the scroll time to run), switch UI to receiver mode and populate input
            setTimeout(() => {
                mode.value = 'receiver';
                updateUI();

                // Ensure we use last stored polynomial if available
                const lastPoly = localStorage.getItem('lastPolynomialValue');
                if (lastPoly) {
                    polyMath.innerHTML = calculator.polynomialToMath(lastPoly);
                    polyBinary.innerHTML = `Binary: ${lastPoly}`;
                    toggleSection(document.getElementById('polynomialVisual'), true);
                }

                // Put message into input and focus
                inputData.value = message;
                inputData.focus();

                // Small delay then trigger calculate to verify
                setTimeout(() => {
                    calculateBtn.classList.add('button-highlight');
                    inputData.classList.add('input-highlight');
                    calculateBtn.click();
                    setTimeout(() => {
                        calculateBtn.classList.remove('button-highlight');
                        inputData.classList.remove('input-highlight');
                    }, 900);
                }, 300);
            }, 600);
        } catch (e) {
            console.error('verifyInReceiverMode error:', e);
        }
    };

    // Theme toggle (sun / moon sliding switch)
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Decide initial theme: saved preference -> OS preference -> default (light)
        const saved = localStorage.getItem('crc_dark_mode');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialDark = saved === '1' ? true : (saved === '0' ? false : prefersDark);
        if (initialDark) document.documentElement.classList.add('dark');
        themeToggle.checked = initialDark;

        themeToggle.addEventListener('change', (e) => {
            const on = e.target.checked;
            document.documentElement.classList.toggle('dark', on);
            localStorage.setItem('crc_dark_mode', on ? '1' : '0');
        });
    }

    // Calculate CRC
    calculateBtn.addEventListener('click', function() {
        try {
            // Get input data and convert to binary
            const rawInput = inputData.value;
            const binaryInput = calculator.convertToBinary(rawInput, inputFormat.value);
            binaryConversion.innerHTML = `Original: ${rawInput}<br>Binary: ${binaryInput}`;

            // Get polynomial
            let polynomial = '';
            if (polynomialType.value === 'custom') {
                polynomial = customPoly.value;
                if (!/^[01]+$/.test(polynomial)) throw new Error('Invalid polynomial');
            } else {
                polynomial = calculator.commonPolynomials[polynomialType.value];
            }

            // Display polynomial visualization
            polyMath.innerHTML = calculator.polynomialToMath(polynomial);
            polyBinary.innerHTML = `Binary: ${polynomial}`;

            if (mode.value === 'sender') {
                // Calculate CRC
                const result = calculator.calculateCRC(binaryInput, polynomial);
                
                // Display steps
                crcSteps.innerHTML = result.steps.map(step => `
                    <div class="step">
                        <strong>${step.step}</strong><br>
                        Data: ${step.dividend}<br>
                        ${step.operation === 'XOR' ? `XOR with: ${step.divisor}` : ''}
                    </div>
                `).join('');

                const encodedMessage = binaryInput + result.remainder;
                
                // Display final result with copy button
                finalResult.innerHTML = `
                    <div class="success">
                        <div class="result-group">
                            <span>Original Data: ${binaryInput}</span>
                        </div>
                        <div class="result-group">
                            <span>CRC: ${result.remainder}</span>
                        </div>
                        <div class="result-group">
                            <span>Encoded Message: </span>
                            <span class="encoded-message">${encodedMessage}</span>
                            <button class="copy-btn" onclick="navigator.clipboard.writeText('${encodedMessage}')">Copy</button>
                        </div>
                        <small class="note">Save this encoded message for verification</small>
                    </div>
                `;

                // Scroll to show the results
                setTimeout(() => {
                    const resultSection = document.querySelector('.visualization-section');
                    if (resultSection) {
                        smoothScrollTo(resultSection, window.innerHeight / 3);
                    }
                }, 100);

                // Store the polynomial used for encoding
                localStorage.setItem('lastUsedPolynomial', polynomialType.value);
                localStorage.setItem('lastPolynomialValue', polynomial);
            } else {
                // Verify CRC
                // First, show which polynomial we're using for verification
                const result = calculator.binaryDivision(binaryInput, polynomial);
                
                // Display polynomial being used
                polyMath.innerHTML = calculator.polynomialToMath(polynomial);
                polyBinary.innerHTML = `Binary: ${polynomial}`;
                toggleSection(document.getElementById('polynomialVisual'), true);
                
                // Show division steps
                crcSteps.innerHTML = `
                    <div class="verification-info">
                        <strong>Verification Process:</strong><br>
                        Using polynomial: ${calculator.polynomialToMath(polynomial)}<br>
                    </div>
                ` + result.steps.map(step => `
                    <div class="step">
                        <strong>${step.step}</strong><br>
                        Data: ${step.dividend}<br>
                        ${step.operation === 'XOR' ? `XOR with: ${step.divisor}` : ''}
                    </div>
                `).join('');

                // Check if remainder is zero
                const isValid = result.remainder === '0'.repeat(result.remainder.length);

                finalResult.innerHTML = `
                    <div class="${isValid ? 'success' : 'error'}">
                        <strong>Verification Result:</strong><br>
                        Final Remainder: ${result.remainder}<br>
                        Status: ${isValid ? 'VALID MESSAGE ✓' : 'INVALID MESSAGE ✗'}<br>
                        ${isValid ? 
                            '<small class="note">All zeros in remainder confirms data integrity</small>' : 
                            '<small class="note">Non-zero remainder indicates data corruption</small>'}
                    </div>
                `;

                // Show these sections in receiver mode for better understanding
                toggleSection(document.querySelector('.visualization-section'), true);
            }
        } catch (error) {
            finalResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    });

    // Simulate errors
    simulateErrorBtn.addEventListener('click', function() {
        try {
            // Get the encoded message from the success div
            const encodedMessageElement = document.querySelector('.encoded-message');
            if (!encodedMessageElement) {
                throw new Error('Please calculate CRC first');
            }
            const originalMessage = encodedMessageElement.textContent;

            // Validate bit positions based on message length
            const messageLength = originalMessage.length;
            
            let positions;
            if (errorType.value === 'single') {
                const pos = parseInt(bitPosition.value);
                if (isNaN(pos) || pos < 0 || pos >= messageLength) {
                    throw new Error(`Bit position must be between 0 and ${messageLength - 1}`);
                }
                positions = [pos];
            } else if (errorType.value === 'double') {
                positions = bitPosition.value.split(',').map(p => parseInt(p.trim()));
                if (positions.length !== 2 || positions.some(p => isNaN(p) || p < 0 || p >= messageLength)) {
                    throw new Error(`Enter two valid positions between 0 and ${messageLength - 1}, separated by comma`);
                }
            } else { // burst error
                const start = parseInt(bitPosition.value);
                if (isNaN(start) || start < 0 || start + 3 >= messageLength) {
                    throw new Error(`Starting position must be between 0 and ${messageLength - 4}`);
                }
                positions = Array.from({length: 4}, (_, i) => start + i);
            }

            // Simulate the error
            const corruptedMessage = calculator.simulateError(originalMessage, positions);
            
            // Get the polynomial
            const polynomial = polynomialType.value === 'custom' 
                ? customPoly.value 
                : calculator.commonPolynomials[polynomialType.value];

            // Verify the corrupted message
            const result = calculator.binaryDivision(corruptedMessage, polynomial);
            const isValid = result.remainder === '0'.repeat(result.remainder.length);

            // Show the error simulation results with highlighting
            let highlightedOriginal = '';
            let highlightedCorrupted = '';
            
            for (let i = 0; i < originalMessage.length; i++) {
                if (positions.includes(i)) {
                    highlightedOriginal += `<span class="bit">${originalMessage[i]}</span>`;
                    highlightedCorrupted += `<span class="bit-changed">${corruptedMessage[i]}</span>`;
                } else {
                    highlightedOriginal += originalMessage[i];
                    highlightedCorrupted += corruptedMessage[i];
                }
            }

            errorResult.innerHTML = `
                <div class="error-simulation">
                    <div class="message-comparison">
                        <div class="message-row">
                            <strong>Original:</strong> 
                            <div class="binary-display">${highlightedOriginal}</div>
                        </div>
                        <div class="message-row">
                            <strong>Corrupted:</strong> 
                            <div class="binary-display">${highlightedCorrupted}</div>
                        </div>
                    </div>
                    <div class="verification-result ${isValid ? 'error' : 'success'}">
                        <strong>Verification Result:</strong><br>
                        Remainder: ${result.remainder}<br>
                        Status: ${isValid ? 'Error NOT Detected ⚠️' : 'Error Detected ✓'}<br>
                        <small class="note">
                            ${isValid ? 
                                'The CRC failed to detect this error pattern' : 
                                'The CRC successfully detected the error'}
                        </small>
                    </div>
                    <button class="verify-btn" onclick="verifyInReceiverMode('${corruptedMessage}')">
                        Verify in Receiver Mode
                    </button>
                </div>
            `;
        } catch (error) {
            errorResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    });
});
```

---

## File: d:\cnproject\css\styles.css

```css
:root {
    --primary-color: #1a237e;
    --secondary-color: #304ffe;
    --accent-color: #7c4dff;
    --background-color: #f5f6fa;
    --success-color: #00c853;
    --error-color: #ff1744;
    --box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    --card-shadow: 0 8px 16px rgba(0,0,0,0.1);
    --border-radius: 12px;
    --spacing: 24px;
    --transition: all 0.3s ease;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    background-color: var(--background-color);
    line-height: 1.6;
    padding: var(--spacing);
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f6fa 0%, #dcdde1 100%);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing);
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
}

.top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}

.header-controls {
    display: flex;
    gap: 10px;
    align-items: center;
}

.project-meta {
    margin-top: 10px;
    color: var(--meta-color);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
}

:root {
    --meta-color: #111;
}

html.dark {
    --meta-color: #fff;
}

.secondary-btn.small {
    padding: 8px 10px;
    font-size: 13px;
}

/* Theme toggle switch */
.theme-toggle {
    display: inline-flex;
    align-items: center;
}
.theme-toggle input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}
.toggle-label {
    display: inline-block;
    width: 56px;
    height: 32px;
    background: linear-gradient(135deg,#e6e9ef,#f8f9fc);
    border-radius: 999px;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    cursor: pointer;
    position: relative;
    transition: background 0.25s ease, box-shadow 0.25s ease;
}
.toggle-label .toggle-knob {
    display: block;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    position: absolute;
    left: 4px;
    top: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.28s cubic-bezier(.2,.9,.2,1), background 0.25s ease;
}
.toggle-label .icon { opacity: 0.9; color: #f1c40f; }
.toggle-label .moon { opacity: 0; color: #fff; }

@keyframes rotateSunRaysOnce {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes rotateSunRaysContinuous {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.theme-toggle input:not(:checked) + .toggle-label .sun-rays {
    animation: 
        rotateSunRaysOnce 0.9s ease-in-out,
        rotateSunRaysContinuous 6s linear infinite;
    transform-origin: center;
    animation-play-state: running;
}

.theme-toggle input:checked + .toggle-label {
    background: linear-gradient(135deg,#304ffe,#7c4dff);
}
.theme-toggle input:checked + .toggle-label .toggle-knob {
    transform: translateX(24px);
    background: linear-gradient(135deg,#0f1724,#263046);
}

/* Ensure the switch looks good in dark theme baseline */
html.dark .toggle-label {
    background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.04));
}

h1 {
    color: var(--primary-color);
    text-align: center;
    margin-bottom: var(--spacing);
    padding-bottom: var(--spacing);
    border-bottom: 2px solid var(--background-color);
    font-size: 2.5em;
    font-weight: 700;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

h2 {
    color: var(--primary-color);
    margin: var(--spacing) 0 15px 0;
    font-size: 1.4em;
    font-weight: 600;
    position: relative;
    padding-left: 15px;
}

h2::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background: var(--accent-color);
    border-radius: 2px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    color: var(--primary-color);
    font-weight: 600;
}

input[type="text"],
select {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #e0e0e0;
    border-radius: var(--border-radius);
    font-size: 16px;
    transition: var(--transition);
    background: rgba(255, 255, 255, 0.9);
}

input[type="text"]:focus,
select:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.2);
    background: white;
}

.primary-btn,
.secondary-btn {
    display: block;
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: var(--border-radius);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
}

.primary-btn {
    background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
    color: white;
    margin: 20px 0;
    box-shadow: 0 4px 15px rgba(48, 79, 254, 0.2);
}

.secondary-btn {
    background: linear-gradient(135deg, #6c757d, #495057);
    color: white;
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.2);
}

.primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(48, 79, 254, 0.3);
}

.secondary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(108, 117, 125, 0.3);
}

.primary-btn:active,
.secondary-btn:active {
    transform: translateY(1px);
}

.result-box {
    background: linear-gradient(135deg, #ffffff, #f8f9fa);
    border: 1px solid #e0e0e0;
    border-radius: var(--border-radius);
    padding: 20px;
    margin-bottom: 20px;
    min-height: 50px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    transition: var(--transition);
}

.result-box:hover {
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transform: translateY(-2px);
}

.visualization-section,
.error-simulation-section,
.polynomial-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid var(--background-color);
}

/* Step-by-step visualization styles */
.step {
    padding: 10px;
    margin: 5px 0;
    background-color: white;
    border-left: 4px solid var(--secondary-color);
}

.step:nth-child(even) {
    background-color: #f8f9fa;
}

.highlight {
    background-color: #fff3cd;
    padding: 2px 4px;
    border-radius: 3px;
}

.error {
    color: #dc3545;
    font-weight: bold;
}

.success {
    color: #28a745;
    font-weight: bold;
}

/* Polynomial visualization */
#polyMath {
    font-family: 'Times New Roman', Times, serif;
    font-size: 1.2em;
    margin-bottom: 10px;
}

#polyBinary {
    font-family: monospace;
    font-size: 1.1em;
}

/* Responsive design */
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    input[type="text"],
    select {
        font-size: 14px;
    }
    
    .form-group {
        margin-bottom: 10px;
    }
}

/* Dark mode styles */
html.dark {
    --background-color: #0f1724;
    --primary-color: #e6eef8;
    --secondary-color: #7c9eff;
    --accent-color: #9a7cff;
    --card-shadow: 0 8px 20px rgba(0,0,0,0.6);
}

html.dark body {
    background: linear-gradient(135deg, #071028 0%, #0b1220 100%);
}

html.dark .container {
    background: rgba(8,12,20,0.85);
}

html.dark label, html.dark h2 {
    color: var(--primary-color);
}

html.dark .result-box {
    background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.03));
    border-color: rgba(255,255,255,0.05);
}

html.dark input[type="text"],
html.dark select {
    background: rgba(255,255,255,0.03);
    color: var(--primary-color);
    border-color: rgba(255,255,255,0.06);
}

html.dark .primary-btn {
    box-shadow: 0 6px 20px rgba(124, 77, 255, 0.18);
}

html.dark .step {
    background: rgba(255,255,255,0.02);
    border-left-color: var(--secondary-color);
}
```

---

## File: d:\cnproject\css\additional.css

```css
.note {
    color: #666;
    font-style: italic;
    display: block;
    margin-top: 8px;
}

.verification-info {
    background: rgba(52, 152, 219, 0.1);
    border-left: 4px solid var(--secondary-color);
    padding: 15px;
    margin-bottom: 15px;
    border-radius: var(--border-radius);
}

.step {
    background: white;
    border-left: 4px solid var(--accent-color);
    padding: 15px;
    margin: 10px 0;
    border-radius: var(--border-radius);
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    transition: var(--transition);
}

.step:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.result-group {
    margin: 10px 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.encoded-message {
    font-family: monospace;
    background: #f8f9fa;
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid #dee2e6;
}

.copy-btn {
    background: var(--secondary-color);
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: var(--transition);
}

.copy-btn:hover {
    background: var(--accent-color);
    transform: translateY(-1px);
}

/* Error Simulation Styles */
.error-simulation {
    background: white;
    border-radius: var(--border-radius);
    padding: 20px;
    margin-top: 15px;
}

.message-comparison {
    background: #f8f9fa;
    padding: 15px;
    border-radius: var(--border-radius);
    margin-bottom: 15px;
}

.message-row {
    margin: 10px 0;
    display: flex;
    align-items: center;
    gap: 15px;
}

.binary-display {
    font-family: monospace;
    font-size: 1.1em;
    letter-spacing: 1px;
    background: white;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #dee2e6;
    flex-grow: 1;
}

.bit {
    background: #e3f2fd;
    padding: 2px 4px;
    border-radius: 3px;
    color: var(--primary-color);
}

.bit-changed {
    background: #ffebee;
    padding: 2px 4px;
    border-radius: 3px;
    color: var(--error-color);
    font-weight: bold;
}

.verify-btn {
    display: block;
    width: 100%;
    margin-top: 15px;
    padding: 10px;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
}

.verify-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(124, 77, 255, 0.3);
}

.verification-result {
    margin-top: 15px;
    padding: 15px;
    border-radius: var(--border-radius);
}

.verification-result.success {
    background: #e8f5e9;
    border-left: 4px solid var(--success-color);
}

.verification-result.error {
    background: #ffebee;
    border-left: 4px solid var(--error-color);
}

/* Disabled state styling for inputs */
input:disabled,
select:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.8;
    border-color: #dee2e6;
}

/* Smooth hide/show to avoid layout jerks */
.smooth-toggle {
    transition: max-height 0.45s cubic-bezier(.2,.9,.2,1),
                opacity 0.35s ease, transform 0.35s ease;
    overflow: hidden;
}

.smooth-hidden {
    max-height: 0 !important;
    opacity: 0 !important;
    transform: translateY(-4px);
    pointer-events: none;
    visibility: hidden;
}

.smooth-shown {
    max-height: 2000px; /* large enough to contain content */
    opacity: 1;
    transform: none;
    visibility: visible;
}

/* Small utility to reduce abrupt layout jumps for sections */
.section-card {
    transition: box-shadow 0.25s ease, transform 0.25s ease;
    will-change: transform;
}

/* Scroll behavior for html and body */
html, body {
    scroll-behavior: smooth;
    scroll-padding-top: 20px;
    overflow-x: hidden;
}

body {
    min-height: 100vh;
}

/* Button highlight animation */
@keyframes buttonHighlight {
    0% {
        transform: scale(1);
        box-shadow: 0 4px 15px rgba(48, 79, 254, 0.2);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(48, 79, 254, 0.4);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 4px 15px rgba(48, 79, 254, 0.2);
    }
}

.button-highlight {
    animation: buttonHighlight 1s ease;
}

/* Input highlight animation */
@keyframes inputHighlight {
    0% {
        border-color: var(--secondary-color);
        box-shadow: 0 0 0 2px rgba(48, 79, 254, 0.1);
    }
    50% {
        border-color: var(--accent-color);
        box-shadow: 0 0 0 4px rgba(48, 79, 254, 0.2);
    }
    100% {
        border-color: var(--secondary-color);
        box-shadow: 0 0 0 2px rgba(48, 79, 254, 0.1);
    }
}

.input-highlight {
    animation: inputHighlight 1s ease;
}
```

---

## File: d:\cnproject\css\scroll.css

```css
/* Reset scroll behavior */
html, body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    scroll-behavior: smooth;
}

body {
    overflow-y: auto;
    overflow-x: hidden;
}

.container {
    position: relative;
    width: 100%;
}

#topSection {
    position: relative;
    width: 100%;
    scroll-margin-top: 0;
}

.visualization-section {
    scroll-margin-top: 100px;
    position: relative;
    width: 100%;
}

/* Animation keyframes */
@keyframes buttonHighlight {
    0% {
        transform: scale(1);
        box-shadow: 0 4px 15px rgba(48, 79, 254, 0.2);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(48, 79, 254, 0.4);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 4px 15px rgba(48, 79, 254, 0.2);
    }
}

@keyframes inputHighlight {
    0% {
        border-color: var(--secondary-color);
        box-shadow: 0 0 0 2px rgba(48, 79, 254, 0.1);
    }
    50% {
        border-color: var(--accent-color);
        box-shadow: 0 0 0 4px rgba(48, 79, 254, 0.2);
    }
    100% {
        border-color: var(--secondary-color);
        box-shadow: 0 0 0 2px rgba(48, 79, 254, 0.1);
    }
}

.button-highlight {
    animation: buttonHighlight 1s ease;
}

.input-highlight {
    animation: inputHighlight 1s ease;
}

/* Other styles remain the same */
.result-group {
    margin: 10px 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.encoded-message {
    font-family: monospace;
    background: #f8f9fa;
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid #dee2e6;
}

.copy-btn {
    background: var(--secondary-color);
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: var(--transition);
}

.copy-btn:hover {
    background: var(--accent-color);
    transform: translateY(-1px);
}

/* Error Simulation Styles */
.error-simulation {
    background: white;
    border-radius: var(--border-radius);
    padding: 20px;
    margin-top: 15px;
}

.message-comparison {
    background: #f8f9fa;
    padding: 15px;
    border-radius: var(--border-radius);
    margin-bottom: 15px;
}

.message-row {
    margin: 10px 0;
    display: flex;
    align-items: center;
    gap: 15px;
}

.binary-display {
    font-family: monospace;
    font-size: 1.1em;
    letter-spacing: 1px;
    background: white;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #dee2e6;
    flex-grow: 1;
}

.bit {
    background: #e3f2fd;
    padding: 2px 4px;
    border-radius: 3px;
    color: var(--primary-color);
}

.bit-changed {
    background: #ffebee;
    padding: 2px 4px;
    border-radius: 3px;
    color: var(--error-color);
    font-weight: bold;
}

.verify-btn {
    display: block;
    width: 100%;
    margin-top: 15px;
    padding: 10px;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
}

.verify-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(124, 77, 255, 0.3);
}

.verification-result {
    margin-top: 15px;
    padding: 15px;
    border-radius: var(--border-radius);
}

.verification-result.success {
    background: #e8f5e9;
    border-left: 4px solid var(--success-color);
}

.verification-result.error {
    background: #ffebee;
    border-left: 4px solid var(--error-color);
}

/* Disabled state styling for inputs */
input:disabled,
select:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.8;
    border-color: #dee2e6;
}
```

---

End of Appendix.
