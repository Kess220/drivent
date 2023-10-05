/* eslint-disable prettier/prettier */
import faker from '@faker-js/faker';

// Função para gerar dados fictícios de reserva
function createBookingData() {
  const startDate = faker.date.future(); // Data de início futura
  const endDate = faker.date.future(undefined, startDate); // Data de término após a data de início

  return {
    userId: 1, // ID do usuário associado à reserva
    roomId: 1, // ID do quarto associado à reserva
    startDate,
    endDate,
  };
}

export { createBookingData };
