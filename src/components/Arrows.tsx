interface PropType {
    size?: number
}

export const LeftArrow = ({size}: PropType) => {
    return (
      <svg
        width={size ?? "800px"}
        height={size ?? "800px"}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 7L10 12L15 17"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
};

export const RightArrow = ({ size }: PropType) => {
  return (
    <svg
      width={size ?? "800px"}
      height={size ?? "800px"}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 7L15 12L10 17"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};