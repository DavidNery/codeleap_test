import type { RefAttributes } from "react";

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & RefAttributes<HTMLTextAreaElement>) => {
  return (
    <textarea {...props} className={`${props.className} py-2 px-3 text-sm border border-[#777] rounded-lg outline-0 min-h-10`}></textarea>
  );
};

export default Textarea;