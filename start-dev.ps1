# Inicia o servidor de backend em uma nova janela do PowerShell
Write-Output "Iniciando o servidor de backend..."
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd back; yarn install; yarn dev"

# Inicia o aplicativo de frontend em uma nova janela do PowerShell
Write-Output "Iniciando o aplicativo de frontend..."
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd front; npm install; npm start"

Write-Output "Servidores de backend e frontend iniciados em janelas separadas." 