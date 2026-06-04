#!/usr/bin/env bash
# _*_ ENCODING: UTF-8 _*_
#
# Actualiza el front rutenio en el server. Lo invoca deploy-pruebas.sh /
# deploy-prod.sh por ssh: `bash actualizar_rutenio.sh`.
#
# Versionado en el repo a proposito: editar aca, no la copia suelta del server.
#
# Replica el patron del back (actualizar_escandio.sh):
#   - `git fetch` + `git reset --hard origin/$RAMA`: el server ESPEJA el remoto.
#     Mata el "fatal: Need to specify how to reconcile divergent branches" que
#     daba `git pull` cuando el develop local del server divergia.
#   - `npm ci`: instalacion limpia y reproducible desde package-lock. El repo
#     trae un .npmrc con legacy-peer-deps=true (conflicto @angular/cdk@19 vs
#     Angular 17), asi que NO hace falta pasar el flag.
#   - `set -eo pipefail` + trap ERR: si git/npm/build fallan, corta y NO reporta
#     exito en falso (el front es estatico, nginx sirve dist/rutenio; no hay
#     servicio que reiniciar).
set -eo pipefail

RAMA="${RAMA:-develop}"
DIR="/var/www/html/rutenio"

fallo() {
    echo "!!! Actualizacion rutenio FALLO (linea ${1}). Build NO regenerado."
    exit 1
}
trap 'fallo "$LINENO"' ERR

echo "Se inicia actualizacion rutenio"

cd "$DIR"

# Node por ssh no interactivo a veces no esta en PATH; cargar nvm si existe.
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh"
fi

# Espejar el remoto en vez de `git pull` (mata el "divergent branches").
git fetch origin "$RAMA"
git reset --hard "origin/$RAMA"
echo "Codigo actualizado ($(git log --oneline -1))"

npm ci
echo "Dependencias instaladas"

npx ng build --configuration production
echo "Build generado en $DIR/dist/rutenio"

echo "Actualizacion exitosa rutenio"
