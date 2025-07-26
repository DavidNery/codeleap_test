import type { RefAttributes } from "react";

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & RefAttributes<HTMLSelectElement>) => {
  return (
    <select {...props} className={`${props.className} py-2 px-3 text-sm border border-[#777] rounded-lg outline-0`}>
      {props.children}
    </select>
  );
};

export default Select;