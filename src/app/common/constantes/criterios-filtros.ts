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
      valor: "exact",
      texto: "Igual",
      defecto: true,
    },
    {
      valor: "gt",
      texto: "Mayor Que",
    },
    {
      valor: "gte",
      texto: "Mayor Igual Que",
    },
    {
      valor: "lt",
      texto: "Menor Que",
    },
    {
      valor: "lte",
      texto: "Menor Igual Que",
    },
  ],
  FloatField: [
    {
      valor: "exact",
      texto: "IGUAL",
      defecto: true,
    },
    {
      valor: "gt",
      texto: "MAYORQUE",
    },
    {
      valor: "gte",
      texto: "MAYORIGUALQUE",
    },
    {
      valor: "lt",
      texto: "MENORQUE",
    },
    {
      valor: "lte",
      texto: "MENORIGUALQUE",
    },
  ],
  CharField: [
    {
      valor: "exact",
      texto: "Igual",
    },
    {
      valor: "icontains",
      texto: "Contiene",
      defecto: true,
    },
  ],
  DateField: [
    {
      valor: "exact",
      texto: "Igual",
      defecto: true,
    },
    {
      valor: "gt",
      texto: "Mayor Que",
    },
    {
      valor: "gte",
      texto: "Mayor Igual Que",
    },
    {
      valor: "lt",
      texto: "Menor Que",
    },
    {
      valor: "lte",
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
      valor: "exact",
      texto: "Igual",
      defecto: true,
    },
     {
      valor: "isnull",
      texto: "Sin asignar",
      defecto: false,
    },
  ],
};

// descripcionisnull=True 