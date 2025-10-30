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
        // We'll perform a long-division style bitwise division and capture
        // snapshots aligned to positions so the UI can render a visual division.
        const steps = [];
        const working = dividend.split(''); // array of '0'/'1'
        const n = working.length;
        const m = divisor.length;
        let quotient = '';

        // Record initial padded dividend
        steps.push({
            type: 'start',
            index: 0,
            windowBefore: working.join(''),
            divisor: divisor,
            xorResult: null,
            workingSnapshot: working.join('')
        });

        // Perform division: iterate over each possible alignment
        for (let i = 0; i <= n - m; i++) {
            const window = working.slice(i, i + m).join('');
            if (window[0] === '1') {
                // XOR with divisor
                const xorResult = this.xorStrings(window, divisor);
                // Apply xor result into working array
                for (let j = 0; j < m; j++) {
                    working[i + j] = xorResult[j];
                }
                quotient += '1';

                steps.push({
                    type: 'xor',
                    index: i,
                    windowBefore: window,
                    divisor: divisor,
                    xorResult: xorResult,
                    workingSnapshot: working.join('')
                });
            } else {
                // No XOR — this is effectively a shift step
                quotient += '0';
                steps.push({
                    type: 'shift',
                    index: i,
                    windowBefore: window,
                    divisor: divisor,
                    xorResult: null,
                    workingSnapshot: working.join('')
                });
            }
        }

        // Remainder is the last m-1 bits of working
        const remainder = working.slice(n - (m - 1)).join('') || '';

        return {
            remainder: remainder,
            quotient: quotient,
            steps: steps,
            padded: dividend
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
    let receiverPolyInitialized = false;
    
    // Shared helpers for rendering the long-division in both Sender and Receiver modes
    function escapeHtml(str) {
        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Render a colorized, preformatted long division using spans for styling
    // res: result from calculator.binaryDivision
    // encodedMsg: optional encoded message (sender mode); pass null/undefined in receiver
    // polynomialStr: the binary string of the generator polynomial
    function renderLongDivision(res, encodedMsg, polynomialStr) {
        const padded = res.padded || '';
        const divisorStr = polynomialStr;
        const m = divisorStr.length;
        const leftPad = 8; // spaces before the initial divisor

        const calcWidth = Math.max(leftPad + divisorStr.length + 3 + padded.length, 48);
        const rule = '─'.repeat(calcWidth);

        // helper to wrap a text segment in a span with class
        const wrap = (cls, txt) => `<span class="${cls}">${escapeHtml(txt)}</span>`;

        const htmlLines = [];
        htmlLines.push(wrap('ld-header', 'CRC Division Process'));
        htmlLines.push(wrap('ld-rule-text', rule));
        htmlLines.push(`${wrap('ld-label','Dividend :')} ${wrap('ld-value', padded)}`);
        htmlLines.push(`${wrap('ld-label','Divisor  :')} ${wrap('ld-divisor', divisorStr)}`);
        htmlLines.push(wrap('ld-rule-text', rule));

        // Division layout line: [spaces][divisor] ) [dividend]
        const initialLine = ' '.repeat(leftPad)
            + wrap('ld-divisor', divisorStr)
            + ' ) '
            + wrap('ld-dividend', padded);
        htmlLines.push(initialLine);

        const startCol = leftPad + divisorStr.length + 3; // column where dividend starts

        // Only XOR steps are shown
        const xorSteps = res.steps.filter(s => s.type === 'xor');
        xorSteps.forEach((step, idx) => {
            const indent = ' '.repeat(startCol + step.index);
            // show the current window being operated on (before XOR)
            htmlLines.push(indent + wrap('ld-window', step.windowBefore));
            // divisor under current window
            htmlLines.push(indent + wrap('ld-divisor', step.divisor));
            // underline under divisor bits
            htmlLines.push(indent + wrap('ld-underline', '─'.repeat(m)));
            // xor result one column to the right
            let xorContent = wrap('ld-xor', step.xorResult);
            htmlLines.push(' '.repeat(startCol + step.index + 1) + xorContent);
        });

        // Add a dedicated remainder line aligned to the right under the dividend
        if (res.remainder && res.remainder.length > 0) {
            const rlen = res.remainder.length; // typically m-1
            const indentR = startCol + (padded.length - rlen);
            const remLine = ' '.repeat(Math.max(indentR, 0))
                + wrap('ld-remainder', res.remainder)
                + '   ' + wrap('ld-remainder-label', '← remainder');
            htmlLines.push(remLine);
        }

        htmlLines.push(wrap('ld-rule-text', rule));
        htmlLines.push(`${wrap('ld-label','Remainder :')} ${wrap('ld-remainder', res.remainder || '')}`);
        if (encodedMsg) {
            htmlLines.push(`${wrap('ld-label','CRC Code  :')} ${wrap('ld-value', encodedMsg)}`);
        }
        htmlLines.push(wrap('ld-rule-text', rule));

        return `<div class="long-division"><pre>${htmlLines.join('\n')}</pre></div>`;
    }
    
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
        const customDiv = document.getElementById('customPolyDiv');
        const binaryConvWrapper = binaryConversion ? binaryConversion.parentElement : null;
        const errorSection = document.querySelector('.error-simulation-section');

        if (isReceiver) {
            // Receiver mode: force binary input, but allow changing polynomial (default from sender)
            inputFormat.value = 'binary';
            inputFormat.disabled = true;
            inputData.placeholder = 'Enter the received binary message';

            // Hide binary conversion in receiver mode
            toggleSection(binaryConvWrapper, false);

            // Default polynomial from sender only once when entering receiver
            if (!receiverPolyInitialized) {
                const lastUsedPoly = localStorage.getItem('lastUsedPolynomial');
                if (lastUsedPoly) {
                    polynomialType.value = lastUsedPoly;
                }
                const lastPolyValue = localStorage.getItem('lastPolynomialValue');
                if (polynomialType.value === 'custom' && lastPolyValue) {
                    if (!customPoly.value) customPoly.value = lastPolyValue;
                }
                receiverPolyInitialized = true;
            }
            polynomialType.disabled = false;

            // Show/hide custom input based on current selection
            toggleSection(customDiv, polynomialType.value === 'custom');

            // Update label to reflect default-from-sender but editable
            const polyLabel = document.querySelector('label[for="polynomialType"]');
            polyLabel.textContent = 'Generator Polynomial (defaulted from sender):';
        } else {
            // Sender mode: enable all
            polynomialType.disabled = false;
            inputFormat.disabled = false;
            toggleSection(customDiv, polynomialType.value === 'custom');
            inputData.placeholder = 'Enter your data';

            // Show binary conversion in sender mode
            toggleSection(binaryConvWrapper, true);

            // Reset label
            const polyLabel = document.querySelector('label[for="polynomialType"]');
            polyLabel.textContent = 'Generator Polynomial:';

            // Leaving receiver mode — allow re-initialization next time
            receiverPolyInitialized = false;
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

                const encodedMessage = binaryInput + result.remainder;
                crcSteps.innerHTML = renderLongDivision(result, encodedMessage, polynomial);

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
                
                // Show division steps (same long-division style as sender)
                crcSteps.innerHTML = renderLongDivision(result, null, polynomial);
                
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