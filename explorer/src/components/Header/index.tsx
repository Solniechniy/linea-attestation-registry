import { ConnectKitButton } from 'connectkit';
import { Dispatch, SetStateAction } from 'react';
import { ChevronDown } from 'lucide-react';

import logo from '@/assets/logo/header-logo.svg';

import { Link } from '@/components/Link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chains } from '@/config';
import { useNetworkContext } from '@/providers/network-provider/context';
import { APP_ROUTES } from '@/routes/constants';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { cropString } from '@/utils/stringUtils';

import { NavigationList } from '../NavigationList';
import { MenuButton } from './components/MenuButtons';
import './styles.css';

interface HeaderProps {
  isOpened: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
}

export const Header: React.FC<HeaderProps> = ({ isOpened, setIsOpened }) => {
  const { network, setNetwork } = useNetworkContext();
  const screen = useWindowDimensions();
  const isAdaptive = screen.sm || screen.md;

  return (
    <div className="px-5 md:px-14 xl:px-[60px] py-3 justify-between items-center inline-flex">
      <div className="justify-start items-center gap-12 flex self-stretch">
        <Link to={APP_ROUTES.HOME} className="shrink-0 hover:opacity-70">
          <img src={logo} className="h-6 xl:h-9 cursor-pointer" alt="Verax logo" />
        </Link>
        {!isAdaptive && <NavigationList />}
      </div>
      <div className="justify-start items-center gap-4 flex">
        <DropdownMenu>
          <DropdownMenuTrigger className="DropdownMenuTrigger select-none w-[72px] p-2 rounded-md outline-none hover:bg-lime-100 justify-start items-center gap-2 inline-flex">
            <img src={network.img} className="w-6 h-6 relative" alt="Linea logo" />
            <ChevronDown className="header-arrow w-6 h-6 relative" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="flex flex-col gap-2">
            {chains.map((chain) => (
              <DropdownMenuItem
                key={chain.name}
                className="flex gap-2 focus:bg-lime-100 cursor-pointer"
                onClick={() => setNetwork(chain)}
              >
                <img src={chain.img} className="w-6 h-6" alt={chain.name} />
                {chain.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ConnectKitButton.Custom>
          {({ isConnected, show, address }) => {
            return (
              <button
                onClick={show}
                className="cursor-pointer px-3 h-9 xl:h-12 xl:px-4 gap-2 rounded-md border border-zinc-200 justify-center items-center inline-flex whitespace-nowrap hover:border-slate-500"
              >
                {address && isConnected ? cropString(address) : screen.sm ? 'Connect' : 'Connect Wallet'}
                {!isAdaptive && <ChevronDown />}
              </button>
            );
          }}
        </ConnectKitButton.Custom>
        {isAdaptive && <MenuButton isOpened={isOpened} color="#64687D" onClick={() => setIsOpened((prev) => !prev)} />}
      </div>
    </div>
  );
};
