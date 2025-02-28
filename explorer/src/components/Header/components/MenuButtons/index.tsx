import { motion } from "framer-motion";

interface MenuButtonProps {
  isOpened: boolean;
  className?: string;
  color?: string;
  onClick: () => void;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ isOpened, onClick, className, color = "#64687D" }) => {
  const variant = isOpened ? "opened" : "closed";
  const top = {
    closed: {
      rotate: 0,
      translateY: 0,
    },
    opened: {
      rotate: 45,
      translateY: 2,
    },
  };
  const center = {
    closed: {
      opacity: 1,
    },
    opened: {
      opacity: 0,
    },
  };
  const bottom = {
    closed: {
      rotate: 0,
      translateY: 0,
    },
    opened: {
      rotate: -45,
      translateY: -2,
    },
  };
  const lineProps = {
    stroke: color,
    strokeWidth: 3,
    vectorEffect: "non-scaling-stroke",
    initial: "closed",
    animate: variant,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  };
  const width = 20;
  const height = 13;
  const unitHeight = 4;
  const unitWidth = (unitHeight * (width as number)) / (height as number);

  return (
    <motion.svg
      viewBox={`0 0 ${unitWidth} ${unitHeight}`}
      overflow="visible"
      style={{ zIndex: 100 }}
      preserveAspectRatio="none"
      width={width}
      height={height}
      onClick={onClick}
      cursor="pointer"
      className={className}
    >
      <motion.line x1="0" x2={unitWidth} y1="0" y2="0" strokeLinecap="round" variants={top} {...lineProps} />
      <motion.line x1="0" x2={unitWidth} y1="2" y2="2" strokeLinecap="round" variants={center} {...lineProps} />
      <motion.line x1="0" x2={unitWidth} y1="4" y2="4" strokeLinecap="round" variants={bottom} {...lineProps} />
    </motion.svg>
  );
};
