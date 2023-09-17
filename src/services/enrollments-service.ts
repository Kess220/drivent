import { Address, Enrollment } from '@prisma/client';
import { request } from '@/utils/request';
import { notFoundError } from '@/errors';
import { addressRepository, CreateAddressParams, enrollmentRepository, CreateEnrollmentParams } from '@/repositories';
import { exclude } from '@/utils/prisma-utils';

// TODO - Receber o CEP por parâmetro nesta função.
async function getAddressFromCEP(cep: string): Promise<AddressInfo | ErrorResponse> {
  try {
    if (!/^\d{8}$/.test(cep)) {
      return { error: 'CEP inválido' };
      // Verifica se o CEP é um número válido
    }

    // FIXME: está com CEP fixo!
    const result = await request.get(`${process.env.VIA_CEP_API}/${cep}/json/`);

    // Verifique se o CEP é válido, mas o endereço é inexistente
    if (result.data.erro === true) {
      return { error: 'CEP não encontrado' };
    }

    // TODO: Tratar regras de negócio e lanças eventuais erros

    // FIXME: não estamos interessados em todos os campos

    // Mapeie as informações do endereço conforme necessário
    const addressInfo: AddressInfo = {
      logradouro: result.data.logradouro,
      complemento: result.data.complemento,
      bairro: result.data.bairro,
      cidade: result.data.localidade,
      uf: result.data.uf,
    };

    return addressInfo;
  } catch (error) {
    // Lance eventuais erros
    throw error;
  }
}

async function getOneWithAddressByUserId(userId: number): Promise<GetOneWithAddressByUserIdResult> {
  const enrollmentWithAddress = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollmentWithAddress) throw notFoundError();

  const [firstAddress] = enrollmentWithAddress.Address;
  const address = getFirstAddress(firstAddress);

  return {
    ...exclude(enrollmentWithAddress, 'userId', 'createdAt', 'updatedAt', 'Address'),
    ...(!!address && { address }),
  };
}

type GetOneWithAddressByUserIdResult = Omit<Enrollment, 'userId' | 'createdAt' | 'updatedAt'>;

function getFirstAddress(firstAddress: Address): GetAddressResult {
  if (!firstAddress) return null;

  return exclude(firstAddress, 'createdAt', 'updatedAt', 'enrollmentId');
}

type GetAddressResult = Omit<Address, 'createdAt' | 'updatedAt' | 'enrollmentId'>;

// async function createOrUpdateEnrollmentWithAddress(params: CreateOrUpdateEnrollmentWithAddress) {
//   try {
//     // Valide o CEP antes de prosseguir
//     const cep = params.address.cep;
//     if (!/^\d{8}$/.test(cep)) {
//       throw new Error('CEP inválido');
//     }

//     // Converta a data de nascimento para um objeto Date
//     params.birthday = new Date(params.birthday);

//     // Execute a operação de upsert para matrícula
//     const enrollmentData = exclude(params, 'address');
//     const newEnrollment = await enrollmentRepository.upsert(
//       params.userId,
//       enrollmentData,
//       exclude(enrollmentData, 'userId'),
//     );

//     // Execute a operação de upsert para o endereço
//     const address = getAddressForUpsert(cep);
//     // const address = getAddressForUpsert(cep);
//     await addressRepository.upsert(newEnrollment.id, address, address);
//   } catch (error) {
//     // Lide com erros aqui, por exemplo, registrando ou lançando exceções superiores
//     console.error(error);
//   }
// }
async function createOrUpdateEnrollmentWithAddress(params: CreateOrUpdateEnrollmentWithAddress) {
  const enrollment = exclude(params, 'address');
  enrollment.birthday = new Date(enrollment.birthday);
  const address = getAddressForUpsert(params.address);

  // TODO - Verificar se o CEP é válido antes de associar ao enrollment.
  await getAddressFromCEP(params.address.cep);

  const newEnrollment = await enrollmentRepository.upsert(params.userId, enrollment, exclude(enrollment, 'userId'));

  await addressRepository.upsert(newEnrollment.id, address, address);
}

function getAddressForUpsert(address: CreateAddressParams) {
  return {
    ...address,
    ...(address?.addressDetail && { addressDetail: address.addressDetail }),
  };
}

export type CreateOrUpdateEnrollmentWithAddress = CreateEnrollmentParams & {
  address: CreateAddressParams;
};

export const enrollmentsService = {
  getOneWithAddressByUserId,
  createOrUpdateEnrollmentWithAddress,
  getAddressFromCEP,
};

type ErrorResponse = {
  error: string;
};

type AddressInfo = {
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};
