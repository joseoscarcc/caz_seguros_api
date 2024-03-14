require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const app = express();
const port = 3050;
const uri = process.env.MONGODB;
// Connect to MongoDB
mongoose.connect(uri, {})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Create schema and model for autos collection
const autoSchema = new mongoose.Schema({
  marca: String,
  // Add other fields if needed
});

const cotizacionSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  codigoPostal: String,
  tipoVehiculo: String,
  marca: String,
  year: Number,
  modelo: String
});

// Create model for cotizacion collection
const Cotizacion = mongoose.model('cotizacion', cotizacionSchema);

const Auto = mongoose.model('autos', autoSchema);

app.use(cors());
app.use(express.json());

// Define a route to fetch unique 'marca' values
app.get('/api/marcas', async (req, res) => {
  try {
    // Fetch unique 'marca' values from autos collection
    const marcas = await Auto.distinct('MARCA');
    res.json({ marca: marcas });
  } catch (error) {
    console.error('Error fetching unique marcas:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route to fetch descripcion_2 values based on selected marca and year
app.get('/api/model', async (req, res) => {
  const { marca, year } = req.query;

  try {
    // Fetch descripcion_2 values from autos collection based on selected marca and year
    const modelos = await Auto.find({ MARCA: marca, YEAR: parseInt(year) }, 'DESCRIPCION_2');
    
    result = JSON.parse(JSON.stringify(modelos))  
    // Extract the "descripcion_2" values and handle null values
    const descripcion_2 = result.map(item => item.DESCRIPCION_2); // Extracting only DESCRIPCION_2 values
    
    res.json({ Modelos: descripcion_2 });
  } catch (error) {
    console.error('Error fetching descripcion_2:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/submit', async (req, res) => {
  try {
    // Extract cotizacion information from the request body
    const { nombre, correo, codigoPostal, tipoVehiculo, marca, year, modelo } = req.body;

    // Create a new cotizacion document
    const newCotizacion = new Cotizacion({
      nombre,
      correo,
      codigoPostal,
      tipoVehiculo,
      marca,
      year,
      modelo
    });

    // Save the cotizacion document to the database
    await newCotizacion.save();

    // Send a response back to the client
    res.status(200).json({ message: 'Form submitted successfully!' });

    // Now, you can send a WhatsApp message by sending a response back to the client,
    // and the client-side JavaScript will handle opening the WhatsApp message.
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

function sendWhatsAppMessage(nombre, correo, codigoPostal, tipoVehiculo, marca, year, modelo) {
  const phonenumber = process.env.PHONENUMBER; // Replace with your phone number
  
  const url = `https://wa.me/${phonenumber}?text=*Nombre:* ${nombre}%0a*Email:* ${correo}%0a*Codigo Postal:* ${codigoPostal}%0a*Tipo de Vehículo:* ${tipoVehiculo}%0a*Marca:* ${marca}%0a*Año:* ${year}%0a*Modelo:* ${modelo}%0a*Solicitud de Cotización*`;

  console.log("Opening WhatsApp link:", url);
  // Use a library like 'open' or 'child_process' to open the URL in default browser
  // For simplicity, I'm logging the URL to the console here
}