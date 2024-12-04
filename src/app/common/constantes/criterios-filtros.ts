export interface CriteriosFiltro {
  valor: string | number | boolean;
  texto: string;
  defecto?: boolean;
}

export type BaseCriteriosFiltro = {
  [key: string]: CriteriosFiltro[];
};

export const  criteriosFiltros: BaseCriteriosFiltro = {
  IntegerField: [
    {
      valor: "igual",
      texto: "Igual",
      defecto: true,
    },
    {
      valor: "__gt",
      texto: "Mayor Que",
    },
    {
      valor: "__gte",
      texto: "Mayor Igual Que",
    },
    {
      valor: "__lt",
      texto: "Menor Que",
    },
    {
      valor: "__lte",
      texto: "Menor Igual Que",
    },
  ],
  FloatField: [
    {
      valor: "igual",
      texto: "IGUAL",
      defecto: true,
    },
    {
      valor: "__gt",
      texto: "MAYORQUE",
    },
    {
      valor: "__gte",
      texto: "MAYORIGUALQUE",
    },
    {
      valor: "__lt",
      texto: "MENORQUE",
    },
    {
      valor: "__lte",
      texto: "MENORIGUALQUE",
    },
  ],
  CharField: [
    {
      valor: "igual",
      texto: "Igual",
    },
    {
      valor: "__icontains",
      texto: "Contiene",
      defecto: true,
    },
  ],
  DateField: [
    {
      valor: "igual",
      texto: "Igual",
      defecto: true,
    },
    {
      valor: "__gt",
      texto: "Mayor Que",
    },
    {
      valor: "__gte",
      texto: "Mayor Igual Que",
    },
    {
      valor: "__lt",
      texto: "Menor Que",
    },
    {
      valor: "__lte",
      texto: "Menor Igual Que",
    },
  ],
  Booleano: [
    {
      valor: true,
      texto: "Si",
    },
    {
      valor: false,
      texto: "No",
    },
  ],
  Fk: [
    {
      valor: "igual",
      texto: "Igual",
      defecto: true,
    },
     {
      valor: "__isnull",
      texto: "Sin asignar",
      defecto: false,
    },
  ],
};

// descripcion__isnull=True 