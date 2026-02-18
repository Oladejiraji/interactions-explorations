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

export const BanderasLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    fill="none"
    viewBox="0 0 22 22"
  >
    <rect width="22" height="22" fill="#151515" rx="4"></rect>
    <path
      fill="#fff"
      d="M8.035 15V6.6h3.42c1.596 0 2.76.624 2.76 2.112 0 .984-.708 1.608-1.512 1.848 1.044.264 1.74.972 1.74 2.052 0 1.824-1.56 2.388-3.228 2.388zm3.3-1.128c1.2 0 1.74-.468 1.74-1.356 0-.852-.48-1.344-1.764-1.344H9.355v2.7zm-.06-3.816c1.056 0 1.572-.444 1.572-1.2 0-.684-.432-1.14-1.524-1.14H9.355v2.34z"
    ></path>
  </svg>
);

export const DashboardPlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 15 15"
  >
    <path
      fill="#737373"
      d="M6.667 14.167a.833.833 0 0 0 1.666 0V8.333h5.834a.833.833 0 0 0 0-1.666H8.333V.833a.833.833 0 1 0-1.666 0v5.834H.833a.833.833 0 1 0 0 1.666h5.834z"
    ></path>
  </svg>
);

export const HouseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="16"
    fill="none"
    viewBox="0 0 15 16"
  >
    <path
      fill="#737373"
      fillRule="evenodd"
      d="M6.5.333a1.67 1.67 0 0 1 2 0l5.833 4.375A1.67 1.67 0 0 1 15 6.042v7.916a1.666 1.666 0 0 1-1.667 1.667H9.25a.917.917 0 0 1-.917-.917V9.792a.833.833 0 1 0-1.666 0v4.916a.917.917 0 0 1-.917.917H1.667A1.667 1.667 0 0 1 0 13.958V6.042a1.67 1.67 0 0 1 .667-1.334zm1 1.334L1.667 6.042v7.916H5V9.792a2.5 2.5 0 1 1 5 0v4.166h3.333V6.042z"
      clipRule="evenodd"
    ></path>
  </svg>
);

export const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
  >
    <path
      fill="#737373"
      fillRule="evenodd"
      d="M7.083 0a7.083 7.083 0 1 0 4.385 12.647l3.043 3.043a.833.833 0 0 0 1.178-1.178l-3.043-3.044A7.084 7.084 0 0 0 7.083 0M1.666 7.083a5.417 5.417 0 1 1 10.833 0 5.417 5.417 0 0 1-10.833 0"
      clipRule="evenodd"
    ></path>
  </svg>
);

export const DoubleArrowsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="6"
    height="10"
    fill="none"
    viewBox="0 0 6 10"
  >
    <path
      fill="#737373"
      d="m1.72 6.293 1.292 1.293 1.293-1.293A1 1 0 0 1 5.72 7.707l-2 2a1 1 0 0 1-1.414 0l-2-2A1 1 0 1 1 1.72 6.293m0-2.586 1.292-1.293 1.293 1.293A1 1 0 0 0 5.72 2.293l-2-2a1 1 0 0 0-1.414 0l-2 2A1 1 0 0 0 1.72 3.707"
    ></path>
  </svg>
);

export const AnalyzeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    fill="none"
    viewBox="0 0 15 15"
  >
    <path
      fill="#737373"
      d="M1.667 1.667v11.666h11.666V1.667zM5 10.417h5v-.834H5zm0-5h1.667v-.834H5zm6.667 5.416-.007.128a1.25 1.25 0 0 1-1.116 1.117l-.127.005H4.583a1.25 1.25 0 0 1-1.243-1.122l-.007-.128V9.167a1.25 1.25 0 0 1 1.25-1.25h5.834a1.25 1.25 0 0 1 1.25 1.25zm-3.334-5-.006.128A1.25 1.25 0 0 1 7.21 7.077l-.128.006h-2.5A1.25 1.25 0 0 1 3.34 5.961l-.007-.128V4.167a1.25 1.25 0 0 1 1.25-1.25h2.5a1.25 1.25 0 0 1 1.25 1.25zm6.667 7.5A1.666 1.666 0 0 1 13.333 15H1.667A1.667 1.667 0 0 1 0 13.333V1.667A1.667 1.667 0 0 1 1.667 0h11.666A1.666 1.666 0 0 1 15 1.667z"
    ></path>
  </svg>
);

export const ThreeDotsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="3"
    fill="none"
    viewBox="0 0 13 3"
  >
    <path
      fill="#737373"
      d="M1.25 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5"
    ></path>
  </svg>
);

export const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="12"
    fill="none"
    viewBox="0 0 15 12"
  >
    <path
      fill="#737373"
      d="M9.167 10a.833.833 0 0 1 .097 1.66l-.097.007H5.833a.834.834 0 0 1-.097-1.661L5.833 10zm2.5-5a.833.833 0 0 1 0 1.667H3.333a.833.833 0 0 1 0-1.667zm2.5-5a.833.833 0 0 1 0 1.667H.833A.833.833 0 0 1 .833 0z"
    ></path>
  </svg>
);

export const ExportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="17"
    fill="none"
    viewBox="0 0 15 17"
  >
    <path
      fill="#fff"
      d="M14.167 10.833a.833.833 0 0 1 .833.834V15a1.667 1.667 0 0 1-1.667 1.667H1.667A1.667 1.667 0 0 1 0 15v-3.333a.833.833 0 0 1 1.667 0V15h11.666v-3.333a.833.833 0 0 1 .834-.834M7.5 0a.833.833 0 0 1 .833.833V9.37l2.114-2.113a.832.832 0 1 1 1.178 1.178l-3.388 3.389a1.04 1.04 0 0 1-1.474 0L3.375 8.434a.833.833 0 1 1 1.178-1.178l2.114 2.113V.833A.833.833 0 0 1 7.5 0"
    ></path>
  </svg>
);

export const LeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="6"
    height="9"
    fill="none"
    viewBox="0 0 6 9"
  >
    <path
      fill="#737373"
      fillRule="evenodd"
      d="M.195 4.917a.667.667 0 0 1 0-.943L3.966.203a.667.667 0 1 1 .943.942l-3.3 3.3 3.3 3.3a.667.667 0 0 1-.943.943z"
      clipRule="evenodd"
    ></path>
  </svg>
);
