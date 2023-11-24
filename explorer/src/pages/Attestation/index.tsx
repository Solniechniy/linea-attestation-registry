import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { Attestation as AttestationProps } from '@verax-attestation-registry/verax-sdk/lib/types/.graphclient';

import { useNetworkContext } from '@/providers/network-provider';
import { SWRKeys } from '@/interfaces/swr/enum';
import { EMPTY_STRING } from '@/constants';

import { AttestationDates } from './AttestationDates';
import { AttestationInfo } from './AttestationInfo';
import { AttestationData } from './AttestationData';
import { RelatedAttestations } from './RelatedAttestations';

export const Attestation = () => {
  const { id } = useParams();
  const { sdk } = useNetworkContext();

  const { data: attestation, isLoading } = useSWR(
    SWRKeys.GET_ATTESTATION_BY_ID,
    () => sdk.attestation.findOneById(id || EMPTY_STRING) as Promise<AttestationProps>
  );
  //todo add loading
  if (isLoading) return <p>Loading...</p>;
  //todo add not found
  if (!attestation) return null;

  return (
    <div className="justify-center mt-20 grid auto-rows-auto auto-cols-max gap-6 [&>div:first-child]:col-span-2 [&>div:nth-child(2)]:row-span-2 [&>div:nth-child(2)]:row-start-2 [&>div:nth-child(3)]:row-start-2 [&>div:nth-child(4)]:col-start-2 [&>div:nth-child(4)]:row-start-3">
      <AttestationDates {...attestation} />
      <AttestationInfo {...attestation} />
      <AttestationData attestation={attestation} />
      <RelatedAttestations attestation={attestation} />
    </div>
  );
};
