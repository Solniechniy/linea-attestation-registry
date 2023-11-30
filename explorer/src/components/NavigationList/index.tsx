import { Dispatch, Fragment, SetStateAction } from 'react';

import { NavLink } from '@/components/NavLink';
import { DEFAULT_ROUTES } from '@/constants/components';
import { ListItemWithSubmenu } from './components/ListItemWithSubmenu';

export const NavigationList: React.FC<{ setIsOpened?: Dispatch<SetStateAction<boolean>> }> = ({ setIsOpened }) => {
  return (
    <div className="flex flex-col justify-center ms-8 gap-6 self-stretch sm:ms-20 lg:ms-0 lg:items-center lg:flex-row lg:justify-start">
      {DEFAULT_ROUTES.map(({ name, route, submenu }) => (
        <Fragment key={name}>
          {route ? (
            <NavLink
              onClick={() => setIsOpened?.(false)}
              to={route}
              className={({ isActive }) =>
                `${isActive ? 'text-zinc-950' : 'text-slate-500'} text-xl lg:text-base font-medium hover:underline`
              }
            >
              {name}
            </NavLink>
          ) : (
            submenu && <ListItemWithSubmenu name={name} submenu={submenu} />
          )}
        </Fragment>
      ))}
    </div>
  );
};
