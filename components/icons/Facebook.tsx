import Svg, { SvgProps, Path } from "react-native-svg";
import { memo } from "react";
const SvgComponent = (props: SvgProps & { size?: number }) => (
  <Svg
    {...props}
    width={props.size}
    height={props.size}
    className="icon flat-color"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={3}
    data-name="Flat Color"
    viewBox="0 0 24 24"
  >
    <Path d="M14 6h3a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-3a5 5 0 0 0-5 5v3H7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2v7a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-7h2.22a1 1 0 0 0 1-.76l.5-2a1 1 0 0 0-1-1.24H13V7a1 1 0 0 1 1-1Z" />
  </Svg>
);
const Memo = memo(SvgComponent);
export { Memo as FacebookSvg };
