require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 3050;
const uri = process.env.MONGODB;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

const dbName = process.env.DBNAME;
const collectionName_1 = process.env.COLLECTIONNAME_1;
const collectionName_2 = process.env.COLLECTIONNAME_2;

  // Create references to the database and collection in order to run
  // operations on them.
const database = client.db(dbName);
const collection = database.collection(collectionName_1);
const collection_1 = database.collection(collectionName_2);

app.use(cors());
app.use(express.json());

// Define a route to fetch unique 'marca' values
app.get('/api/marcas', async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: "$MARCA" } },
      { $project: { _id: 0, marca: "$_id" } },
      { $sort: { marca: 1 } } // Sort the "marca" field in ascending order
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const marcas = result.map(item => item.marca);

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
    const pipeline = [
      { $match: { MARCA: marca, YEAR: parseInt(year) } },
      { $project: { _id: 0, Descripcion_2: "$DESCRIPCION_2" } }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const modelos = result.map(item => item.Descripcion_2);

    res.json({ Modelos: modelos });
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
    const newCotizacion = {
      nombre,
      correo,
      codigoPostal,
      tipoVehiculo,
      marca,
      year,
      modelo
    };

    // Insert the cotizacion document into the database
    await collection_1.insertOne(newCotizacion);

    // Send a response back to the client
    res.status(200).json({ message: 'Form submitted successfully!' });

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
  const phonenumber = process.env.NEXT_PUBLIC_PHONENUMBER; // Replace with your phone number
  
  const url = `https://wa.me/${phonenumber}?text=*Nombre:* ${nombre}%0a*Email:* ${correo}%0a*Codigo Postal:* ${codigoPostal}%0a*Tipo de Vehículo:* ${tipoVehiculo}%0a*Marca:* ${marca}%0a*Año:* ${year}%0a*Modelo:* ${modelo}%0a*Solicitud de Cotización*`;

  console.log("Opening WhatsApp link:", url);
  // Use a library like 'open' or 'child_process' to open the URL in default browser
  // For simplicity, I'm logging the URL to the console here
}