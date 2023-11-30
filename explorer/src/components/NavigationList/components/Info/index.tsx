import { useState } from 'react';
import { MoveUpRight } from 'lucide-react';

import { Link } from '@/components/Link';
import { INFO_LIST } from '@/constants/components';
import useWindowDimensions from '@/hooks/useWindowDimensions';

const DesktopLink: React.FC<{ title: string; logo: string; url: string }> = ({ title, logo, url }) => {
  const [show, setShow] = useState<boolean>(false);
  return (
    <a
      key={title}
      href={url}
      target="_blank"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      className="w-52 rounded px-2 py-[10px] flex gap-2 items-center text-[#9096B2] hover:bg-lime-100 hover:text-zinc-950"
    >
      <img src={logo} alt={title} className="!w-4 !h-4 shrink-0" />
      <span className="flex-1">{title}</span>
      <MoveUpRight width={16} height={16} className={`${show ? 'visible' : 'invisible'}`} />
    </a>
  );
};

export const Info: React.FC = () => {
  const screen = useWindowDimensions();
  const isAdaptive = screen.sm || screen.md;

  return (
    <div className="flex flex-col gap-2 text-sm lg:absolute lg:border lg: border-zinc-200 lg:rounded-xl lg:p-2 lg:top-[30px] lg:-left-[15px] xl:top-[40px]">
      {INFO_LIST.map((items) =>
        !isAdaptive ? (
          <DesktopLink key={items.title} {...items} />
        ) : (
          <a
            key={items.title}
            href={items.url}
            target="_blank"
            className="w-fit rounded px-2 py-[10px] ms-4 flex gap-2 items-center text-xl   text-slate-500 hover:underline hover:text-zinc-950"
          >
            <img src={items.logo} alt={items.title} className="!w-[18px] !h-[18px] shrink-0" />
            <span>{items.title}</span>
          </a>
        )
      )}
    </div>
  );
};
