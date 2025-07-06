import express from 'express';
import cors from 'cors';
import mic1Routes from './api/routes/mic1Routes';
import { mic1Controller } from './api/controllers/mic1Controller';
import { swaggerSpec } from './swagger/swagger.config';
import { swaggerSpecEn, swaggerSpecPt } from './swagger/swagger.config.multilang';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentação em Inglês
app.get('/api-docs', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>MIC-1 Processor API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
      <style>
        .language-selector {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 1000;
          background: #f5f5f5;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ddd;
        }
        .language-selector a {
          margin: 0 5px;
          text-decoration: none;
          color: #007bff;
          font-weight: bold;
        }
        .language-selector a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="language-selector">
        🌐 Language: <a href="/api-docs">English</a> | <a href="/api-docs-pt">Português</a>
      </div>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          SwaggerUIBundle({
            url: '/api-docs.json',
            dom_id: '#swagger-ui',
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout"
          });
        };
      </script>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Documentação em Português
app.get('/api-docs-pt', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Documentação da API do Processador MIC-1</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
      <style>
        .language-selector {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 1000;
          background: #f5f5f5;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ddd;
        }
        .language-selector a {
          margin: 0 5px;
          text-decoration: none;
          color: #007bff;
          font-weight: bold;
        }
        .language-selector a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="language-selector">
        🌐 Idioma: <a href="/api-docs">English</a> | <a href="/api-docs-pt">Português</a>
      </div>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          SwaggerUIBundle({
            url: '/api-docs-pt.json',
            dom_id: '#swagger-ui',
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout"
          });
        };
      </script>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Especificações JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecEn);
});

app.get('/api-docs-pt.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecPt);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MIC-1 Processor Backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/mic1', mic1Routes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});


app.listen(PORT, () => {
  console.log(`MIC-1 Processor Backend Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Base URL: http://localhost:${PORT}/api/mic1`);
  console.log(`API Documentation (EN): http://localhost:${PORT}/api-docs`);
  console.log(`API Documentation (PT): http://localhost:${PORT}/api-docs-pt`);
  console.log(`Swagger JSON (EN): http://localhost:${PORT}/api-docs.json`);
  console.log(`Swagger JSON (PT): http://localhost:${PORT}/api-docs-pt.json`);
  console.log('[MIC-1 BACK] inicializado às', new Date().toLocaleTimeString());
});
