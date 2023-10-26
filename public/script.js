document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.birthDate && data.expiryDate) {
            const tableBody = document.getElementById('results');
            const newRow = tableBody.insertRow();
            newRow.insertCell(0).textContent = data.birthDate;
            newRow.insertCell(1).textContent = data.expiryDate;
        } else {
            alert('Failed to extract dates. Please try again.');
        }
    } catch (error) {
        alert('An error occurred. Please try again.');
    }
});
