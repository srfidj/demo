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
            price: 500.00
        }
    ];

    const addOns = [
        {
            id: 'printer-bundle',
            title: 'FREE RFID Desktop Printer + Discounted Annual Service Plan',
            description: 'Desktop printer with annual service plan.',
            price: 1999.99,
            period: 'year',
            images: ['printer.png']
        },
        {
            id: 'reader-bundle',
            title: 'FREE RFID Reader + Discounted Annual Service Plan',
            description: 'RFID reader with annual service plan.',
            price: 1499.99,
            period: 'year',
            images: ['reader.png']
        },
        {
            id: 'badge-labels',
            title: '1 Roll | 1,500 qty Badge RFID Labels + Ribbon Bundle | Small Core',
            description: 'Badge RFID labels with ribbon.',
            price: 599.99,
            images: ['badge.png', 'ribbon.png']
        },
        {
            id: 'retail-labels',
            title: '1 Roll | 2,000 qty Retail RFID Labels + Ribbon Bundle | Small Core',
            description: 'Retail RFID labels with ribbon.',
            price: 699.99,
            images: ['retail.png', 'ribbon.png']
        },
        {
            id: 'jewelry-labels',
            title: '1 Roll | 2500qty Jewelry C Labels + Ribbon Bundle | Small Core',
            description: 'Jewelry RFID labels with ribbon.',
            price: 799.99,
            images: ['jewelry.png', 'ribbon.png']
        }
    ];

    // Cart state
    let cart = {
        items: {},
        total: 0
    };

    // Format number with commas
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Initialize base offer items
    function initializeBaseOffer() {
        const baseOfferHtml = baseOffer.map(item => `
            <div class="base-item" data-id="${item.id}">
                <div class="product-title">${item.title}</div>
                <div class="product-description">${item.description}</div>
                <div class="product-price">$${formatNumber(item.price.toFixed(2))}${item.period ? ' / ' + item.period : ''}</div>
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
                <div class="product-images">
                    ${item.images.map(img => `<img src="images/${img}" alt="${img.split('.')[0]}" class="product-image">`).join('')}
                </div>
                <div class="product-title">${item.title}</div>
                <div class="product-description">${item.description}</div>
                <div class="product-price">$${formatNumber(item.price.toFixed(2))}${item.period ? ' / ' + item.period : ''}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <input type="number" class="quantity-input" data-id="${item.id}" value="0" min="0" max="999">
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

        const cartItemsHtml = [];
        
        // Add base offer if quantity > 0
        Object.values(cart.items)
            .filter(item => item.quantity > 0)
            .forEach(item => {
                const subtotal = item.price * item.quantity;
                if (item.period === 'year') {
                    annualTotal += subtotal;
                } else {
                    oneTimeTotal += subtotal;
                }
                cartItemsHtml.push(`
                    <div class="cart-item">
                        <div class="item-details">
                            <div class="item-title">${item.title}${item.quantity > 1 ? ' <span class="quantity-badge">x' + item.quantity + '</span>' : ''}</div>
                            <div class="item-price">$${formatNumber(subtotal.toFixed(2))}${item.period ? ' / ' + item.period : ''}</div>
                        </div>
                    </div>
                `);
            });

        const grandTotal = oneTimeTotal + annualTotal;

        $('#cartItems').html(cartItemsHtml.join(''));
        $('#oneTimeTotal').text('$' + formatNumber(oneTimeTotal.toFixed(2)));
        $('#annualTotal').text('$' + formatNumber(annualTotal.toFixed(2)));
        $('#grandTotal').text('$' + formatNumber(grandTotal.toFixed(2)));

        cart.total = grandTotal;

        // Update all quantity inputs
        Object.entries(cart.items).forEach(([id, item]) => {
            $(`.quantity-input[data-id="${id}"]`).val(item.quantity);
        });
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
        updateCart();
    });

    $(document).on('click', '.decrease', function() {
        const id = $(this).data('id');
        if (cart.items[id] && cart.items[id].quantity > 0) {
            cart.items[id].quantity--;
            updateCart();
        }
    });

    $(document).on('change', '.quantity-input', function() {
        const id = $(this).data('id');
        const item = addOns.find(item => item.id === id);
        const value = parseInt($(this).val()) || 0;
        
        // Ensure value is non-negative
        const quantity = Math.max(0, value);
        $(this).val(quantity);
        
        if (quantity > 0 && !cart.items[id]) {
            cart.items[id] = {
                id: id,
                title: item.title,
                price: item.price,
                quantity: 0,
                period: item.period
            };
        }
        
        if (cart.items[id]) {
            cart.items[id].quantity = quantity;
            updateCart();
        }
    });

    // Handle invalid input
    $(document).on('input', '.quantity-input', function() {
        const value = $(this).val();
        if (value !== '' && !(/^\d*$/.test(value))) {
            $(this).val(value.replace(/[^\d]/g, ''));
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
        html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'RFID-Quote.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
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
        data.push(['One-Time Costs:', '', `$${cart.total.toFixed(2)}`]);
        data.push(['Total Due Today:', '', `$${cart.total.toFixed(2)}`]);

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
