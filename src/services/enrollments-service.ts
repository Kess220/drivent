import { Address, Enrollment } from '@prisma/client';
import { request } from '@/utils/request';
import { notFoundError } from '@/errors';
import { addressRepository, CreateAddressParams, enrollmentRepository, CreateEnrollmentParams } from '@/repositories';
import { exclude } from '@/utils/prisma-utils';

// TODO - Receber o CEP por parâmetro nesta função.
async function getAddressFromCEP(cep: string): Promise<AddressInfo | ErrorResponse> {
  try {
    const formatedCep = cep.replace('-', '').trim();

    if (!/^\d{8}$/.test(formatedCep)) {
      return { error: 'CEP inválido' };
      // Verifica se o CEP é um número válido
    }

    // FIXME: está com CEP fixo!
    const result = await request.get(`${process.env.VIA_CEP_API}/${formatedCep}/json/`);

    // Verifique se o CEP é válido, mas o endereço é inexistente
    if (result.data.erro === true) {
      return { error: 'CEP não encontrado' };
    }

    // TODO: Tratar regras de negócio e lanças eventuais erros

    // FIXME: não estamos interessados em todos os campos

    // Mapeie as informações do endereço conforme necessário
    const addressInfo: AddressInfo = {
      street: result.data.logradouro,
      addressDetail: result.data.complemento,
      neighborhood: result.data.bairro,
      city: result.data.localidade,
      state: result.data.uf,
      cep: formatedCep,
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

async function createOrUpdateEnrollmentWithAddress(params: CreateOrUpdateEnrollmentWithAddress) {
  try {
    // Valide o CEP antes de prosseguir
    const cep = params.address.cep;
    // Converta a data de nascimento para um objeto Date
    params.birthday = new Date(params.birthday);

    const number = params.address.number;

    const addressFromApi = await getAddressFromCEP(cep);

    const completeAddress: CreateAddressParams = { ...(addressFromApi as CreateAddressParams), number };

    // Execute a operação de upsert para matrícula
    const enrollmentWithoutAddress = exclude(params, 'address');

    const newEnrollment = await enrollmentRepository.upsert(
      params.userId,
      enrollmentWithoutAddress,
      exclude(enrollmentWithoutAddress, 'userId'),
    );

    // Execute a operação de upsert para o endereço
    const address = getAddressForUpsert(completeAddress);
    await addressRepository.upsert(newEnrollment.id, address, address);
  } catch (error) {
    // Lide com erros aqui, por exemplo, registrando ou lançando exceções superiores
    console.error(error);
  }
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

type AddressInfo = Omit<CreateAddressParams, 'number'>;
