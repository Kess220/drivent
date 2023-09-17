import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { enrollmentsService } from '@/services';

export async function getEnrollmentByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const enrollmentWithAddress = await enrollmentsService.getOneWithAddressByUserId(userId);

  return res.status(httpStatus.OK).send(enrollmentWithAddress);
}

export async function postCreateOrUpdateEnrollment(req: AuthenticatedRequest, res: Response) {
  await enrollmentsService.createOrUpdateEnrollmentWithAddress({
    ...req.body,
    userId: req.userId,
  });

  return res.sendStatus(httpStatus.OK);
}

// TODO - Receber o CEP do usuário por query params.
export async function getAddressFromCEP(req: AuthenticatedRequest, res: Response) {
  try {
    // Obtenha o CEP dos query parameters
    const { cep } = req.query;

    // Verifique se o CEP foi fornecido
    if (!cep || typeof cep !== 'string') {
      return res.status(httpStatus.BAD_REQUEST).json({ error: 'CEP inválido' });
    }

    // Chame a função getAddressFromCEP com o CEP fornecido
    const address = await enrollmentsService.getAddressFromCEP(cep);

    // Envie a resposta com as informações de endereço
    res.status(httpStatus.OK).send(address);
  } catch (error) {
    console.error('Erro ao buscar informações de endereço:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Erro interno do servidor' });
  }
}
