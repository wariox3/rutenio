import { UsuarioEffects } from "./effects/auth/usuario.effect";
import { usuarioReducer } from "./reducers/usuario.reducer";

export const StoreApp = {
    usuario: usuarioReducer,
};

export const EffectsApp = [
    UsuarioEffects,
]