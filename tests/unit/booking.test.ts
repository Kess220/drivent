/* eslint-disable prettier/prettier */
// Importe as funções e objetos necessários para o teste
import { prisma } from '@/config';
import { createBookingRepository, isRoomFull } from '@/repositories/booking-repository';
import { createBooking } from '@/services/booking-service';

jest.mock('@/config', () => ({
  prisma: {
    booking: {
      create: jest.fn(),
      count: jest.fn(),
    },
    room: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Booking Repository Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a booking successfully', async () => {
    const userId = 1;
    const roomId = 1;

    // Simule o retorno da função create do prisma.booking
    (prisma.booking.create as jest.Mock).mockResolvedValue({ id: 1 });

    const bookingId = await createBookingRepository(userId, roomId);

    // Verifique se a função create do prisma.booking foi chamada corretamente
    expect(prisma.booking.create).toHaveBeenCalledWith({
      data: {
        userId,
        roomId,
      },
    });

    expect(bookingId).toBe(1);
  });

  it('should check if the room is full', async () => {
    const roomId = 1;

    // Simule a contagem de reservas
    (prisma.booking.count as jest.Mock).mockResolvedValue(2);

    // Simule as informações do quarto
    (prisma.room.findUnique as jest.Mock).mockResolvedValue({ capacity: 2 });

    const result = await isRoomFull(roomId);

    // Verifique se a função count do prisma.booking foi chamada corretamente
    expect(prisma.booking.count).toHaveBeenCalledWith({
      where: {
        roomId,
      },
    });

    // Verifique se a função findUnique do prisma.room foi chamada corretamente
    expect(prisma.room.findUnique).toHaveBeenCalledWith({
      where: {
        id: roomId,
      },
    });

    expect(result).toEqual({ room: { capacity: 2 }, reservationCount: 2 });
  });

  it('should throw an error when room does not exist', async () => {
    const userId = 1;
    const roomId = 1;

    // Simule que o quarto não existe (retorna null)
    (prisma.room.findUnique as jest.Mock).mockResolvedValue(null);

    // Chame a função de serviço e verifique se ela lança um erro
    try {
      await createBooking(userId, roomId);
    } catch (error) {
      expect(error.message).toBe('Room not found!');
    }
  });
});

describe('isRoomFull', () => {
  it('deve verificar se o quarto está cheio corretamente', async () => {
    const roomId = 2;
    const reservationCount = 3; // O número simulado de reservas
    const roomData = { id: roomId, name: 'Quarto 2' }; // Dados simulados do quarto

    // Configura o comportamento simulado do prisma.booking.count
    (prisma.booking.count as jest.Mock).mockResolvedValue(reservationCount);

    // Configura o comportamento simulado do prisma.room.findUnique
    (prisma.room.findUnique as jest.Mock).mockResolvedValue(roomData);

    const result = await isRoomFull(roomId);

    expect(result.room).toEqual(roomData);
    expect(result.reservationCount).toBe(reservationCount);
    expect(prisma.booking.count).toHaveBeenCalledWith({
      where: {
        roomId,
      },
    });
    expect(prisma.room.findUnique).toHaveBeenCalledWith({
      where: {
        id: roomId,
      },
    });
  });
});
