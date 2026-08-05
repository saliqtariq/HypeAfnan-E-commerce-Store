/**
 * Reusable SVG icon components used across the application.
 * Each icon accepts optional width, height, and color props for flexibility.
 */

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function CategoryIcon({
  width = 18,
  height = 14,
  color = "#1A1A1A",
  className,
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0 0H7V2H0V0ZM0 4H7V6H0V4ZM0 8H7V10H0V8ZM0 12H7V14H0V12Z"
        fill={color}
      />
      <path
        d="M10 1H18V3H10V1ZM10 5H18V7H10V5ZM10 9H18V11H10V9Z"
        fill={color}
      />
    </svg>
  );
}

export function SearchIcon({
  width = 16,
  height = 16,
  color = "#1A1A1A",
  className,
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11.7422 10.3439C12.5329 9.2673 13 7.9382 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C7.93858 13 9.26802 12.5327 10.3448 11.7416L14.2929 15.7071L15.7071 14.2929L11.7422 10.3439ZM11 6.5C11 8.98528 8.98528 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5Z"
        fill={color}
      />
    </svg>
  );
}

export function GlobeIcon({
  width = 20,
  height = 24,
  color = "#1A1A1A",
  className,
}: IconProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-[2px]">
      <svg
        width={width}
        height={width}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20C15.523 20 20 15.523 20 10C20 4.477 15.523 0 10 0ZM17.91 9H14.948C14.832 6.648 14.18 4.462 13.1 2.726C15.609 3.768 17.518 6.147 17.91 9ZM10 18C9.476 18 8.41 16.37 8.064 13H11.936C11.59 16.37 10.524 18 10 18ZM7.87 11C7.809 10.378 7.774 9.717 7.774 9.028C7.774 8.863 7.778 8.543 7.786 8.19L7.8 7.715C7.82 7.292 7.851 6.884 7.894 6.5H12.106C12.149 6.884 12.18 7.292 12.2 7.715L12.214 8.19C12.222 8.543 12.226 8.863 12.226 9.028C12.226 9.717 12.191 10.378 12.13 11H7.87ZM2 10C2 9.648 2.034 9.318 2.09 9H5.052C5.036 9.328 5.028 9.663 5.028 10.028C5.028 10.363 5.035 10.688 5.048 11H2.09C2.034 10.682 2 10.348 2 10ZM2.09 13H5.128C5.308 14.132 5.59 15.186 5.966 16.106C3.996 15.13 2.512 13.27 2.09 13ZM6.9 2.726C5.82 4.462 5.168 6.648 5.052 9H2.09C2.482 6.147 4.391 3.768 6.9 2.726ZM13.034 16.106C13.41 15.186 13.692 14.132 13.872 13H16.91C16.488 13.27 15.004 15.13 13.034 16.106ZM14.948 11C14.965 10.688 14.972 10.363 14.972 10.028C14.972 9.663 14.964 9.328 14.948 9H17.91C17.966 9.318 18 9.652 18 10C18 10.348 17.966 10.682 17.91 11H14.948Z"
          fill={color}
        />
      </svg>
      <svg
        width="8"
        height="5"
        viewBox="0 0 8 5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M4 5L0 0H8L4 5Z" fill={color} />
      </svg>
    </div>
  );
}
