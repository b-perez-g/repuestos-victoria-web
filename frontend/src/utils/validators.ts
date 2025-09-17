import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Correo inválido")
    .required("El correo es obligatorio"),
  
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .matches(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
    .matches(/\d/, "La contraseña debe contener al menos un número")
    .matches(/[@$!%*?&#^()_\-+={}[\]|\\:;"'<>,.?/~`]/, "La contraseña debe contener al menos un símbolo"),
}).required();
