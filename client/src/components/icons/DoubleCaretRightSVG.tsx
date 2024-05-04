import { IconTypes } from "./IconTypes";

export const DoubleCaretRightSVG: React.FC<IconTypes> = ({
  color,
  height,
  width,
  className,
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 38 29"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.76923 0H0V2.61L10.8951 14.5L0 26.39V29H8.76923L22.0559 14.5L8.76923 0Z"
        fill="#454545"
      />
      <path
        d="M24.7133 0H15.9441V2.61L26.8392 14.5L15.9441 26.39V29H24.7133L38 14.5L24.7133 0Z"
        fill="#454545"
      />
    </svg>
  );
};
