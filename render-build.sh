#!/usr/bin/env bash
set -eo pipefail

echo "=== INICIANDO BUILD PARA RENDER ==="
echo "Directorio actual: $(pwd)"
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# 1. Instalar dependencias (esto ya lo hace npm install del Build Command)
echo "📦 Dependencias ya se instalarán con 'npm install'"

# 2. Crear estructura de directorios necesaria
echo "📂 Creando estructura de directorios..."
mkdir -p dist/views dist/public dist/routes dist/controllers dist/models dist/utils

# 3. Copiar VISTAS con verificación exhaustiva
echo "📂 Copiando vistas..."
if [ ! -d "views" ]; then
  echo "❌ Error Crítico: No existe el directorio views/"
  ls -la
  exit 1
fi

cp -Rv views/* dist/views/
echo "✅ Vistas copiadas. Contenido:"
ls -la dist/views/

# 4. Copiar archivos esenciales con verificación
ESSENTIAL_FILES=("server.js" "package.json" "package-lock.json" "mongo.env")
for file in "${ESSENTIAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Error: Archivo esencial $file no encontrado"
    exit 1
  fi
  cp -v "$file" dist/
done

# 5. Copiar código fuente
echo "🔌 Copiando código fuente..."
DIRECTORIES=("routes" "controllers" "models" "utils")
for dir in "${DIRECTORIES[@]}"; do
  if [ -d "$dir" ]; then
    cp -Rv "$dir"/* "dist/$dir/"
  else
    echo "⚠️ Advertencia: Directorio $dir no encontrado"
  fi
done

# 6. Verificación final
echo "=== VERIFICACIÓN FINAL ==="
echo "Estructura en dist/:"
tree -L 3 dist/ || ls -R dist/

echo "=== BUILD COMPLETADO CON ÉXITO ==="
