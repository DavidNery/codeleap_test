import type { RefAttributes } from "react";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & RefAttributes<HTMLInputElement>) => {
  return (
    <input {...props} className={`${props.className} py-2 px-3 text-sm border border-[#777] rounded-lg outline-0`} />
  );
};

export default Input;