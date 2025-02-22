import Svg, { SvgProps, Path } from "react-native-svg";
import { memo } from "react";
const VideoSvgComponent = (props: SvgProps & { size?: number }) => (
  <Svg
    {...props}
    width={props.size || 24}
    height={props.size || 24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={3}
    className="lucide lucide-youtube"
  >
    <Path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <Path d="m10 15 5-3-5-3z" />
  </Svg>
);
const Memo = memo(VideoSvgComponent);
export { Memo as VideoSvg };
