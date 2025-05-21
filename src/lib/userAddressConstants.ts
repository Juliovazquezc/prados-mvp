// Calles y números de casa globales para formularios de usuario
export const streets = Array.from({ length: 6 }, (_, i) => `Calle ${i + 1}`);
export const houseNumbers = Array.from({ length: 80 }, (_, i) =>
  (i + 1).toString()
);
