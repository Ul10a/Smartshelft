#!/usr/bin/env bash
set -eo pipefail

echo "===== INICIANDO BUILD EN RENDER ====="
echo "Directorio actual: $(pwd)"
echo "Contenido:"
ls -la

# 1. Verificación ABSOLUTA de server.js
SERVER_JS_PATH=""
possible_paths=(
  "./server.js"
  "/opt/render/project/src/server.js"
  "${HOME}/server.js"
  "/tmp/server.js"
)

for path in "${possible_paths[@]}"; do
  if [ -f "$path" ]; then
    SERVER_JS_PATH="$path"
    echo "✅ ENCONTRADO server.js en: $path"
    break
  else
    echo "🔍 No encontrado en: $path"
  fi
done

if [ -z "$SERVER_JS_PATH" ]; then
  echo "❌ ERROR CRÍTICO: server.js no existe en ninguna ubicación conocida"
  echo "Contenido actual del directorio:"
  ls -la
  echo "Buscando en todo el sistema..."
  find / -name "server.js" 2>/dev/null || true
  exit 1
fi

# 2. Crear estructura de directorios
mkdir -p dist/{views,public,routes,controllers,models,utils}

# 3. Copiar server.js y otros esenciales
echo "📦 Copiando archivos principales..."
cp -v "$SERVER_JS_PATH" dist/
cp -v package.json package-lock.json mongo.env dist/

# 4. Copiar vistas y código fuente
[ -d "views" ] && cp -Rv views/* dist/views/
[ -d "public" ] && cp -Rv public/* dist/public/
[ -d "routes" ] && cp -Rv routes/* dist/routes/
[ -d "controllers" ] && cp -Rv controllers/* dist/controllers/
[ -d "models" ] && cp -Rv models/* dist/models/
[ -d "utils" ] && cp -Rv utils/* dist/utils/

echo "✅ BUILD COMPLETADO CON ÉXITO"
echo "Estructura final en dist/:"
ls -R dist/
