$(document).ready(function() {
    function updateCalculator() {
        // Get input values
        const laborCosts = parseFloat($('#laborCosts').val()) || 0;
        const errorCosts = parseFloat($('#errorCosts').val()) || 0;
        const otherCosts = parseFloat($('#otherCosts').val()) || 0;
        const labelsNeeded = parseFloat($('#labelsNeeded').val()) || 0;
        
        // Calculate annual values
        const laborAnnual = laborCosts * 12;
        const errorAnnual = errorCosts * 12;
        const otherAnnual = otherCosts * 12;
        const totalMonthly = laborCosts + errorCosts + otherCosts;
        const totalAnnual = totalMonthly * 12;
        
        // Update annual values display
        $('#laborAnnual').text(laborAnnual.toLocaleString());
        $('#errorAnnual').text(errorAnnual.toLocaleString());
        $('#otherAnnual').text(otherAnnual.toLocaleString());
        $('#totalMonthly').text(totalMonthly.toLocaleString());
        $('#totalAnnual').text(totalAnnual.toLocaleString());
        
        // Calculate RFID costs and savings
        const rfidSubscription = 3980;
        const costPerTag = 0.08;
        const tagsCost = labelsNeeded * costPerTag;
        const totalRfidCost = rfidSubscription + tagsCost;
        
        // Calculate savings
        const laborSavings = laborAnnual * 0.7; // 70% reduction
        const errorSavings = errorAnnual * 0.5; // 50% reduction
        const totalSavings = laborSavings + errorSavings - totalRfidCost;
        
        // Update RFID-related displays
        $('#tagsAnnual').text(tagsCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));
        $('#laborSavings').text(laborSavings.toLocaleString());
        $('#errorSavings').text(errorSavings.toLocaleString());
        $('#totalSavings').text(totalSavings.toLocaleString());
    }

    // Add event listeners
    $('input').on('input', updateCalculator);
	    document.getElementById('toggleButton').addEventListener('click', function() {
            const container = document.getElementById('contentContainer');
            const button = document.getElementById('toggleButton');
            container.classList.toggle('collapsed');
            button.classList.toggle('active');
        });
    
    // Initialize calculator
    updateCalculator();
});
