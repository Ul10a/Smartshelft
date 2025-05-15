#!/usr/bin/env bash
set -eo pipefail

echo "=== INICIANDO BUILD PARA RENDER ==="
echo "Directorio actual: $(pwd)"
echo "Contenido actual:"
ls -la

# 1. Crear estructura de directorios necesaria
echo "📂 Creando estructura de directorios..."
mkdir -p dist/views dist/public dist/routes dist/controllers dist/models dist/utils

# 2. Copiar VISTAS con verificación
echo "📂 Copiando vistas..."
if [ ! -d "views" ]; then
  echo "❌ Error: No existe el directorio views/"
  exit 1
fi
cp -Rv views/* dist/views/

# 3. Copiar archivos públicos
echo "📦 Copiando archivos públicos..."
if [ -d "public" ]; then
  cp -Rv public/* dist/public/
else
  echo "⚠️ No se encontró directorio public/"
fi

# 4. Copiar archivos del servidor
echo "📄 Copiando archivos principales..."
cp -v server.js dist/
cp -v package.json dist/
cp -v package-lock.json dist/
cp -v mongo.env dist/

# 5. Copiar código fuente
echo "🔌 Copiando código fuente..."
cp -Rv routes/* dist/routes/
cp -Rv controllers/* dist/controllers/
cp -Rv models/* dist/models/

if [ -d "utils" ]; then
  cp -Rv utils/* dist/utils/
else
  echo "⚠️ No se encontró directorio utils/"
fi

# 6. Verificación final
echo "=== VERIFICACIÓN FINAL ==="
echo "Estructura en dist/:"
find dist/ -type d -exec ls -la {} \;

echo "✅ BUILD COMPLETADO CON ÉXITO"
