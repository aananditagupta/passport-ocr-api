// Import required modules
import express from 'express';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize Google Vision client
const client = new ImageAnnotatorClient();

// Initialize Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Passport OCR API is running.');
  });

// POST endpoint to upload passport image
app.post('/upload', async (req, res) => {
  // The image should be sent in the 'image' field as a base64 string
  const { image } = req.body;

  if (!image) {
    return res.status(400).send({ error: 'Image is required' });
  }

  try {
    // Perform OCR using Google Vision API
    const [result] = await client.textDetection(Buffer.from(image, 'base64'));
    const detections = result.textAnnotations;

    // TODO: Extract Date of Birth and Expiry Date from detections

    res.status(200).send({ message: 'OCR complete', detections });
  } catch (error) {
    res.status(500).send({ error: 'OCR failed', details: error });
  }
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
