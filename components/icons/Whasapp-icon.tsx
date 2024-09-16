import Svg, { SvgProps, Path } from "react-native-svg";
import { memo } from "react";
const SvgComponent = (props: SvgProps & { size?: number }) => (
  <Svg
    {...props}
    width={props.size}
    height={props.size}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={3}
    className="lucide lucide-message-circle-dashed"
  >
    <Path d="M13.5 3.1c-.5 0-1-.1-1.5-.1s-1 .1-1.5.1M19.3 6.8a10.45 10.45 0 0 0-2.1-2.1M20.9 13.5c.1-.5.1-1 .1-1.5s-.1-1-.1-1.5M17.2 19.3a10.45 10.45 0 0 0 2.1-2.1M10.5 20.9c.5.1 1 .1 1.5.1s1-.1 1.5-.1M3.5 17.5 2 22l4.5-1.5M3.1 10.5c0 .5-.1 1-.1 1.5s.1 1 .1 1.5M6.8 4.7a10.45 10.45 0 0 0-2.1 2.1" />
  </Svg>
);
const Memo = memo(SvgComponent);
export { Memo as WhatsAppStatus };
