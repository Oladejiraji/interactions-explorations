export const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="10"
    fill="none"
    viewBox="0 0 10 10"
  >
    <path
      fill="#242424"
      d="M4.25 5.75H.75a.73.73 0 0 1-.534-.214A.72.72 0 0 1 0 5.004q0-.316.216-.535A.72.72 0 0 1 .75 4.25h3.5V.75q0-.319.214-.534A.72.72 0 0 1 4.996 0q.316 0 .535.216A.72.72 0 0 1 5.75.75v3.5h3.5q.319 0 .534.214a.72.72 0 0 1 .216.532q0 .316-.216.535a.72.72 0 0 1-.534.219h-3.5v3.5q0 .319-.214.534a.72.72 0 0 1-.532.216.73.73 0 0 1-.535-.216.72.72 0 0 1-.219-.534z"
    ></path>
  </svg>
);

export const RightIcon = ({
  className,
  pathClassName,
}: {
  className?: string;
  pathClassName?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="9"
    height="8"
    fill="none"
    viewBox="0 0 9 8"
    className={className}
  >
    <path
      fill="#C3C3C5"
      className={pathClassName}
      d="M6.125 4.75H.75a.72.72 0 0 1-.531-.219A.72.72 0 0 1 0 4q0-.313.219-.531a.72.72 0 0 1 .531-.22h5.375L4.458 1.584a.73.73 0 0 1 0-1.062.73.73 0 0 1 1.063 0l2.958 2.958q.23.23.23.52a.72.72 0 0 1-.23.522L5.521 7.479a.7.7 0 0 1-.531.219.77.77 0 0 1-.532-.24.73.73 0 0 1 0-1.062z"
    ></path>
  </svg>
);
