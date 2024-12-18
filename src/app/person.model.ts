export class Person {
  id!: number;  // Optional: Nur, wenn das Backend eine ID vergibt
  firstName!: string;
  lastName!: string;
  birthDate!: string;
  department!: string;

  // Optional: Falls Beziehungen wie Vorgesetzte oder Untergebene nötig sind
  supervisorId?: number;  // ID des Vorgesetzten
  subordinates?: Person[];  // Liste von Untergebenen
}
