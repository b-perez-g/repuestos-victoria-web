import * as yup from "yup";

export const loginSchema = yup.object({
    correo: yup
        .string()
        .email("Correo inválido")
        .required("El correo es obligatorio"),
    contrasena: yup
        .string()
        .required("La contraseña es obligatoria"),
    recordar: yup
        .boolean()
        .default(false)
});

export const registerSchema = yup.object({
    nombres: yup
        .string()
        .required("Los nombres son obligatorios")
        .min(2, "Los nombres deben tener al menos 2 caracteres")
        .max(50, "Los nombres no pueden tener más de 50 caracteres"),
    a_paterno: yup
        .string()
        .required("El apellido paterno es obligatorio")
        .min(2, "El apellido paterno debe tener al menos 2 caracteres")
        .max(50, "El apellido paterno no puede tener más de 50 caracteres"),
    a_materno: yup
        .string()
        .max(50, "El apellido materno no puede tener más de 50 caracteres")
        .nullable(),
    correo: yup
        .string()
        .required("El correo electrónico es obligatorio")
        .email("Debe ser un correo electrónico válido")
        .max(255, "El correo electrónico es demasiado largo"),
    contrasena: yup
        .string()
        .required("La contraseña es obligatoria")
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
            "La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial"
        ),
    confirmarContrasena: yup
        .string()
        .required("Debes confirmar tu contraseña")
        .oneOf([yup.ref("contrasena")], "Las contraseñas no coinciden"),
});