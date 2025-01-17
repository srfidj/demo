$(document).ready(function() {
    // Product data
    const baseOffer = [
        {
            id: 'base1',
            title: 'Pilot RFID Bundle with FREE Hardware',
            description: 'FREE RFID Hardware + 2 months off the Annual Subscription ($3,659 in savings)',
            price: 3980.00,
            period: 'year'
        },
        {
            id: 'base2',
            title: 'Setup, Training & Onboarding',
            description: 'One-Time Setup, Training & Onboarding',
            price: 500.00,
            period: ''
        }
    ];

    const addOns = [
        {
            id: 'addon1',
            title: 'FREE RFID Desktop Printer + Discounted Annual Service Plan',
            description: 'FREE RFID Desktop Printer + Discounted Annual Service Plan | Value up to $3887',
            price: 1990.00,
            period: 'year'
        },
        {
            id: 'addon2',
            title: 'FREE RFID Reader + Discounted Annual Service Plan',
            description: 'FREE RFID Reader + Discounted Annual Service Plan | Value up to $3663',
            price: 1990.00,
            period: 'year'
        },
        {
            id: 'addon3',
            title: '1 Roll | 1,500 qty Badge RFID Labels + Ribbon Bundle | Small Core',
            description: '1,500qty RFID Badge Size Labels | 2.38" x 1.38" (60 X 35MM) | 1" Small Core + 1 Roll Ribbon',
            price: 141.00,
            period: ''
        },
        {
            id: 'addon4',
            title: '1 Roll | 2,000 qty Retail RFID Labels + Ribbon Bundle | Small Core',
            description: '2,000qty RFID Retail Size Labels | 1.85"x 0.91" (47 x 23mm) | 1" Small Core + 1 Roll Ribbon',
            price: 181.00,
            period: ''
        },
        {
            id: 'addon5',
            title: '1 Roll | 2500qty Jewelry C Labels + Ribbon Bundle | Small Core',
            description: '2500qty Jewelry C Labels | folded size 0.5" x 1" (13 x 25mm) | 1" Small Core + 1 Roll Ribbon',
            price: 296.00,
            period: ''
        }
    ];

    // Cart state
    let cart = {
        items: {},
        total: 0
    };

    // Initialize base offer items
    function initializeBaseOffer() {
        const baseOfferHtml = baseOffer.map(item => `
            <div class="base-item" data-id="${item.id}">
                <div class="product-title">${item.title}</div>
                <div class="product-description">${item.description}</div>
                <div class="product-price">$${item.price.toFixed(2)}${item.period ? ' / ' + item.period : ''}</div>
            </div>
        `).join('');
        
        $('#baseOfferItems').html(baseOfferHtml);
        
        // Add base items to cart
        baseOffer.forEach(item => {
            cart.items[item.id] = {
                id: item.id,
                title: item.title,
                price: item.price,
                quantity: 1,
                period: item.period
            };
        });
        updateCart();
    }

    // Initialize add-on items
    function initializeAddOns() {
        const addOnsHtml = addOns.map(item => `
            <div class="product-card" data-id="${item.id}">
                <div class="product-title">${item.title}</div>
                <div class="product-description">${item.description}</div>
                <div class="product-price">$${item.price.toFixed(2)}${item.period ? ' / ' + item.period : ''}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity-display" data-id="${item.id}">0</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
            </div>
        `).join('');
        
        $('#addOnsGrid').html(addOnsHtml);
    }

    // Update cart display
    function updateCart() {
        let oneTimeTotal = 0;
        let annualTotal = 0;

        const cartItemsHtml = Object.values(cart.items)
            .filter(item => item.quantity > 0)
            .map(item => {
                const subtotal = item.price * item.quantity;
                if (item.period === 'year') {
                    annualTotal += subtotal;
                } else {
                    oneTimeTotal += subtotal;
                }
                return `
                    <div class="cart-item">
                        <div class="item-details">
                            <div class="item-title">${item.title}${item.quantity > 1 ? ' <span class="quantity-badge">x' + item.quantity + '</span>' : ''}</div>
                            <div class="item-price">$${subtotal.toFixed(2)}${item.period ? ' / ' + item.period : ''}</div>
                        </div>
                    </div>
                `;
            }).join('');

        const grandTotal = oneTimeTotal + annualTotal;

        $('#cartItems').html(cartItemsHtml);
        $('#oneTimeTotal').text('$' + oneTimeTotal.toFixed(2));
        $('#annualTotal').text('$' + annualTotal.toFixed(2));
        $('#grandTotal').text('$' + grandTotal.toFixed(2));

        cart.oneTimeTotal = oneTimeTotal;
        cart.annualTotal = annualTotal;
        cart.grandTotal = grandTotal;
    }

    // Event handlers
    $(document).on('click', '.increase', function() {
        const id = $(this).data('id');
        const item = addOns.find(item => item.id === id);
        
        if (!cart.items[id]) {
            cart.items[id] = {
                id: id,
                title: item.title,
                price: item.price,
                quantity: 0,
                period: item.period
            };
        }
        
        cart.items[id].quantity++;
        $(`.quantity-display[data-id="${id}"]`).text(cart.items[id].quantity);
        updateCart();
    });

    $(document).on('click', '.decrease', function() {
        const id = $(this).data('id');
        if (cart.items[id] && cart.items[id].quantity > 0) {
            cart.items[id].quantity--;
            $(`.quantity-display[data-id="${id}"]`).text(cart.items[id].quantity);
            updateCart();
        }
    });

    // Export functions
    function exportToPDF() {
        const element = document.querySelector('.cart-summary');
        const opt = {
            margin: 10,
            filename: 'RFID-Quote.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    }

    function exportToImage() {
        const element = document.querySelector('.cart-summary');
        const logo = element.querySelector('.summary-logo');

        // Create a temporary canvas to handle the logo
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Load the logo first
        img.onload = function() {
            // Now capture the entire element
            html2canvas(element, {
                scale: 2,
                allowTaint: true,
                useCORS: true,
                backgroundColor: '#ffffff',
                imageTimeout: 0,
                removeContainer: true,
                foreignObjectRendering: true
            }).then(function(canvas) {
                try {
                    const link = document.createElement('a');
                    link.download = 'RFID-Quote.png';
                    link.href = canvas.toDataURL('image/png');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (e) {
                    console.error('Error saving image:', e);
                }
            }).catch(function(error) {
                console.error('Error generating image:', error);
            });
        };

        img.onerror = function() {
            console.error('Error loading logo image');
            // Try to generate image without logo
            html2canvas(element, {
                scale: 2,
                allowTaint: true,
                useCORS: true,
                backgroundColor: '#ffffff',
                removeContainer: true
            }).then(function(canvas) {
                const link = document.createElement('a');
                link.download = 'RFID-Quote.png';
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        };

        // Set the source last
        img.src = logo.src;
    }

    function exportToExcel() {
        const workbook = XLSX.utils.book_new();
        const data = [];

        // Add headers
        data.push(['RFID Solutions Quote']);
        data.push([]);
        data.push(['Item', 'Quantity', 'Price']);

        // Add items
        Object.values(cart.items)
            .filter(item => item.quantity > 0)
            .forEach(item => {
                const subtotal = item.price * item.quantity;
                data.push([
                    item.title,
                    item.quantity,
                    `$${subtotal.toFixed(2)}${item.period ? ' / ' + item.period : ''}`
                ]);
            });

        // Add totals
        data.push([]);
        data.push(['One-Time Costs:', '', `$${cart.oneTimeTotal.toFixed(2)}`]);
        data.push(['Annual Total:', '', `$${cart.annualTotal.toFixed(2)}`]);
        data.push(['Total Due Today:', '', `$${cart.grandTotal.toFixed(2)}`]);

        const worksheet = XLSX.utils.aoa_to_sheet(data);

        // Set column widths
        const cols = [{ wch: 50 }, { wch: 10 }, { wch: 15 }];
        worksheet['!cols'] = cols;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Quote');
        XLSX.writeFile(workbook, 'RFID-Quote.xlsx');
    }

    // Event listeners for export buttons
    $('#exportPDF').on('click', exportToPDF);
    $('#exportImage').on('click', exportToImage);
    $('#exportExcel').on('click', exportToExcel);

    // Initialize the page
    initializeBaseOffer();
    initializeAddOns();
});
