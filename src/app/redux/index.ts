import { UsuarioEffects } from "./effects/auth/usuario.effect";
import { ContenedorEffects } from "./effects/contenedor/contenedor.effects";
import { EmpresaEffects } from "./effects/empresa/empresa.effects";
import { contenedorReducer } from "./reducers/contenedor.reducer";
import { empresaReducer } from "./reducers/empresa.reducer";
import { usuarioReducer } from "./reducers/usuario.reducer";

export const StoreApp = {
    usuario: usuarioReducer,
    contenedor: contenedorReducer,
    empresa: empresaReducer

};

export const EffectsApp = [
    UsuarioEffects,
    ContenedorEffects,
    EmpresaEffects
]