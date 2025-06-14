import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import mic1Routes from './api/routes/mic1Routes';
import { mic1Controller } from './api/controllers/mic1Controller';
import { swaggerSpec } from './swagger/swagger.config';

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/api-docs', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MIC-1 Processor API Documentation</title>
      <link rel="stylesheet" type="text/css" href="https:
      <style>
        html {
          box-sizing: border-box;
          overflow: -moz-scrollbars-vertical;
          overflow-y: scroll;
        }
        *, *:before, *:after {
          box-sizing: inherit;
        }
        body {
          margin: 0;
          background: #fafafa;
        }
        .topbar { display: none !important; }
        .swagger-ui .topbar { display: none !important; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https:
      <script src="https:
      <script>
        window.onload = function() {
          const ui = SwaggerUIBundle({
            url: '/api-docs.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
            tryItOutEnabled: true,
            requestInterceptor: function(request) {
              request.headers['Accept'] = 'application/json';
              request.headers['Content-Type'] = 'application/json';
              return request;
            }
          });
        };
      </script>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});


app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
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


setInterval(() => {
  mic1Controller.cleanupSessions();
}, 30 * 60 * 1000);


app.listen(PORT, () => {
  console.log(`MIC-1 Processor Backend Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Base URL: http://localhost:${PORT}/api/mic1`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Swagger JSON: http://localhost:${PORT}/api-docs.json`);
});
