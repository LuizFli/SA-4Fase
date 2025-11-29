const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

let lastData = null;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'avaliacao-iot-service', routes: ['/api/registro (POST)', '/api/ultimo (GET)'] });
});

app.post('/api/registro', (req, res) => {
  const { temperatura, ar } = req.body || {};

  if (typeof temperatura !== 'number' || typeof ar !== 'boolean') {
    return res.status(400).json({
      ok: false,
      message: 'Payload inválido. Envie {"temperatura": number, "ar": boolean}'
    });
  }

  lastData = { temperatura, ar, recebidoEm: new Date().toISOString() };

  return res.status(201).json({ ok: true, recebido: lastData });
});

app.get('/api/ultimo', (req, res) => {
  if (!lastData) {
    return res.status(404).json({ ok: false, message: 'Nenhum dado registrado ainda.' });
  }
  return res.json({ ok: true, ultimo: lastData });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://0.0.0.0:${PORT}`);
});
