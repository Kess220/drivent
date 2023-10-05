/* eslint-disable prettier/prettier */
import { bookingService } from '@/services/booking-service';
import bookingRepository from '@/repositories/booking-repository';

// Mock do bookingRepository
jest.mock('@/repositories/booking-repository');

describe('Booking Service Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a booking successfully', async () => {
    const userId = 1;
    const roomId = 1;

    // Crie um objeto simulado que corresponda à estrutura de retorno de isRoomFull
    const mockIsRoomFullResult = {
      room: {
        id: 1,
        name: 'Nome do Quarto',
        hotelId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        capacity: 2,
      },
      reservationCount: 1,
    };

    // Use spyOn para substituir a implementação de isRoomFull
    jest.spyOn(bookingRepository, 'isRoomFull').mockResolvedValue(mockIsRoomFullResult);

    // Mock da função createBookingRepository no bookingRepository
    jest.spyOn(bookingRepository, 'createBookingRepository').mockResolvedValue(1); // Simule o ID do booking criado

    const result = await bookingService.createBooking(userId, roomId);

    // Verifique se a função isRoomFull foi chamada com os argumentos corretos
    expect(bookingRepository.isRoomFull).toHaveBeenCalledWith(roomId);

    // Verifique se a função createBookingRepository foi chamada com os argumentos corretos
    expect(bookingRepository.createBookingRepository).toHaveBeenCalledWith(userId, roomId);

    // Verifique se o resultado é o esperado
    expect(result).toEqual({ bookingId: 1 });
  });

  describe('POST /booking', () => {
    it('Should throw a notFoundBookingError when room doesnt exist', async () => {
      const userId = 1;
      const roomId = 9999; // Um número que provavelmente não corresponde a nenhum quarto existente

      // Simule a função isRoomFull retornando um quarto nulo, indicando que o quarto não existe
      jest.spyOn(bookingRepository, 'isRoomFull').mockResolvedValue({
        room: null,
        reservationCount: 0,
      });

      // Chame a função createBooking e verifique se ela lança a exceção esperada
      await expect(bookingService.createBooking(userId, roomId)).rejects.toEqual({
        name: 'NotFoundBookingError',
        message: 'Room not exist!',
      });
    });
  });

  it('should throw forbiddenError when room is fully occupied', async () => {
    const userId = 1;
    const roomId = 123; // Simule um quarto

    // Simule um quarto totalmente ocupado
    const mockIsRoomFullResult = {
      room: {
        id: roomId,
        capacity: 2,
      },
      reservationCount: 2,
    };

    // Use spyOn para substituir a implementação de isRoomFull
    jest.spyOn(bookingRepository, 'isRoomFull').mockResolvedValue(mockIsRoomFullResult);

    // Chame a função createBooking e verifique se ela lança a exceção forbiddenError
    const result = bookingService.createBooking(userId, roomId);
    expect(result).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Quarto está totalmente ocupado',
    });
  });
});
