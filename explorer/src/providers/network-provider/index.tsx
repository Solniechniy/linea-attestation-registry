import React, { PropsWithChildren, useState } from 'react';
import { useLoaderData } from 'react-router-dom';

import VeraxSdk from '@verax-attestation-registry/verax-sdk';
import { defaultChain } from '@/config';
import { INetwork } from '@/interfaces/config';

import { NetworkContext } from './context';

export const NetworkContextProvider: React.FC<PropsWithChildren> = ({ children }): JSX.Element => {
  const retrievedNetwork = useLoaderData() as INetwork;

  const [network, setNetwork] = useState<INetwork>(retrievedNetwork);
  const [sdk, setSdk] = useState<VeraxSdk>(new VeraxSdk(defaultChain.veraxEnv));

  const setNetworkHandler = (params: INetwork) => {
    //todo: change network in url
    setSdk(new VeraxSdk(params.veraxEnv));
    return setNetwork(params);
  };

  return (
    <NetworkContext.Provider
      value={{
        sdk,
        network,
        setNetwork: setNetworkHandler,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
