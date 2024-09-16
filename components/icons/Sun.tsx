import Svg, { SvgProps, Path } from "react-native-svg";
import { memo } from "react";
const SvgComponent = (props: SvgProps & { size?: number }) => (
  <Svg
    {...props}
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="lucide lucide-sun-moon"
  >
    <Path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" />
  </Svg>
);
const Memo = memo(SvgComponent);
export { Memo as SunSVG };
