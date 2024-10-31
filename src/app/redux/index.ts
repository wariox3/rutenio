import { UsuarioEffects } from "./effects/auth/usuario.effect";
import { ContenedorEffects } from "./effects/contenedor/contenedor.effects";
import { contenedorReducer } from "./reducers/contenedor.reducer";
import { usuarioReducer } from "./reducers/usuario.reducer";

export const StoreApp = {
    usuario: usuarioReducer,
    contenedor: contenedorReducer

};

export const EffectsApp = [
    UsuarioEffects,
    ContenedorEffects
]