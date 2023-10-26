document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.birthDate && data.expiryDate) {
            const resultsTable = document.getElementById('results');
            const newRow = resultsTable.insertRow();
            newRow.insertCell().innerText = data.birthDate;
            newRow.insertCell().innerText = data.expiryDate;
        } else {
            // Handle case when dates are not extracted
            console.error('Failed to extract dates.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
