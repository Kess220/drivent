/* eslint-disable prettier/prettier */
import { TicketStatus } from '@prisma/client';
import { bookingService } from '@/services/booking-service';
import { bookingRepository } from '@/repositories/booking-repository';
import { enrollmentRepository, ticketsRepository } from '@/repositories';

// Mock do bookingRepository
jest.mock('@/repositories/booking-repository');

describe('Booking Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Redefine as mocks antes de cada teste
  });

  test('1 - should create a booking successfully', async () => {
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
    const mockTicketResult = {
      id: 2,
      ticketTypeId: 1,
      enrollmentId: 1,
      status: TicketStatus.PAID, // Defina o status como um valor válido de TicketStatus
      createdAt: new Date('2023-10-06T16:31:42.258Z'),
      updatedAt: new Date('2023-10-06T16:32:22.846Z'),
      TicketType: {
        id: 1,
        name: 'testenameType',
        price: 100,
        isRemote: false,
        includesHotel: true,
        createdAt: new Date('2023-10-06T13:31:30.412Z'),
        updatedAt: new Date('2023-10-06T13:31:30.412Z'),
      },
    };

    const mockEnrollmentResult = {
      id: 1,
      name: 'Kaio',
      cpf: '12345678909',
      birthday: new Date('1990-05-15T00:00:00.000Z'),
      phone: '(77)97777-7777',
      userId: 1,
      createdAt: new Date('2023-10-06T16:19:18.570Z'),
      updatedAt: new Date('2023-10-06T16:19:18.571Z'),
      Address: [
        {
          id: 1,
          cep: '63950-000',
          street: 'Rua Principal',
          city: 'Choró',
          state: 'CE',
          number: '123',
          neighborhood: 'Centro',
          addressDetail: 'fim do mundo',
          enrollmentId: 1,
          createdAt: new Date('2023-10-06T16:19:18.577Z'),
          updatedAt: new Date('2023-10-06T16:19:18.578Z'),
        },
      ],
    };

    // Use spyOn para substituir a implementação de isRoomFull
    jest.spyOn(bookingRepository, 'isRoomFull').mockResolvedValue(mockIsRoomFullResult);
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollmentResult);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValue(mockTicketResult);

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
    test('2 - Should throw a notFoundBookingError when room doesnt exist', async () => {
      const userId = 1;
      const roomId = 9999; // Um número que provavelmente não corresponde a nenhum quarto existente

      const mockTicketResult = {
        id: 2,
        ticketTypeId: 1,
        enrollmentId: 1,
        status: TicketStatus.PAID, // Defina o status como um valor válido de TicketStatus
        createdAt: new Date('2023-10-06T16:31:42.258Z'),
        updatedAt: new Date('2023-10-06T16:32:22.846Z'),
        TicketType: {
          id: 1,
          name: 'testenameType',
          price: 100,
          isRemote: false,
          includesHotel: true,
          createdAt: new Date('2023-10-06T13:31:30.412Z'),
          updatedAt: new Date('2023-10-06T13:31:30.412Z'),
        },
      };

      const mockEnrollmentResult = {
        id: 1,
        name: 'Kaio',
        cpf: '12345678909',
        birthday: new Date('1990-05-15T00:00:00.000Z'),
        phone: '(77)97777-7777',
        userId: 1,
        createdAt: new Date('2023-10-06T16:19:18.570Z'),
        updatedAt: new Date('2023-10-06T16:19:18.571Z'),
        Address: [
          {
            id: 1,
            cep: '63950-000',
            street: 'Rua Principal',
            city: 'Choró',
            state: 'CE',
            number: '123',
            neighborhood: 'Centro',
            addressDetail: 'fim do mundo',
            enrollmentId: 1,
            createdAt: new Date('2023-10-06T16:19:18.577Z'),
            updatedAt: new Date('2023-10-06T16:19:18.578Z'),
          },
        ],
      };
      // Simule a função isRoomFull retornando um quarto nulo, indicando que o quarto não existe
      jest.spyOn(bookingRepository, 'isRoomFull').mockResolvedValue({
        room: null,
        reservationCount: 0,
      });
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollmentResult);
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValue(mockTicketResult);
      // Chame a função createBooking e verifique se ela lança a exceção esperada
      await expect(bookingService.createBooking(userId, roomId)).rejects.toEqual({
        name: 'NotFoundBookingError',
        message: 'Room does not exist!',
      });
    });

    test('3 - should throw forbiddenError when room is fully occupied', async () => {
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

      const mockTicketResult = {
        id: 2,
        ticketTypeId: 1,
        enrollmentId: 1,
        status: TicketStatus.PAID,
        createdAt: new Date('2023-10-06T16:31:42.258Z'),
        updatedAt: new Date('2023-10-06T16:32:22.846Z'),
        TicketType: {
          id: 1,
          name: 'testenameType',
          price: 100,
          isRemote: false,
          includesHotel: true,
          createdAt: new Date('2023-10-06T13:31:30.412Z'),
          updatedAt: new Date('2023-10-06T13:31:30.412Z'),
        },
      };

      const mockEnrollmentResult = {
        id: 1,
        name: 'Kaio',
        cpf: '12345678909',
        birthday: new Date('1990-05-15T00:00:00.000Z'),
        phone: '(77)97777-7777',
        userId: 1,
        createdAt: new Date('2023-10-06T16:19:18.570Z'),
        updatedAt: new Date('2023-10-06T16:19:18.571Z'),
        Address: [
          {
            id: 1,
            cep: '63950-000',
            street: 'Rua Principal',
            city: 'Choró',
            state: 'CE',
            number: '123',
            neighborhood: 'Centro',
            addressDetail: 'fim do mundo',
            enrollmentId: 1,
            createdAt: new Date('2023-10-06T16:19:18.577Z'),
            updatedAt: new Date('2023-10-06T16:19:18.578Z'),
          },
        ],
      };

      // Use spyOn para substituir a implementação de isRoomFull
      jest.spyOn(bookingRepository, 'isRoomFull').mockResolvedValue(mockIsRoomFullResult);
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollmentResult);
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValue(mockTicketResult);

      // Chame a função createBooking e verifique se ela lança a exceção forbiddenError
      const result = bookingService.createBooking(userId, roomId);
      expect(result).rejects.toEqual({
        name: 'ForbiddenError',
        message: 'Quarto está totalmente ocupado',
      });
    });

    test('4 - should throw ForbiddenError when ticket is remote', async () => {
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
      const mockTicketResult = {
        id: 2,
        ticketTypeId: 1,
        enrollmentId: 1,
        status: TicketStatus.PAID,
        createdAt: new Date('2023-10-06T16:31:42.258Z'),
        updatedAt: new Date('2023-10-06T16:32:22.846Z'),
        TicketType: {
          id: 1,
          name: 'testenameType',
          price: 100,
          isRemote: true,
          includesHotel: true,
          createdAt: new Date('2023-10-06T13:31:30.412Z'),
          updatedAt: new Date('2023-10-06T13:31:30.412Z'),
        },
      };

      const mockEnrollmentResult = {
        id: 1,
        name: 'Kaio',
        cpf: '12345678909',
        birthday: new Date('1990-05-15T00:00:00.000Z'),
        phone: '(77)97777-7777',
        userId: 1,
        createdAt: new Date('2023-10-06T16:19:18.570Z'),
        updatedAt: new Date('2023-10-06T16:19:18.571Z'),
        Address: [
          {
            id: 1,
            cep: '63950-000',
            street: 'Rua Principal',
            city: 'Choró',
            state: 'CE',
            number: '123',
            neighborhood: 'Centro',
            addressDetail: 'fim do mundo',
            enrollmentId: 1,
            createdAt: new Date('2023-10-06T16:19:18.577Z'),
            updatedAt: new Date('2023-10-06T16:19:18.578Z'),
          },
        ],
      };

      // Use spyOn para substituir a implementação de isRoomFull
      jest.spyOn(bookingRepository, 'isRoomFull').mockResolvedValue(mockIsRoomFullResult);
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollmentResult);
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValue(mockTicketResult);

      // Chame a função createBooking e verifique se ela lança a exceção ForbiddenError
      const result = bookingService.createBooking(userId, roomId);
      await expect(result).rejects.toEqual({
        name: 'ForbiddenError',
        message: 'Ticket is remote',
      });
    });

    test('5 - should return status 403 if user ticket does not include hotel', async () => {
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
      const mockTicketResult = {
        id: 2,
        ticketTypeId: 1,
        enrollmentId: 1,
        status: TicketStatus.PAID,
        createdAt: new Date('2023-10-06T16:31:42.258Z'),
        updatedAt: new Date('2023-10-06T16:32:22.846Z'),
        TicketType: {
          id: 1,
          name: 'testenameType',
          price: 100,
          isRemote: true,
          includesHotel: false,
          createdAt: new Date('2023-10-06T13:31:30.412Z'),
          updatedAt: new Date('2023-10-06T13:31:30.412Z'),
        },
      };

      const mockEnrollmentResult = {
        id: 1,
        name: 'Kaio',
        cpf: '12345678909',
        birthday: new Date('1990-05-15T00:00:00.000Z'),
        phone: '(77)97777-7777',
        userId: 1,
        createdAt: new Date('2023-10-06T16:19:18.570Z'),
        updatedAt: new Date('2023-10-06T16:19:18.571Z'),
        Address: [
          {
            id: 1,
            cep: '63950-000',
            street: 'Rua Principal',
            city: 'Choró',
            state: 'CE',
            number: '123',
            neighborhood: 'Centro',
            addressDetail: 'fim do mundo',
            enrollmentId: 1,
            createdAt: new Date('2023-10-06T16:19:18.577Z'),
            updatedAt: new Date('2023-10-06T16:19:18.578Z'),
          },
        ],
      };

      // Use spyOn para substituir a implementação de isRoomFull
      jest.spyOn(bookingRepository, 'isRoomFull').mockResolvedValue(mockIsRoomFullResult);
      jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollmentResult);
      jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValue(mockTicketResult);

      // Chame a função createBooking e verifique se ela retorna o status 403
      const result = bookingService.createBooking(userId, roomId);
      await expect(result).rejects.toEqual({
        name: 'ForbiddenError',
        message: 'Ticket does not include Hotel',
      });
    });
  });
  test('6 - should return status 403 if user ticket is not paid', async () => {
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
    const mockTicketResult = {
      id: 2,
      ticketTypeId: 1,
      enrollmentId: 1,
      status: TicketStatus.RESERVED,
      createdAt: new Date('2023-10-06T16:31:42.258Z'),
      updatedAt: new Date('2023-10-06T16:32:22.846Z'),
      TicketType: {
        id: 1,
        name: 'testenameType',
        price: 100,
        isRemote: false,
        includesHotel: true,
        createdAt: new Date('2023-10-06T13:31:30.412Z'),
        updatedAt: new Date('2023-10-06T13:31:30.412Z'),
      },
    };

    const mockEnrollmentResult = {
      id: 1,
      name: 'Kaio',
      cpf: '12345678909',
      birthday: new Date('1990-05-15T00:00:00.000Z'),
      phone: '(77)97777-7777',
      userId: 1,
      createdAt: new Date('2023-10-06T16:19:18.570Z'),
      updatedAt: new Date('2023-10-06T16:19:18.571Z'),
      Address: [
        {
          id: 1,
          cep: '63950-000',
          street: 'Rua Principal',
          city: 'Choró',
          state: 'CE',
          number: '123',
          neighborhood: 'Centro',
          addressDetail: 'fim do mundo',
          enrollmentId: 1,
          createdAt: new Date('2023-10-06T16:19:18.577Z'),
          updatedAt: new Date('2023-10-06T16:19:18.578Z'),
        },
      ],
    };

    // Use spyOn para substituir a implementação de isRoomFull
    jest.spyOn(bookingRepository, 'isRoomFull').mockResolvedValue(mockIsRoomFullResult);
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollmentResult);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValue(mockTicketResult);

    // Chame a função createBooking e verifique se ela retorna o status 403
    const result = bookingService.createBooking(userId, roomId);
    expect(result).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Ticket is not PAID',
    });
  });
});

describe('PUT /booking', () => {
  it('not have a booking for this room', async () => {
    jest.spyOn(bookingRepository, 'getRoomByUserId').mockImplementationOnce((): any => {
      return null;
    });

    const promise = bookingService.putBookingByUserId(1, 1, 1);

    await expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'User does not have a booking for this room',
    });
  });

  // it('room not', async () => {
  //   jest.spyOn(bookingRepository, 'getRoomByUserId').mockImplementationOnce((): any => {
  //     return {
  //       capacity: 1,
  //       _count: {
  //         Booking: 1,
  //       },
  //     };
  //   });

  //   const promise = bookingService.putBookingByUserId(1, 1, 1);

  //   try {
  //     await promise;
  //   } catch (error) {
  //     console.error('Caught error:', error);
  //     expect(error).toEqual({
  //       name: 'NotFoundBookingError',
  //       message: 'Room not exist',
  //     });
  //   }
  // });

  // it('Room not exist', async () => {
  //   jest.spyOn(bookingRepository, 'isRoomFull').mockImplementationOnce((): any => {
  //     return {
  //       capacity: 10,
  //       _count: {
  //         Booking: 1,
  //       },
  //     };
  //   });
  //   jest.spyOn(bookingRepository, 'getRoomByUserId').mockImplementationOnce((): any => {
  //     return {
  //       Booking: 1,
  //     };
  //   });
  //   const promise = bookingService.putBookingByUserId(1, 1, 1);
  //   expect(promise).toEqual({
  //     name: 'NotFoundBookingError',
  //     message: 'Room not exist',
  //   });
  // });

  // it('Should return the booking when the user edit it', async () => {
  //   jest.spyOn(bookingRepository, 'getRoomByUserId').mockImplementationOnce((): any => {
  //     return {
  //       capacity: 10,
  //       _count: {
  //         Booking: 1,
  //       },
  //     };
  //   });
  //   jest.spyOn(bookingRepository, 'isRoomFull').mockImplementationOnce((): any => {
  //     return {
  //       Booking: {},
  //     };
  //   });
  //   const id = 1;
  //   jest.spyOn(bookingRepository, 'putBookingByUserIdRepository').mockImplementationOnce((): any => {
  //     return {
  //       id,
  //     };
  //   });
  //   const promise = bookingService.putBookingByUserId(1, 1, 1);
  //   expect(promise).resolves.toEqual({ bookingId: id });
  // });
});
